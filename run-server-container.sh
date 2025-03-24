#!/usr/bin/env bash

# Usage:
# ./run-server-container.sh
#
# or
# specify container name and host port
#
# 1: name only
# ./run-server-container.sh cool_container
#
# 2: both name and port
# ./run-server-container.sh cool_container 5000

# Get the container name from the first argument or assign 'server' if not provided
cntr_name=${1:-local_server}
img_name="${cntr_name}_img"

cntr_port=5001
host_port=${2:-5001}

# Get the auth token from environment variables
auth_token="GITHUB_AUTH_TOKEN=$GITHUB_AUTH_TOKEN"

# Remove image and containers with name if exists
sudo docker image rm "$img_name" -f &&
    sudo docker rm "$cntr_name" -f &&

    # Build image and run container
    sudo docker build -t "$img_name" --build-arg "$auth_token" . &&
    sudo docker run --name "$cntr_name" -p "$host_port":$cntr_port "$img_name"
