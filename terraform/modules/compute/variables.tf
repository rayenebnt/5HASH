variable "name_prefix" {
  description = "Prefix applied to the name of every resource created by this module."
  type        = string
}

variable "ami_id" {
  description = "AMI used for the bastion and the application instances (Ubuntu LTS, x86_64)."
  type        = string
}

variable "key_name" {
  description = "Name of the EC2 key pair installed on the instances for the Ansible SSH connection."
  type        = string
}

variable "app_instance_count" {
  description = "Number of PrestaShop instances behind the load balancer. Increase it to serve more traffic."
  type        = number

  validation {
    condition     = var.app_instance_count >= 1
    error_message = "At least one application instance is required."
  }
}

variable "app_instance_type" {
  description = "EC2 instance type of the PrestaShop instances."
  type        = string
  default     = "t3.small"
}

variable "app_root_volume_size" {
  description = "Size of the root volume of the application instances in GiB."
  type        = number
  default     = 20
}

variable "app_subnet_ids" {
  description = "Private application subnets. Instances are spread over them round-robin so the fleet always spans several availability zones."
  type        = list(string)
}

variable "app_security_group_ids" {
  description = "Security groups of the application instances."
  type        = list(string)
}

variable "enable_bastion" {
  description = "Create the SSH jump host. Without it the private instances cannot be configured by Ansible from outside the VPC."
  type        = bool
  default     = true
}

variable "bastion_instance_type" {
  description = "EC2 instance type of the bastion host."
  type        = string
  default     = "t3.micro"
}

variable "bastion_subnet_id" {
  description = "Public subnet hosting the bastion."
  type        = string
}

variable "bastion_security_group_ids" {
  description = "Security groups of the bastion host."
  type        = list(string)
}

variable "db_secret_arn" {
  description = "ARN of the Secrets Manager secret the instances are allowed to read at deploy time."
  type        = string
}

variable "efs_file_system_arn" {
  description = "ARN of the shared EFS file system the instances are allowed to mount. Empty when the environment runs without shared storage."
  type        = string
  default     = ""
}

variable "detailed_monitoring" {
  description = "Enable EC2 detailed (1 minute) CloudWatch monitoring, which is what autoscaling decisions should be based on."
  type        = bool
  default     = false
}

variable "tags" {
  description = "Additional tags merged into every resource of this module."
  type        = map(string)
  default     = {}
}
