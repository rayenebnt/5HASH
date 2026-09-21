variable "project_name" {
  description = "Project name used as a prefix for the state bucket and lock table."
  type        = string
  default     = "taylorshift"
}

variable "aws_endpoint_url" {
  description = "Base URL of a local AWS emulator (Floci, LocalStack). Leave empty to target real AWS."
  type        = string
  default     = ""
}

variable "aws_region" {
  description = "AWS region that hosts the Terraform state bucket and the DynamoDB lock table."
  type        = string
  default     = "eu-north-1"
}

variable "state_bucket_name" {
  description = "Explicit name of the S3 state bucket. Leave empty to generate <project>-tfstate-<random suffix> (S3 bucket names are globally unique)."
  type        = string
  default     = ""
}

variable "force_destroy_state_bucket" {
  description = "Allow `terraform destroy` to delete a non-empty state bucket. Keep false outside of throwaway sandboxes."
  type        = bool
  default     = false
}
