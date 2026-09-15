output "alb_security_group_id" {
  description = "Security group of the application load balancer."
  value       = aws_security_group.alb.id
}

output "bastion_security_group_id" {
  description = "Security group of the bastion host."
  value       = aws_security_group.bastion.id
}

output "app_security_group_id" {
  description = "Security group of the PrestaShop instances."
  value       = aws_security_group.app.id
}

output "db_security_group_id" {
  description = "Security group of the RDS instance."
  value       = aws_security_group.db.id
}

output "efs_security_group_id" {
  description = "Security group of the EFS mount targets."
  value       = aws_security_group.efs.id
}
