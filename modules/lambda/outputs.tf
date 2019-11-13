output "authorize_arn" {
  value = "${aws_lambda_function.oauth_lambda.invoke_arn}"
}
