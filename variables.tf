variable "region" {
  type    = "string"
  default = "us-west-1"
}

variable "zip_bucket_name" {
  type    = "string"
  default = "pierre-mike-s3-lambda-zip-terraform"
}

variable "function_name" {
  type    = "string"
  default = "pierre-mike-lambda-terraform"
}


variable "source_app_dir" {
  type    = "string"
  default = "app/"
}

variable "lambda_role_name" {
  type    = "string"
  default = "pierre-mike-role-terraform"
}
variable "lambda_policy_name" {
  type    = "string"
  default = "pierre-mike-policy-terraform"
}

variable "env_type" {
  type = "map"
  default = {
    prod = "prod"
    dev  = "npe"
    qa   = "npe"
    test = "npe"
  }
}


variable "tags" {
  type = "map"
  default = {
    owner = "pierre-mike"
  }
}
