#!/bin/sh
total_tests=$1
current_test=$2

npx jest --listTests --json | \
jq --arg total_tests $total_tests --arg current_test $current_test '[_nwise(length / ($total_tests | tonumber))][($current_test | tonumber)-1] | join("|")' | \
xargs -r npm run test
