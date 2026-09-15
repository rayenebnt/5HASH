# Staging: same topology as production (two instances, two AZs) on smaller
# hardware, so load tests and release rehearsals are representative.

project_name = "taylorshift"
environment  = "staging"
aws_region   = "eu-west-3"
vpc_cidr     = "10.30.0.0/16"

availability_zone_count = 2
app_instance_count      = 2
app_instance_type       = "t3.small"
db_instance_class       = "db.t3.small"
