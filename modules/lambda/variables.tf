variable "region" {
  type = "string"
}

variable "current_env" {
  type    = "string"
}

variable "function_name" {
  type    = "string"
}

variable "lambda_pkg" {
  type = "string"
}


variable "s3_bucket" {
  type        = "string"
  description = "Name of the destination S3 bucket"
}

variable "role_arn" {
  type = "string"
}

variable "lambda_env" {
  type    = "map"
  default = {
	secret = "logic2020_chatbot_secret",
	redirectUrl = "https://1vu02c8zug.execute-api.us-west-1.amazonaws.com/prod/oauth/callback",
	clientId = "3cc225fe-64e6-46ae-b5e3-6e0e873d1441",
	providerAuthorizeEndpoint = "https://login.microsoftonline.com/d513ec41-c5ae-4017-810e-fdca680bdc77/oauth2/v2.0/authorize",
	scope = "profile offline_access User.Read Calendars.Read Calendars.Read.Shared openid"
  }
}