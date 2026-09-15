variable "name_prefix" {
  description = "Prefix applied to the name of every resource created by this module."
  type        = string
}

variable "subnet_ids" {
  description = "Private application subnets that get an EFS mount target (one per availability zone)."
  type        = list(string)
}

variable "security_group_ids" {
  description = "Security groups attached to the mount targets (must allow NFS/2049 from the instances)."
  type        = list(string)
}

variable "throughput_mode" {
  description = "EFS throughput mode: bursting (cheap, credit based) or elastic (scales with demand, pay per use)."
  type        = string
  default     = "bursting"

  validation {
    condition     = contains(["bursting", "elastic", "provisioned"], var.throughput_mode)
    error_message = "throughput_mode must be one of: bursting, elastic, provisioned."
  }
}

variable "enable_backup" {
  description = "Enable the AWS Backup automatic daily backup plan of the file system."
  type        = bool
  default     = false
}

variable "tags" {
  description = "Additional tags merged into every resource of this module."
  type        = map(string)
  default     = {}
}
