#!/usr/bin/env bash
#
# Pre-flight check before recording or presenting the demo.
#
# It only reads: nothing here creates, changes or destroys anything. Run it
# from the repository root, a few minutes before you press record.
#
#   ./scripts/demo-check.sh          # checks dev
#
# Every check that fails prints what to do about it. The script exits non-zero
# if any of them failed, so you know at a glance whether you are ready.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${REPO_ROOT}"

TF=(terraform -chdir=terraform)
FAILURES=0

if [ -t 1 ]; then
  OK_C=$'\033[32m'; KO_C=$'\033[31m'; DIM=$'\033[90m'; OFF=$'\033[0m'
else
  OK_C=""; KO_C=""; DIM=""; OFF=""
fi

pass() { printf '  %sOK%s   %s\n' "${OK_C}" "${OFF}" "$1"; }
fail() {
  printf '  %sKO%s   %s\n' "${KO_C}" "${OFF}" "$1"
  printf '       %s%s%s\n' "${DIM}" "$2" "${OFF}"
  FAILURES=$((FAILURES + 1))
}

echo
echo "Verification avant demonstration"
echo "================================"
echo

# --- 1. The Terraform state answers ---------------------------------------
echo "1. Infrastructure"
SHOP_URL="$("${TF[@]}" output -raw shop_url 2>/dev/null)"
if [ -n "${SHOP_URL}" ]; then
  pass "etat Terraform lisible — boutique : ${SHOP_URL}"
else
  fail "etat Terraform illisible ou vide" \
       "Lancez : terraform -chdir=terraform init puis terraform -chdir=terraform apply"
  echo
  echo "Rien d'autre ne peut etre verifie sans infrastructure. Arret."
  exit 1
fi

ADMIN_URL="$("${TF[@]}" output -raw admin_url 2>/dev/null)"
BASTION_IP="$("${TF[@]}" output -raw bastion_public_ip 2>/dev/null)"
KEY_PATH="$("${TF[@]}" output -raw ssh_private_key_path 2>/dev/null)"

# --- 2. The shop answers ---------------------------------------------------
echo
echo "2. Boutique"
CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "${SHOP_URL}" 2>/dev/null)"
case "${CODE}" in
  200|301|302) pass "la boutique repond (HTTP ${CODE})" ;;
  000) fail "aucune reponse de la boutique" \
            "Verifiez votre connexion, puis que les instances sont saines dans le groupe cible du load balancer." ;;
  *)   fail "la boutique repond HTTP ${CODE}" \
            "Relancez : ansible-playbook -i ansible/inventory.yml ansible/site.yml --ask-vault-pass" ;;
esac

if [ -n "${ADMIN_URL}" ]; then
  CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "${ADMIN_URL}" 2>/dev/null)"
  case "${CODE}" in
    200|301|302) pass "le back-office repond (HTTP ${CODE}) — ${ADMIN_URL}" ;;
    *)           fail "le back-office repond HTTP ${CODE}" \
                      "Le dossier d'administration est publie par Terraform (prestashop_admin_dir)." ;;
  esac
fi

# --- 3. The dynamic inventory ---------------------------------------------
echo
echo "3. Inventaire dynamique"
GRAPH="$(ansible-inventory -i ansible/inventory.yml --graph 2>/dev/null)"
HOSTS="$(printf '%s\n' "${GRAPH}" | grep -- '|--' | grep -vc '@' || true)"
if [ "${HOSTS}" -gt 0 ]; then
  pass "${HOSTS} hote(s) lus dans l'etat Terraform"
else
  fail "l'inventaire ne renvoie aucun hote" \
       "Installez les dependances : ansible-galaxy install -r ansible/requirements.yml"
fi

# --- 4. SSH through the bastion -------------------------------------------
echo
echo "4. Acces SSH"
if [ -z "${BASTION_IP}" ] || [ "${BASTION_IP}" = "null" ]; then
  pass "bastion desactive dans cet environnement — rien a verifier"
elif [ ! -f "${KEY_PATH}" ]; then
  fail "cle privee introuvable (${KEY_PATH})" \
       "Elle est generee par Terraform. Relancez : terraform -chdir=terraform apply"
else
  if ssh -i "${KEY_PATH}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
         -o ConnectTimeout=15 -o BatchMode=yes "ubuntu@${BASTION_IP}" true 2>/dev/null; then
    pass "bastion joignable (${BASTION_IP})"
  else
    MY_IP="$(curl -s --max-time 10 https://checkip.amazonaws.com 2>/dev/null | tr -d '[:space:]')"
    fail "bastion injoignable (${BASTION_IP})" \
         "Le pare-feu du bastion est verrouille sur l'IP du poste au moment du apply. La votre est ${MY_IP:-inconnue}. Relancez depuis ce reseau : terraform -chdir=terraform apply"
  fi
fi

# --- verdict ---------------------------------------------------------------
echo
if [ "${FAILURES}" -eq 0 ]; then
  printf '%sTout est pret. Vous pouvez enregistrer.%s\n\n' "${OK_C}" "${OFF}"
else
  printf '%s%d verification(s) en echec. Corrigez avant d'"'"'enregistrer.%s\n\n' "${KO_C}" "${FAILURES}" "${OFF}"
fi
exit "${FAILURES}"
