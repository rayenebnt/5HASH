# Local emulator profile (Floci / LocalStack), for provisioning the whole stack
# on a laptop without an AWS account.
#
#   floci start && eval $(floci env)
#   terraform -chdir=terraform apply -var-file=environments/floci.tfvars
#
# What the emulator really runs, and what it only pretends to run, is documented
# in the README ("Running against a local emulator"). In short: EC2 and RDS are
# real containers, EFS has no NFS data plane and the load balancer routes no
# traffic - hence the three settings at the bottom of this file.

project_name = "taylorshift"
environment  = "dev"
aws_region   = "us-east-1"
vpc_cidr     = "10.20.0.0/16"

aws_endpoint_url = "http://localhost:4566"

availability_zone_count = 2
app_instance_count      = 1
app_instance_type       = "t3.small"
db_instance_class       = "db.t3.micro"

# The emulator publishes its own image catalogue, so the Ubuntu AMI lookup is
# bypassed. ami-ubuntu2404-cloud is the systemd + cloud-init variant, the only
# one that behaves like a real Ubuntu cloud image.
app_ami_id = "ami-ubuntu2404-cloud"

# No NFS data plane: the single instance keeps the document root locally.
enable_shared_storage = false

# The emulated load balancer stores listeners and targets but forwards no
# packets, so the shop is published on the instance itself.
shop_endpoint_source = "instance"

# Every instance sits on the emulator's VPC network, reachable directly.
enable_bastion = false
