#!/bin/bash

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

# Run the Python script with nohup
nohup /serverhome/python/bin/python3 main.py > nohup.out 2>&1 &

echo "Server running on port $PORT"