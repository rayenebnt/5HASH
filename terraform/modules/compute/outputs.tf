output "app_instance_ids" {
  description = "IDs of the PrestaShop instances."
  value       = aws_instance.app[*].id
}

output "app_private_ips" {
  description = "Private IPs of the PrestaShop instances (used by the Ansible inventory)."
  value       = aws_instance.app[*].private_ip
}

output "app_availability_zones" {
  description = "Availability zone of each PrestaShop instance."
  value       = aws_instance.app[*].availability_zone
}

output "app_iam_role_name" {
  description = "IAM role assumed by the PrestaShop instances."
  value       = aws_iam_role.app.name
}

output "bastion_public_ip" {
  description = "Public IP of the bastion host, or null when the bastion is disabled."
  value       = one(aws_eip.bastion[*].public_ip)
}

output "bastion_instance_id" {
  description = "ID of the bastion host, or null when the bastion is disabled."
  value       = one(aws_instance.bastion[*].id)
}
