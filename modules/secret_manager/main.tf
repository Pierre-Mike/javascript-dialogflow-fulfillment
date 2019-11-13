resource "aws_secretsmanager_secret" "settings_secret" {
  name                    = "${var.secret_name}"
  recovery_window_in_days = "0"
}

resource "aws_iam_policy" "secret_manager" {
  name        = "terraform-lambda-secrets-manager"
  path        = "/"
  description = "IAM policy for acces to secret manager from lambda"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "${aws_secretsmanager_secret.settings_secret.arn}",
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "attach_secret_manager" {
  role       = "${var.role}"
  policy_arn = "${aws_iam_policy.secret_manager.arn}"
}
