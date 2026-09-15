output "endpoint" {
  description = "host:port endpoint of the database instance."
  value       = aws_db_instance.this.endpoint
}

output "address" {
  description = "DNS name of the database instance (no port)."
  value       = aws_db_instance.this.address
}

output "port" {
  description = "Port the database instance listens on."
  value       = aws_db_instance.this.port
}

output "database_name" {
  description = "Name of the application schema."
  value       = var.database_name
}

output "username" {
  description = "Master user of the database instance."
  value       = var.master_username
}

output "secret_arn" {
  description = "ARN of the Secrets Manager secret holding the database credentials."
  value       = aws_secretsmanager_secret.db.arn
}

output "secret_name" {
  description = "Name of the Secrets Manager secret holding the database credentials."
  value       = aws_secretsmanager_secret.db.name
}

output "multi_az" {
  description = "Whether the instance runs with a standby in a second availability zone."
  value       = aws_db_instance.this.multi_az
}
