provider "aws" {
  region = var.aws_region

  # Against a local emulator there is no account to validate, no instance
  # metadata to reach and no DNS-style S3 bucket hostnames.
  access_key                  = local.emulated ? "test" : null
  secret_key                  = local.emulated ? "test" : null
  skip_credentials_validation = local.emulated
  skip_metadata_api_check     = local.emulated
  skip_requesting_account_id  = local.emulated
  s3_use_path_style           = local.emulated

  dynamic "endpoints" {
    for_each = local.emulated ? [var.aws_endpoint_url] : []

    content {
      cloudwatch     = endpoints.value
      dynamodb       = endpoints.value
      ec2            = endpoints.value
      efs            = endpoints.value
      elb            = endpoints.value
      elbv2          = endpoints.value
      iam            = endpoints.value
      kms            = endpoints.value
      logs           = endpoints.value
      rds            = endpoints.value
      route53        = endpoints.value
      s3             = endpoints.value
      secretsmanager = endpoints.value
      sns            = endpoints.value
      ssm            = endpoints.value
      sts            = endpoints.value
    }
  }

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
