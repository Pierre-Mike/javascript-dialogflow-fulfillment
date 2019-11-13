# Init terraform

- Run
  `teraform init`
  - if you get an error "s3 bucket do not exists" : comment backend ressource
  - and rerun `teraform init`
  - run `terraform plan`
  - run `terraform apply`
  - then : uncomment backend ressource
  - then rerun `teraform init`
- run `terraform plan`
- run `terraform apply`
