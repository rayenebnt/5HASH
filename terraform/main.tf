# Taylor Shift ticket shop - application stack.
#
#   internet -> ALB (public subnets)
#            -> PrestaShop containers on EC2 (private app subnets, N per env)
#            -> RDS MySQL (private db subnets) + EFS (shared document root)
#
# Each layer is a module so that the same composition can be applied to dev,
# staging and prod, and so a layer can be reviewed, reused or replaced on its
# own.

module "network" {
  source = "./modules/network"

  name_prefix              = local.name_prefix
  vpc_cidr                 = var.vpc_cidr
  availability_zones       = local.azs
  public_subnet_cidrs      = local.public_subnet_cidrs
  private_app_subnet_cidrs = local.private_app_subnet_cidrs
  private_db_subnet_cidrs  = local.private_db_subnet_cidrs
  single_nat_gateway       = local.env.single_nat_gateway
  enable_flow_logs         = local.env.flow_logs

  tags = { Component = "network" }
}

module "security" {
  source = "./modules/security"

  name_prefix        = local.name_prefix
  vpc_id             = module.network.vpc_id
  http_ingress_cidrs = var.http_ingress_cidrs
  admin_ssh_cidrs    = local.admin_ssh_cidrs
  enable_https       = local.enable_https

  tags = { Component = "security" }
}

# The shared document root. Without it every instance keeps its own copy of the
# pictures and the sessions, which only holds for a single-instance environment.
module "storage" {
  source = "./modules/storage"
  count  = var.enable_shared_storage ? 1 : 0

  name_prefix        = local.name_prefix
  subnet_ids         = module.network.private_app_subnet_ids
  security_group_ids = [module.security.efs_security_group_id]
  throughput_mode    = local.env.efs_throughput_mode
  enable_backup      = local.env.efs_backup

  tags = { Component = "storage" }
}

module "database" {
  source = "./modules/database"

  name_prefix        = local.name_prefix
  subnet_ids         = module.network.private_db_subnet_ids
  security_group_ids = [module.security.db_security_group_id]

  engine_version         = var.db_engine_version
  parameter_group_family = var.db_parameter_group_family
  instance_class         = local.db_instance_class
  allocated_storage      = local.db_allocated_storage
  multi_az               = local.env.db_multi_az
  database_name          = var.db_name
  master_username        = var.db_master_username

  backup_retention_period      = local.env.db_backup_retention
  deletion_protection          = local.env.db_deletion_protection
  skip_final_snapshot          = local.env.db_skip_final_snapshot
  performance_insights_enabled = local.env.db_performance_insights
  secret_recovery_window_days  = var.environment == "prod" ? 30 : 0

  tags = { Component = "database" }
}

module "compute" {
  source = "./modules/compute"

  name_prefix = local.name_prefix
  ami_id      = local.ami_id
  key_name    = aws_key_pair.this.key_name

  app_instance_count     = local.app_instance_count
  app_instance_type      = local.app_instance_type
  app_subnet_ids         = module.network.private_app_subnet_ids
  app_security_group_ids = [module.security.app_security_group_id]

  enable_bastion             = var.enable_bastion
  bastion_instance_type      = var.bastion_instance_type
  bastion_subnet_id          = module.network.public_subnet_ids[0]
  bastion_security_group_ids = [module.security.bastion_security_group_id]

  db_secret_arn       = module.database.secret_arn
  efs_file_system_arn = one(module.storage[*].arn)
  detailed_monitoring = local.env.detailed_monitoring

  tags = { Component = "compute" }
}

module "loadbalancer" {
  source = "./modules/loadbalancer"

  name_prefix         = local.name_prefix
  vpc_id              = module.network.vpc_id
  subnet_ids          = module.network.public_subnet_ids
  security_group_ids  = [module.security.alb_security_group_id]
  target_instance_ids = module.compute.app_instance_ids

  enable_https               = local.enable_https
  certificate_arn            = var.certificate_arn
  enable_deletion_protection = local.env.alb_deletion_protection
  alarm_actions              = aws_sns_topic.alarms[*].arn

  tags = { Component = "loadbalancer" }
}

# --- Alerting --------------------------------------------------------------

resource "aws_sns_topic" "alarms" {
  count = var.alarm_email != "" ? 1 : 0

  name = "${local.name_prefix}-alarms"
  tags = { Component = "monitoring" }
}

resource "aws_sns_topic_subscription" "alarms_email" {
  count = var.alarm_email != "" ? 1 : 0

  topic_arn = aws_sns_topic.alarms[0].arn
  protocol  = "email"
  endpoint  = var.alarm_email
}

# --- DNS (optional) --------------------------------------------------------

resource "aws_route53_record" "shop" {
  count = var.domain_name != "" && var.route53_zone_id != "" ? 1 : 0

  zone_id = var.route53_zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = module.loadbalancer.dns_name
    zone_id                = module.loadbalancer.zone_id
    evaluate_target_health = true
  }
}
