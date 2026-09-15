# Environment separation lives here: the same code and the same modules are
# applied to dev, staging and prod, only the sizing and the durability options
# change. Everything can still be overridden one variable at a time from
# environments/<env>.tfvars.

locals {
  name_prefix = "${var.project_name}-${var.environment}"

  env_defaults = {
    dev = {
      app_instance_count      = 1
      app_instance_type       = "t3.small"
      db_instance_class       = "db.t3.micro"
      db_allocated_storage    = 20
      db_multi_az             = false
      db_backup_retention     = 1
      db_deletion_protection  = false
      db_skip_final_snapshot  = true
      db_performance_insights = false
      single_nat_gateway      = true
      efs_throughput_mode     = "bursting"
      efs_backup              = false
      alb_deletion_protection = false
      detailed_monitoring     = false
      flow_logs               = false
    }
    staging = {
      app_instance_count      = 2
      app_instance_type       = "t3.small"
      db_instance_class       = "db.t3.small"
      db_allocated_storage    = 20
      db_multi_az             = false
      db_backup_retention     = 3
      db_deletion_protection  = false
      db_skip_final_snapshot  = true
      db_performance_insights = false
      single_nat_gateway      = true
      efs_throughput_mode     = "bursting"
      efs_backup              = false
      alb_deletion_protection = false
      detailed_monitoring     = true
      flow_logs               = false
    }
    prod = {
      app_instance_count      = 3
      app_instance_type       = "t3.medium"
      db_instance_class       = "db.t3.medium"
      db_allocated_storage    = 50
      db_multi_az             = true
      db_backup_retention     = 14
      db_deletion_protection  = true
      db_skip_final_snapshot  = false
      db_performance_insights = true
      single_nat_gateway      = false
      efs_throughput_mode     = "elastic"
      efs_backup              = true
      alb_deletion_protection = true
      detailed_monitoring     = true
      flow_logs               = true
    }
  }

  env = local.env_defaults[var.environment]

  # Explicit variables win over the per-environment defaults.
  app_instance_count   = coalesce(var.app_instance_count, local.env.app_instance_count)
  app_instance_type    = coalesce(var.app_instance_type, local.env.app_instance_type)
  db_instance_class    = coalesce(var.db_instance_class, local.env.db_instance_class)
  db_allocated_storage = coalesce(var.db_allocated_storage, local.env.db_allocated_storage)

  azs = slice(data.aws_availability_zones.available.names, 0, var.availability_zone_count)

  # /20 per subnet: 3 tiers x 3 AZs all fit in the /16 without overlapping.
  public_subnet_cidrs      = [for i in range(var.availability_zone_count) : cidrsubnet(var.vpc_cidr, 4, i)]
  private_app_subnet_cidrs = [for i in range(var.availability_zone_count) : cidrsubnet(var.vpc_cidr, 4, i + 4)]
  private_db_subnet_cidrs  = [for i in range(var.availability_zone_count) : cidrsubnet(var.vpc_cidr, 4, i + 8)]

  # Without an explicit list, SSH is locked to the public IP of the operator
  # running Terraform instead of being opened to the whole internet.
  admin_ssh_cidrs = length(var.admin_ssh_cidrs) > 0 ? var.admin_ssh_cidrs : ["${chomp(data.http.my_ip.response_body)}/32"]

  enable_https = var.certificate_arn != ""
  ami_id       = var.app_ami_id != "" ? var.app_ami_id : data.aws_ami.ubuntu.id

  shop_host = var.domain_name != "" ? var.domain_name : module.loadbalancer.dns_name
  shop_url  = "${local.enable_https ? "https" : "http"}://${local.shop_host}"
}
