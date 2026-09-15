provider "aws" {
  region = var.aws_region

  # Every resource is tagged, which is what makes cost reporting per
  # environment and "who owns this?" answerable.
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
      Owner       = var.owner
    }
  }
}
