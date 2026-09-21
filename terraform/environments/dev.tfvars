# Development: one instance, one NAT gateway, single-AZ database, no backups.
# Everything is destroyable without ceremony.

project_name = "taylorshift"
environment  = "dev"
aws_region   = "eu-north-1"
vpc_cidr     = "10.20.0.0/16"

availability_zone_count = 2
app_instance_count      = 1
app_instance_type       = "t3.small"
db_instance_class       = "db.t3.micro"
