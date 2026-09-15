data "aws_availability_zones" "available" {
  state = "available"

  filter {
    name   = "opt-in-status"
    values = ["opt-in-not-required"]
  }
}

data "aws_caller_identity" "current" {}

# Latest Ubuntu 24.04 LTS published by Canonical (owner ID 099720109477),
# resolved at apply time instead of being hardcoded per region.
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd*/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "state"
    values = ["available"]
  }
}

# Public IP of the machine running Terraform, used to lock the bastion down to
# the operator's address when admin_ssh_cidrs is left empty.
data "http" "my_ip" {
  url = "https://checkip.amazonaws.com"

  retry {
    attempts = 3
  }
}
