# Default variable file, loaded automatically by `terraform apply`.
# It targets the dev environment so the repository can be deployed as-is.
# For another environment, use one of the files in environments/:
#   terraform -chdir=terraform apply -var-file=environments/prod.tfvars
# (and point the backend key at that environment - see the README).

project_name = "taylorshift"
environment  = "dev"
aws_region   = "eu-north-1"

# Leave admin_ssh_cidrs empty to restrict SSH on the bastion to the public IP
# of the machine running Terraform. Set it explicitly for a fixed office range:
# admin_ssh_cidrs = ["203.0.113.10/32"]
admin_ssh_cidrs = []
