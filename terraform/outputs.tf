output "shop_url" {
  description = "Public URL of the ticket shop. This is the endpoint to open once the Ansible playbook has finished."
  value       = local.shop_url
}

output "admin_url" {
  description = "URL of the PrestaShop back office. Credentials are in ansible/group_vars/all/vault.yml."
  value       = "${local.shop_url}/${var.prestashop_admin_dir}"
}

output "alb_dns_name" {
  description = "DNS name of the application load balancer."
  value       = module.loadbalancer.dns_name
}

output "bastion_public_ip" {
  description = "Public IP of the bastion. Ansible tunnels every SSH session through it."
  value       = module.compute.bastion_public_ip
}

output "app_instance_ids" {
  description = "IDs of the PrestaShop instances registered in the target group."
  value       = module.compute.app_instance_ids
}

output "app_private_ips" {
  description = "Private IPs of the PrestaShop instances."
  value       = module.compute.app_private_ips
}

output "database_endpoint" {
  description = "Endpoint of the RDS MySQL instance (reachable from the application subnets only)."
  value       = module.database.endpoint
}

output "database_secret_name" {
  description = "Secrets Manager secret holding the database credentials. Read it with: aws secretsmanager get-secret-value --secret-id <name>."
  value       = module.database.secret_name
}

output "efs_file_system_id" {
  description = "Shared EFS file system holding the PrestaShop document root."
  value       = module.storage.file_system_id
}

output "ssh_private_key_path" {
  description = "Private key used by Ansible to reach the instances."
  value       = local.ssh_private_key_path
}

output "ssh_bastion_command" {
  description = "Ready to use SSH command to reach the bastion."
  value       = var.enable_bastion ? "ssh -i ${local.ssh_private_key_path} ubuntu@${local.bastion_address}" : "bastion disabled"
}

output "environment_summary" {
  description = "Sizing actually applied to this environment."
  value = {
    environment        = var.environment
    account_id         = data.aws_caller_identity.current.account_id
    region             = var.aws_region
    availability_zones = local.azs
    app_instances      = local.app_instance_count
    app_instance_type  = local.app_instance_type
    db_instance_class  = local.db_instance_class
    db_multi_az        = local.env.db_multi_az
    nat_gateways       = local.env.single_nat_gateway ? 1 : var.availability_zone_count
    https              = local.enable_https
  }
}

output "next_steps" {
  description = "Commands to run after this apply."
  value = join("\n", [
    "ansible-galaxy install -r ansible/requirements.yml",
    "ansible-inventory -i ansible/inventory.yml --graph",
    "ansible-playbook -i ansible/inventory.yml ansible/site.yml --ask-vault-pass",
  ])
}
