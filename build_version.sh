#!/bin/sh
#yorkie 2.0.0

version=$(git rev-parse  HEAD)
var_date=$(date +'%Y-%m-%d')

# sed -i "s/.*API_BUILD.*/API_BUILD='${var_date} ${version}'/" .env
grep -q '^API_BUILD' .env && sed -i "s/^API_BUILD.*/API_BUILD='${var_date} ${version}'/" .env || echo "API_BUILD='${var_date} ${version}'" >> .env