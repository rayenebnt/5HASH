terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

provider "aws" {
  region = var.aws_region

  access_key                  = var.aws_endpoint_url != "" ? "test" : null
  secret_key                  = var.aws_endpoint_url != "" ? "test" : null
  skip_credentials_validation = var.aws_endpoint_url != ""
  skip_metadata_api_check     = var.aws_endpoint_url != ""
  skip_requesting_account_id  = var.aws_endpoint_url != ""
  s3_use_path_style           = var.aws_endpoint_url != ""

  dynamic "endpoints" {
    for_each = var.aws_endpoint_url != "" ? [var.aws_endpoint_url] : []

    content {
      dynamodb = endpoints.value
      iam      = endpoints.value
      s3       = endpoints.value
      sts      = endpoints.value
    }
  }

  default_tags {
    tags = {
      Project   = var.project_name
      ManagedBy = "terraform"
      Component = "tf-state-backend"
    }
  }
}
