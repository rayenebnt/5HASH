output "vpc_id" {
  description = "ID of the VPC."
  value       = aws_vpc.this.id
}

output "vpc_cidr" {
  description = "CIDR block of the VPC."
  value       = aws_vpc.this.cidr_block
}

output "public_subnet_ids" {
  description = "IDs of the public subnets (ALB, NAT gateways, bastion)."
  value       = aws_subnet.public[*].id
}

output "private_app_subnet_ids" {
  description = "IDs of the private application subnets (EC2, EFS mount targets)."
  value       = aws_subnet.private_app[*].id
}

output "private_db_subnet_ids" {
  description = "IDs of the private database subnets (RDS)."
  value       = aws_subnet.private_db[*].id
}

output "availability_zones" {
  description = "Availability zones the subnets are spread over."
  value       = var.availability_zones
}

output "nat_public_ips" {
  description = "Public IPs the application instances use for outbound traffic."
  value       = aws_eip.nat[*].public_ip
}
