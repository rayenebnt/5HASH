variable "name_prefix" {
  description = "Prefix applied to the name of every security group created by this module."
  type        = string
}

variable "vpc_id" {
  description = "VPC the security groups belong to."
  type        = string
}

variable "http_ingress_cidrs" {
  description = "CIDR blocks allowed to reach the public load balancer on HTTP/HTTPS."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "admin_ssh_cidrs" {
  description = "CIDR blocks allowed to open an SSH session on the bastion. Keep it as small as possible; the rest of the fleet is only reachable through this host."
  type        = list(string)
}

variable "enable_https" {
  description = "Open port 443 on the load balancer security group."
  type        = bool
  default     = false
}

variable "app_port" {
  description = "TCP port the application container listens on."
  type        = number
  default     = 80
}

variable "tags" {
  description = "Additional tags merged into every resource of this module."
  type        = map(string)
  default     = {}
}
