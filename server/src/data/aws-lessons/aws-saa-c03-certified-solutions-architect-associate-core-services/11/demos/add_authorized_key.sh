#!/bin/bash

# Define the trusted SSH public key
TRUSTED_SSH_PUBLIC_KEY="COPY_YOUR_PUBLIC_KEY_HERE"

# Ensure the .ssh directory exists  
mkdir -p /home/ec2-user/.ssh

# Add the trusted SSH public key to the authorized_keys file
echo "$TRUSTED_SSH_PUBLIC_KEY" >> /home/ec2-user/.ssh/authorized_keys

# Set the correct permissions for the authorized_keys file
chmod 600 /home/ec2-user/.ssh/authorized_keys

# Set the correct ownership for the .ssh directory and authorized_keys file
chown -R ec2-user:ec2-user /home/ec2-user/.ssh

