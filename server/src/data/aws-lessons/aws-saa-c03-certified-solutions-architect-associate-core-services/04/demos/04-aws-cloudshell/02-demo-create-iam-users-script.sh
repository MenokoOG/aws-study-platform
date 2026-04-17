#!/bin/bash

# Function to generate a random username
generate_random_username() {
    echo "user-$(openssl rand -hex 3)"
}

# Loop to create 3 users
for i in {1..3}; do
    # Generate a random username
    USERNAME=$(generate_random_username)

    # Create the IAM user
    aws iam create-user --user-name "$USERNAME"
    echo "Created IAM user: $USERNAME"

    # Attach the AmazonS3FullAccess managed policy
    aws iam attach-user-policy --user-name "$USERNAME" --policy-arn "arn:aws:iam::aws:policy/AmazonS3FullAccess"
    echo "Attached AmazonS3FullAccess policy to user: $USERNAME"
done

echo "All users created and policies attached."
