variable "name_prefix" {
  description = "Prefix applied to the name of every resource created by this module (e.g. taylorshift-prod)."
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block of the VPC."
  type        = string
}

variable "availability_zones" {
  description = "Availability zones to spread the subnets over. Two or more are required for a highly available load balancer."
  type        = list(string)

  validation {
    condition     = length(var.availability_zones) >= 2
    error_message = "At least two availability zones are required (the ALB and RDS subnet groups need two)."
  }
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks of the public subnets (ALB + NAT gateways + bastion), one per availability zone."
  type        = list(string)
}

variable "private_app_subnet_cidrs" {
  description = "CIDR blocks of the private application subnets (EC2 instances + EFS mount targets), one per availability zone."
  type        = list(string)
}

variable "private_db_subnet_cidrs" {
  description = "CIDR blocks of the private database subnets (RDS), one per availability zone."
  type        = list(string)
}

variable "single_nat_gateway" {
  description = "Use one shared NAT gateway instead of one per availability zone. Cheaper, but the NAT becomes a single point of failure - keep it false in production."
  type        = bool
  default     = false
}

variable "enable_flow_logs" {
  description = "Send VPC flow logs to CloudWatch Logs (network forensics and troubleshooting)."
  type        = bool
  default     = false
}

variable "flow_logs_retention_days" {
  description = "Retention of the VPC flow log group in days."
  type        = number
  default     = 30
}

variable "tags" {
  description = "Additional tags merged into every resource of this module."
  type        = map(string)
  default     = {}
}
