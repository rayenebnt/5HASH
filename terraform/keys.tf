# SSH access. Either the team brings its own key (ssh_public_key_path), or
# Terraform generates a dedicated key pair for this environment and writes the
# private key next to the code with 0600 permissions. The private key is never
# committed: terraform/.ssh/ is in .gitignore, and the Ansible inventory only
# carries its *path*, not its content.

resource "tls_private_key" "generated" {
  count = var.ssh_public_key_path == "" ? 1 : 0

  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "local_sensitive_file" "private_key" {
  count = var.ssh_public_key_path == "" ? 1 : 0

  content         = tls_private_key.generated[0].private_key_openssh
  filename        = "${path.module}/.ssh/${local.name_prefix}.pem"
  file_permission = "0600"
}

resource "aws_key_pair" "this" {
  key_name_prefix = "${local.name_prefix}-"
  public_key = var.ssh_public_key_path == "" ? (
    tls_private_key.generated[0].public_key_openssh
  ) : file(pathexpand(var.ssh_public_key_path))

  tags = { Name = "${local.name_prefix}-key" }

  lifecycle {
    create_before_destroy = true

    precondition {
      condition     = var.ssh_public_key_path == "" || var.ssh_private_key_path != ""
      error_message = "ssh_private_key_path must be set when you bring your own key: Ansible needs the matching private key to reach the instances."
    }
  }
}

locals {
  ssh_private_key_path = var.ssh_public_key_path == "" ? (
    abspath(local_sensitive_file.private_key[0].filename)
  ) : pathexpand(var.ssh_private_key_path)
}
