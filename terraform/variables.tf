# --- Identity --------------------------------------------------------------

variable "project_name" {
  description = "Short project name used as a prefix for every resource name."
  type        = string
  default     = "taylorshift"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{1,20}$", var.project_name))
    error_message = "project_name must be lowercase alphanumeric with hyphens, 2 to 21 characters."
  }
}

variable "environment" {
  description = "Environment deployed by this workspace. It drives the naming of every resource and the default sizing (see locals.tf)."
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be one of: dev, staging, prod."
  }
}

variable "owner" {
  description = "Team owning the stack, added as a tag on every resource."
  type        = string
  default     = "5hash-agency"
}

variable "aws_region" {
  description = "AWS region hosting the stack."
  type        = string
  default     = "eu-west-3"
}

# --- Network ---------------------------------------------------------------

variable "vpc_cidr" {
  description = "CIDR block of the VPC."
  type        = string
  default     = "10.20.0.0/16"
}

variable "availability_zone_count" {
  description = "Number of availability zones used. Two is the minimum for a highly available load balancer and a Multi-AZ database."
  type        = number
  default     = 2

  validation {
    condition     = var.availability_zone_count >= 2 && var.availability_zone_count <= 3
    error_message = "availability_zone_count must be 2 or 3."
  }
}

variable "admin_ssh_cidrs" {
  description = "CIDR blocks allowed to SSH into the bastion. Leave empty to automatically restrict access to the public IP of the machine running Terraform."
  type        = list(string)
  default     = []
}

variable "http_ingress_cidrs" {
  description = "CIDR blocks allowed to reach the shop through the load balancer."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

# --- Access ----------------------------------------------------------------

variable "ssh_public_key_path" {
  description = "Path to an existing SSH public key to install on the instances. Leave empty to have Terraform generate a dedicated key pair for this environment."
  type        = string
  default     = ""
}

variable "ssh_private_key_path" {
  description = "Path to the matching private key, published in the Ansible inventory. Required when ssh_public_key_path is set; ignored otherwise (the generated key is written to terraform/.ssh/)."
  type        = string
  default     = ""
}

variable "enable_bastion" {
  description = "Create the SSH jump host used by Ansible to configure the private instances."
  type        = bool
  default     = true
}

# --- Sizing (null = use the per-environment default from locals.tf) ---------

variable "app_instance_count" {
  description = "Number of PrestaShop instances. This is the scaling knob: raise it, apply, run the playbook again."
  type        = number
  default     = null
}

variable "app_instance_type" {
  description = "EC2 instance type of the PrestaShop instances."
  type        = string
  default     = null
}

variable "bastion_instance_type" {
  description = "EC2 instance type of the bastion host."
  type        = string
  default     = "t3.micro"
}

variable "app_ami_id" {
  description = "AMI of the application instances. Leave empty to use the latest Ubuntu 24.04 LTS image published by Canonical."
  type        = string
  default     = ""
}

variable "db_instance_class" {
  description = "RDS instance class."
  type        = string
  default     = null
}

variable "db_allocated_storage" {
  description = "RDS storage in GiB."
  type        = number
  default     = null
}

variable "db_engine_version" {
  description = "MySQL engine version used by PrestaShop."
  type        = string
  default     = "8.0"
}

variable "db_parameter_group_family" {
  description = "RDS parameter group family matching db_engine_version (mysql8.0 covers every 8.0.x release)."
  type        = string
  default     = "mysql8.0"
}

variable "db_name" {
  description = "Name of the PrestaShop schema."
  type        = string
  default     = "prestashop"
}

variable "db_master_username" {
  description = "Master user of the database instance."
  type        = string
  default     = "psadmin"
}

variable "prestashop_admin_dir" {
  description = "Folder name of the PrestaShop back office. It is published to the Ansible inventory, so the shop and the admin_url output can never disagree."
  type        = string
  default     = "admin-taylorshift"
}

# --- TLS and DNS (optional) ------------------------------------------------

variable "certificate_arn" {
  description = "ARN of an ACM certificate in the same region. When set, the load balancer serves HTTPS and redirects HTTP to it."
  type        = string
  default     = ""
}

variable "domain_name" {
  description = "Fully qualified domain name of the shop, for example shop.taylorshift.com. Requires route53_zone_id."
  type        = string
  default     = ""
}

variable "route53_zone_id" {
  description = "Route 53 hosted zone in which the alias record of the shop is created."
  type        = string
  default     = ""
}

# --- Operations ------------------------------------------------------------

variable "alarm_email" {
  description = "Address subscribed to the CloudWatch alarm topic. Leave empty to create no subscription."
  type        = string
  default     = ""
}
