variable "name_prefix" {
  description = "Prefix applied to the name of every resource created by this module."
  type        = string
}

variable "vpc_id" {
  description = "VPC hosting the target group."
  type        = string
}

variable "subnet_ids" {
  description = "Public subnets the load balancer nodes live in (one per availability zone)."
  type        = list(string)
}

variable "security_group_ids" {
  description = "Security groups of the load balancer."
  type        = list(string)
}

variable "target_instance_ids" {
  description = "Instances registered in the target group."
  type        = list(string)
}

variable "app_port" {
  description = "Port the application container listens on."
  type        = number
  default     = 80
}

variable "health_check_path" {
  description = "Path polled by the load balancer health check. It must be cheap: it is requested by every load balancer node every health_check_interval seconds."
  type        = string
  default     = "/health.php"
}

variable "health_check_interval" {
  description = "Seconds between two health checks."
  type        = number
  default     = 15
}

variable "healthy_threshold" {
  description = "Number of consecutive successful checks before an instance receives traffic again."
  type        = number
  default     = 2
}

variable "unhealthy_threshold" {
  description = "Number of consecutive failed checks before an instance is taken out of rotation."
  type        = number
  default     = 2
}

variable "deregistration_delay" {
  description = "Seconds the load balancer waits for in-flight requests before removing an instance (connection draining)."
  type        = number
  default     = 30
}

variable "stickiness_enabled" {
  description = "Pin a browser session to one instance with a load balancer cookie. PrestaShop keeps its PHP sessions on the shared file system, so this is a latency optimisation rather than a requirement."
  type        = bool
  default     = true
}

variable "stickiness_duration" {
  description = "Lifetime of the stickiness cookie in seconds."
  type        = number
  default     = 86400
}

variable "idle_timeout" {
  description = "Seconds an idle connection is kept open by the load balancer."
  type        = number
  default     = 60
}

variable "enable_https" {
  description = "Add an HTTPS listener and redirect HTTP to it. Requires certificate_arn."
  type        = bool
  default     = false
}

variable "certificate_arn" {
  description = "ARN of the ACM certificate used by the HTTPS listener."
  type        = string
  default     = ""
}

variable "ssl_policy" {
  description = "Predefined ALB SSL security policy used by the HTTPS listener."
  type        = string
  default     = "ELBSecurityPolicy-TLS13-1-2-2021-06"
}

variable "enable_deletion_protection" {
  description = "Refuse to delete the load balancer. Enable it in production."
  type        = bool
  default     = false
}

variable "response_time_alarm_threshold" {
  description = "Average target response time in seconds above which the latency alarm fires. It is the signal to add instances."
  type        = number
  default     = 2
}

variable "alarm_actions" {
  description = "ARNs notified when an alarm fires (for example an SNS topic)."
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Additional tags merged into every resource of this module."
  type        = map(string)
  default     = {}
}
