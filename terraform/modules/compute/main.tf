# The application tier is a fleet of identical, disposable instances. They hold
# no state of their own: the catalogue lives in RDS and the document root on
# EFS, so an instance can be destroyed and recreated at any time and the fleet
# can be resized by changing app_instance_count.

resource "aws_instance" "app" {
  count = var.app_instance_count

  ami                    = var.ami_id
  instance_type          = var.app_instance_type
  key_name               = var.key_name
  subnet_id              = var.app_subnet_ids[count.index % length(var.app_subnet_ids)]
  vpc_security_group_ids = var.app_security_group_ids
  iam_instance_profile   = aws_iam_instance_profile.app.name
  monitoring             = var.detailed_monitoring

  root_block_device {
    volume_type           = "gp3"
    volume_size           = var.app_root_volume_size
    encrypted             = true
    delete_on_termination = true
  }

  # IMDSv2 only: a server side request forgery in the shop cannot be used to
  # steal the instance role credentials.
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 2
    instance_metadata_tags      = "enabled"
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-app-${count.index + 1}"
    Role = "prestashop"
  })

  lifecycle {
    # The AMI is only used at creation time; a newer Ubuntu release must not
    # silently replace a running instance during an unrelated apply.
    ignore_changes = [ami]
  }
}

resource "aws_instance" "bastion" {
  count = var.enable_bastion ? 1 : 0

  ami                    = var.ami_id
  instance_type          = var.bastion_instance_type
  key_name               = var.key_name
  subnet_id              = var.bastion_subnet_id
  vpc_security_group_ids = var.bastion_security_group_ids

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 8
    encrypted             = true
    delete_on_termination = true
  }

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-bastion"
    Role = "bastion"
  })

  lifecycle {
    ignore_changes = [ami]
  }
}

# A static address keeps the SSH configuration and the Ansible inventory stable
# across bastion restarts.
resource "aws_eip" "bastion" {
  count = var.enable_bastion ? 1 : 0

  instance = aws_instance.bastion[0].id
  domain   = "vpc"

  tags = merge(var.tags, { Name = "${var.name_prefix}-bastion-eip" })
}
