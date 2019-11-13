provider "aws" {
  version = "~> 2.7"
  region  = "${var.region}"
}

resource "aws_s3_bucket" "s3_lambda_zip" {
  bucket = "${var.zip_bucket_name}-${var.env_type["${var.current_env}"]}"
  # Enable versioning so we can see the full revision history of our
  # state files
  versioning {
    enabled = true
  }
  # Enable server-side encryption by default
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

# Since this is a simple POC, we use S3 repo in same region as the rest of the project
# The bucket must be created before terraform can use it. Therefore:
# First init and apply the state with the desired bucket configured above, but with the following terraform backend commented out.
# Then uncomment this and init again.

terraform {
  backend "s3" {
    bucket         = "pierre-mike-s3"
    key            = "pierre-mike/terraform.tfstate"
    region         = "us-west-1"
    dynamodb_table = "pierre-mike-dynamo-terraform-locks"
    encrypt        = true
  }
}

module "authorizeLambdaPkg" {
  source     = "./modules/zip"
  region     = "${var.region}"
  source_dir = "${var.source_app_dir}"
  source_pkg = "lambda.zip"
}

module "lambda_role" {
  source          = "./modules/lambda_role"
  region          = "${var.region}"
  iam_role_name   = "${var.lambda_role_name}"
  iam_policy_name = "${var.lambda_policy_name}"
  # gateway_arn = "${module.gateway_lamba.execution_arn}"
}

module "lambda" {
  source = "./modules/lambda"
  # you cant change a function name using terraform!
  function_name = "${var.current_env}-${var.function_name}"
  region        = "${var.region}"
  role_arn      = "${module.lambda_role.role_arn}"
  s3_bucket     = "${var.zip_bucket_name}-${var.env_type["${var.current_env}"]}"
  lambda_pkg    = "${module.authorizeLambdaPkg.filename}"
  current_env   = "${var.current_env}"
}

# Secret can be created (with env- prefix), but should be empty

# DO NOT ADD API GATEWAY here. That is one-time setup that can be done in the AWS portal.
# Beware: If we destroy+recreate an environment, API Gateway must be updated with the new lambda ARN.
