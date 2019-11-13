output "role_arn" {
  value = "${aws_iam_role.iam_for_lambda.arn}"
}

output "output_role_name" {
  value = "${aws_iam_role.iam_for_lambda.name}"
}
