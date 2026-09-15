# Shared, multi-AZ file system holding the PrestaShop document root. Every
# application instance mounts the same directory, so uploaded product pictures,
# generated thumbnails, installed modules and the PHP session files are visible
# from every instance: adding or losing an instance changes nothing for users.

resource "aws_efs_file_system" "this" {
  creation_token   = "${var.name_prefix}-efs"
  encrypted        = true
  performance_mode = "generalPurpose"
  throughput_mode  = var.throughput_mode

  tags = merge(var.tags, { Name = "${var.name_prefix}-efs" })
}

# One mount target per AZ: instances always talk to the endpoint in their own
# availability zone (no cross-AZ traffic, no cross-AZ failure domain).
resource "aws_efs_mount_target" "this" {
  count = length(var.subnet_ids)

  file_system_id  = aws_efs_file_system.this.id
  subnet_id       = var.subnet_ids[count.index]
  security_groups = var.security_group_ids
}

resource "aws_efs_backup_policy" "this" {
  count = var.enable_backup ? 1 : 0

  file_system_id = aws_efs_file_system.this.id

  backup_policy {
    status = "ENABLED"
  }
}
