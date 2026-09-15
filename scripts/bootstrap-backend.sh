#!/usr/bin/env bash
#
# Creates the Terraform remote state backend (S3 bucket + DynamoDB lock table)
# and writes terraform/backend.tf so that a plain `terraform init` picks it up.
#
# Run once per AWS account, before the first `terraform -chdir=terraform init`:
#
#   ./scripts/bootstrap-backend.sh              # backend for the dev state
#   ./scripts/bootstrap-backend.sh prod         # backend for the prod state
#
# The bucket is versioned and encrypted: the state holds generated secrets.

set -euo pipefail

ENVIRONMENT="${1:-dev}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BOOTSTRAP_DIR="${REPO_ROOT}/bootstrap"
TF_DIR="${REPO_ROOT}/terraform"

case "${ENVIRONMENT}" in
  dev|staging|prod) ;;
  *) echo "usage: $0 [dev|staging|prod]" >&2; exit 64 ;;
esac

command -v terraform >/dev/null || { echo "terraform is not installed" >&2; exit 1; }
command -v aws >/dev/null || { echo "the AWS CLI is not installed" >&2; exit 1; }

aws sts get-caller-identity >/dev/null || {
  echo "no usable AWS credentials; configure them first (aws configure / SSO)" >&2
  exit 1
}

echo "==> Creating the state backend (bucket + lock table)"
terraform -chdir="${BOOTSTRAP_DIR}" init -input=false
terraform -chdir="${BOOTSTRAP_DIR}" apply -input=false -auto-approve

BUCKET="$(terraform -chdir="${BOOTSTRAP_DIR}" output -raw state_bucket)"
TABLE="$(terraform -chdir="${BOOTSTRAP_DIR}" output -raw lock_table)"
REGION="$(terraform -chdir="${BOOTSTRAP_DIR}" output -raw region)"

# State locking moved from DynamoDB to an S3 lock file in Terraform 1.10; both
# are supported here so the repository works with whatever the team has.
TF_VERSION="$(terraform version | head -1 | sed 's/^Terraform v//')"
if [ "$(printf '1.10.0\n%s\n' "${TF_VERSION}" | sort -V | head -1)" = "1.10.0" ]; then
  LOCKING="    use_lockfile = true"
  echo "==> Terraform ${TF_VERSION}: using S3 native state locking"
else
  LOCKING="    dynamodb_table = \"${TABLE}\""
  echo "==> Terraform ${TF_VERSION}: using the DynamoDB lock table ${TABLE}"
fi

sed -e "s|__BUCKET__|${BUCKET}|" \
    -e "s|__KEY__|${ENVIRONMENT}/terraform.tfstate|" \
    -e "s|__REGION__|${REGION}|" \
    -e "s|__LOCKING__|${LOCKING}|" \
    "${TF_DIR}/backend.tf.tmpl" > "${TF_DIR}/backend.tf"

echo
echo "==> terraform/backend.tf written:"
sed 's/^/    /' "${TF_DIR}/backend.tf"
echo
echo "Next:"
echo "    terraform -chdir=terraform init"
if [ "${ENVIRONMENT}" = "dev" ]; then
  echo "    terraform -chdir=terraform apply"
else
  echo "    terraform -chdir=terraform apply -var-file=environments/${ENVIRONMENT}.tfvars"
fi
