# Backend bootstrap: the S3 bucket and DynamoDB table that hold the Terraform
# state of the application stack. This module keeps its own state locally
# (chicken-and-egg problem: it creates the remote backend itself) and is applied
# once per AWS account.

resource "random_id" "suffix" {
  byte_length = 4
}

locals {
  bucket_name = var.state_bucket_name != "" ? var.state_bucket_name : "${var.project_name}-tfstate-${random_id.suffix.hex}"
  table_name  = "${var.project_name}-tfstate-locks"
}

resource "aws_s3_bucket" "state" {
  bucket        = local.bucket_name
  force_destroy = var.force_destroy_state_bucket

  tags = {
    Name = local.bucket_name
  }
}

# Versioning keeps every state revision, which is the only way back after a
# corrupted or accidentally truncated state file.
resource "aws_s3_bucket_versioning" "state" {
  bucket = aws_s3_bucket.state.id

  versioning_configuration {
    status = "Enabled"
  }
}

# The state contains generated secrets (DB password, SSH key), so it is
# encrypted at rest and never exposed publicly.
resource "aws_s3_bucket_server_side_encryption_configuration" "state" {
  bucket = aws_s3_bucket.state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "state" {
  bucket = aws_s3_bucket.state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "state" {
  bucket = aws_s3_bucket.state.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_policy" "deny_insecure_transport" {
  bucket = aws_s3_bucket.state.id
  policy = data.aws_iam_policy_document.deny_insecure_transport.json
}

data "aws_iam_policy_document" "deny_insecure_transport" {
  statement {
    sid    = "DenyInsecureTransport"
    effect = "Deny"

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    actions   = ["s3:*"]
    resources = [aws_s3_bucket.state.arn, "${aws_s3_bucket.state.arn}/*"]

    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }
}

# State locking. Terraform >= 1.10 can lock with an S3 object (`use_lockfile`),
# older versions need this table; it is cheap (pay-per-request) and keeps the
# backend usable from any Terraform version the team runs.
resource "aws_dynamodb_table" "locks" {
  name         = local.table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  server_side_encryption {
    enabled = true
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name = local.table_name
  }
}
