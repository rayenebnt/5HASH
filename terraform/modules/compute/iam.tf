# Instance role: the application instances read their own database credentials
# from Secrets Manager and can be reached through SSM Session Manager when the
# bastion is unavailable. No long lived AWS keys are ever placed on a host.

data "aws_iam_policy_document" "ec2_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "app" {
  name               = "${var.name_prefix}-app"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "app_ssm" {
  role       = aws_iam_role.app.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

data "aws_iam_policy_document" "app" {
  statement {
    sid       = "ReadDatabaseCredentials"
    effect    = "Allow"
    actions   = ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"]
    resources = [var.db_secret_arn]
  }

  dynamic "statement" {
    for_each = var.efs_file_system_arn != "" ? [var.efs_file_system_arn] : []

    content {
      sid    = "MountSharedFileSystem"
      effect = "Allow"
      actions = [
        "elasticfilesystem:ClientMount",
        "elasticfilesystem:ClientWrite",
        "elasticfilesystem:DescribeMountTargets",
      ]
      resources = [statement.value]
    }
  }
}

resource "aws_iam_role_policy" "app" {
  name   = "${var.name_prefix}-app"
  role   = aws_iam_role.app.id
  policy = data.aws_iam_policy_document.app.json
}

resource "aws_iam_instance_profile" "app" {
  name = "${var.name_prefix}-app"
  role = aws_iam_role.app.name

  tags = var.tags
}
