resource "aws_s3_bucket_object" "oauthLambdaS3Upload" {
  bucket = "${var.s3_bucket}"
  key    = "${var.current_env}-artifacts/lambdas/${var.lambda_pkg}"
  source = "${var.lambda_pkg}"
  
  etag = "${filemd5("${var.lambda_pkg}")}"
}


resource "aws_lambda_function" "oauth_lambda" {
  s3_bucket 		= "${aws_s3_bucket_object.oauthLambdaS3Upload.bucket}"
  s3_key 			= "${aws_s3_bucket_object.oauthLambdaS3Upload.key}"
  s3_object_version = "${aws_s3_bucket_object.oauthLambdaS3Upload.version_id}"
  function_name = "${var.function_name}"
  role          = "${var.role_arn}"
  handler       = "index.handler"
  publish = true
  source_code_hash = "${filebase64sha256("${var.lambda_pkg}")}"
  # https://github.com/hashicorp/terraform/issues/12443
  # source_code_hash = "${base64sha256(file(local.zip_full_path))}"
  # bucket etag = "${md5(file(local.zip_full_path))}"
  
  # The filebase64sha256() function is available in Terraform 0.11.12 and later
  # For Terraform 0.11.11 and earlier, use the base64sha256() function and the file() function:
  # source_code_hash = "${base64sha256(file("lambda_function_payload.zip"))}"

  runtime = "nodejs8.10"
  
  environment {
	variables = {
		secret = "${var.lambda_env.secret}",
		redirectUrl = "${var.lambda_env.redirectUrl}",
		clientId = "${var.lambda_env.clientId}",
		providerAuthorizeEndpoint = "${var.lambda_env.providerAuthorizeEndpoint}",
		scope = "${var.lambda_env.scope}"
	}
  }
}

