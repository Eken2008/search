#!/bin/bash

# Check for sudo permissions
if [ "$EUID" -ne 0 ]; then
    echo "This script needs to be run with superuser privileges."
    exit
fi

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "Error: .env file not found"
    exit 1
fi

# Check if PORT is set
if [ -z "$PORT" ]; then
    echo "Error: PORT not defined in .env file"
    exit 1
fi

fuser -k $PORT/tcp

echo "Server on port $PORT stopped."