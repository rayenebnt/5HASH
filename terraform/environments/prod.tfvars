# Production: three instances across three AZs, one NAT gateway per AZ,
# Multi-AZ database with 14 days of backups, deletion protection everywhere.
# Set certificate_arn / domain_name / route53_zone_id to serve HTTPS on the
# shop domain, and alarm_email to receive the CloudWatch alarms.

project_name = "taylorshift"
environment  = "prod"
aws_region   = "eu-west-3"
vpc_cidr     = "10.40.0.0/16"

availability_zone_count = 3
app_instance_count      = 3
app_instance_type       = "t3.medium"
db_instance_class       = "db.t3.medium"

http_ingress_cidrs = ["0.0.0.0/0"]
# admin_ssh_cidrs  = ["203.0.113.0/24"]   # office range only
# certificate_arn  = "arn:aws:acm:eu-west-3:123456789012:certificate/xxxxxxxx"
# domain_name      = "shop.taylorshift.example"
# route53_zone_id  = "Z0123456789ABCDEFGHIJ"
# alarm_email      = "ops@taylorshift.example"
