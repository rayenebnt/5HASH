output "file_system_id" {
  description = "ID of the shared EFS file system."
  value       = aws_efs_file_system.this.id
}

output "arn" {
  description = "ARN of the file system, used in the IAM policy of the instances."
  value       = aws_efs_file_system.this.arn
}

output "dns_name" {
  description = "DNS name used by the instances to mount the file system."
  value       = aws_efs_file_system.this.dns_name
}

output "mount_target_ids" {
  description = "IDs of the per-availability-zone mount targets."
  value       = aws_efs_mount_target.this[*].id
}
