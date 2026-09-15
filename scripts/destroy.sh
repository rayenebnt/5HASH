#!/usr/bin/env bash
#
# Tears down one environment. The state backend created by
# scripts/bootstrap-backend.sh is left alone on purpose: it is shared by every
# environment and holds the history of the states.
#
#   ./scripts/destroy.sh            # destroys dev
#   ./scripts/destroy.sh staging

set -euo pipefail

ENVIRONMENT="${1:-dev}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

VAR_FILE_ARG=()
[ "${ENVIRONMENT}" != "dev" ] && VAR_FILE_ARG=(-var-file="environments/${ENVIRONMENT}.tfvars")

echo "==> Destroying the ${ENVIRONMENT} environment"
echo "    Production keeps deletion protection on the database and the load"
echo "    balancer: turn it off in locals.tf before destroying prod."
terraform -chdir="${REPO_ROOT}/terraform" destroy "${VAR_FILE_ARG[@]}"
