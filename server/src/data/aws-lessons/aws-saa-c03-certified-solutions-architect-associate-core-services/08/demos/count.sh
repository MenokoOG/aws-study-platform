#!/bin/bash

# Counter variable
count=1

# Log file
log_file="count.log"

# Trap the Enter key to exit the loop
trap "exit" INT

echo "Break out using ctrl+c to stop the loop..."

# Create our log file
> "$log_file"

# Infinite loop
while true; do
    echo $count | tee -a "$log_file"
    count=$((count + 1))  # Increment the counter
    sleep 1                # Wait for 1 second
done

