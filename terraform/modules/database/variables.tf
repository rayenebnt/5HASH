variable "name_prefix" {
  description = "Prefix applied to the name of every resource created by this module."
  type        = string
}

variable "subnet_ids" {
  description = "Private database subnets of the DB subnet group (at least two, in different availability zones)."
  type        = list(string)
}

variable "security_group_ids" {
  description = "Security groups attached to the database instance."
  type        = list(string)
}

variable "engine_version" {
  description = "MySQL engine version. PrestaShop 8 requires MySQL >= 5.6; 8.0 is the supported production target."
  type        = string
  default     = "8.0"
}

variable "parameter_group_family" {
  description = "Parameter group family matching the engine version (e.g. mysql8.0 for any 8.0.x release)."
  type        = string
  default     = "mysql8.0"
}

variable "instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t3.micro"
}

variable "allocated_storage" {
  description = "Initial storage in GiB."
  type        = number
  default     = 20
}

variable "max_allocated_storage" {
  description = "Upper bound of RDS storage autoscaling in GiB. Set to 0 to disable autoscaling."
  type        = number
  default     = 100
}

variable "multi_az" {
  description = "Deploy a synchronous standby in a second availability zone with automatic failover."
  type        = bool
  default     = false
}

variable "backup_retention_period" {
  description = "Number of days automated backups are kept (0 disables them)."
  type        = number
  default     = 7
}

variable "deletion_protection" {
  description = "Refuse to delete the database instance. Enable it in production."
  type        = bool
  default     = false
}

variable "skip_final_snapshot" {
  description = "Skip the final snapshot when the instance is destroyed. Only acceptable in disposable environments."
  type        = bool
  default     = true
}

variable "performance_insights_enabled" {
  description = "Enable RDS Performance Insights (query level monitoring)."
  type        = bool
  default     = false
}

variable "database_name" {
  description = "Name of the application schema created on the instance."
  type        = string
  default     = "prestashop"
}

variable "master_username" {
  description = "Master user of the database instance."
  type        = string
  default     = "psadmin"
}

variable "secret_recovery_window_days" {
  description = "Recovery window of the Secrets Manager secret. 0 deletes it immediately, which makes repeated create/destroy cycles possible in dev."
  type        = number
  default     = 0
}

variable "tags" {
  description = "Additional tags merged into every resource of this module."
  type        = map(string)
  default     = {}
}
