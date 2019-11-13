provider "aws" {
  version = "~> 2.7"
  region  = "us-west-1"
}



resource "aws_s3_bucket" "prod_terraform_state" {
  bucket = "pierre-mike-s3"
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

resource "aws_dynamodb_table" "terraform_locks" {
  name         = "pierre-mike-dynamo-terraform-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"
  attribute {
    name = "LockID"
    type = "S"
  }
}

# This project will define its own backend (under "global" folder) and the chatbot project will use the same bucket (env folders) and DynamoDb table
# If erreur comment here >
terraform {
  backend "s3" {
    bucket         = "pierre-mike-s3"
    key            = "pierre-mike/terraform.tfstate"
    region         = "us-west-1"
    dynamodb_table = "pierre-mike-dynamo-terraform-locks"
    encrypt        = true
  }
}
# If erreur comment to here <
