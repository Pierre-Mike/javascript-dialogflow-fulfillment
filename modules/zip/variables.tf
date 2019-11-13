variable "region" {
  type = "string"
}

variable "source_dir" {
  type        = "string"
  description = "The name of the folder containing your app"
}

variable "source_pkg" {
  type        = "string"
  description = "Unique name of the zipfile containing your app"
}
