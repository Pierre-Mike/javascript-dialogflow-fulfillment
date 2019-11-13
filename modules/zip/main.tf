data "archive_file" "zipfile" {
  type        = "zip"
  source_dir  = "${var.source_dir}"
  output_path = "target/${var.source_pkg}"
}