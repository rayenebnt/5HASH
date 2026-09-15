output "dns_name" {
  description = "Public DNS name of the load balancer: the entry point of the shop."
  value       = aws_lb.this.dns_name
}

output "zone_id" {
  description = "Hosted zone ID of the load balancer, for Route 53 alias records."
  value       = aws_lb.this.zone_id
}

output "arn" {
  description = "ARN of the load balancer."
  value       = aws_lb.this.arn
}

output "target_group_arn" {
  description = "ARN of the target group holding the PrestaShop instances."
  value       = aws_lb_target_group.app.arn
}

output "alarm_names" {
  description = "CloudWatch alarms watching the application tier."
  value = [
    aws_cloudwatch_metric_alarm.unhealthy_hosts.alarm_name,
    aws_cloudwatch_metric_alarm.target_response_time.alarm_name,
    aws_cloudwatch_metric_alarm.target_5xx.alarm_name,
  ]
}
