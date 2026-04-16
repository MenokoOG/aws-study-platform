# AWS CLI Cheat Sheet

The AWS Command‑Line Interface (CLI) is a unified tool for managing AWS services from your terminal.  It allows you to control resources across accounts and regions directly from the command line【233804253121922†L60-L68】.  Below is a selection of useful commands organized by category.  For additional examples, consult the official documentation or community cheat sheets.

## Configuration

- **Set up a named profile** – Create a profile with credentials and default settings:

  ```sh
  aws configure --profile <profile-name>
  ```

- **Set output format** – Choose between JSON, YAML, text or table output:

  ```sh
  aws configure output format json
  aws configure output format yaml
  ```
  The AWS CLI also allows you to specify a default region【233804253121922†L97-L110】.

- **Get help** – The built‑in help system is invaluable.  To see top‑level services:

  ```sh
  aws help
  ```

  To see commands for a specific service such as EC2:

  ```sh
  aws ec2 help
  ```
  Using `aws <service> help` shows the available sub‑commands【233804253121922†L82-L89】.

## General tips

- **Command completion** – Enable bash/zsh completion to use the Tab key for autocompleting commands and options【233804253121922†L75-L79】.
- **Parsing JSON output** – Use the [`jq`](https://stedolan.github.io/jq/) tool to filter JSON output.  For example:

  ```sh
  # List EC2 instance IDs and types
  aws ec2 describe-instances | jq -r '.Reservations[].Instances[] | .InstanceId + " " + .InstanceType'
  ```

## Identity and Access Management (IAM)

- **List users**:

  ```sh
  aws iam list-users
  ```

- **List roles**:

  ```sh
  aws iam list-roles
  ```

- **Create a role from a trust policy**:

  ```sh
  aws iam create-role --role-name MyRole --assume-role-policy-document file://trust-policy.json
  ```

- **Attach a policy to a role**:

  ```sh
  aws iam attach-role-policy --role-name MyRole --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
  ```

## Amazon S3

- **Create a bucket** (specify region as needed):

  ```sh
  aws s3api create-bucket --bucket my-bucket --region us-west-2 --create-bucket-configuration LocationConstraint=us-west-2
  ```

- **List buckets**:

  ```sh
  aws s3 ls
  ```

- **Upload a file to S3**:

  ```sh
  aws s3 cp ./local-file.txt s3://my-bucket/path/to/remote-file.txt
  ```

- **Enable bucket encryption**:

  ```sh
  aws s3api put-bucket-encryption --bucket my-bucket --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
  ```

## Amazon EC2

- **List running instances with type and name tag** – Using `--query` and `jq` together provides flexible filtering【233804253121922†L257-L263】:

  ```sh
  aws ec2 describe-instances --query 'Reservations[*].Instances[?State.Name==`running`].{Id:InstanceId,Type:InstanceType,Name:Tags[?Key==`Name`]|[0].Value}' --output table
  ```

- **Start/stop an instance**:

  ```sh
  aws ec2 start-instances --instance-ids i-0123456789abcdef0
  aws ec2 stop-instances  --instance-ids i-0123456789abcdef0
  ```

- **Create an AMI from an instance**:

  ```sh
  aws ec2 create-image --instance-id i-0123456789abcdef0 --name "my-ami" --no-reboot
  ```

## Serverless and Messaging

- **Invoke a Lambda function**:

  ```sh
  aws lambda invoke --function-name my-function --payload '{"key":"value"}' output.json
  ```

- **List SQS queues**:

  ```sh
  aws sqs list-queues
  ```

- **Send a message to a queue**:

  ```sh
  aws sqs send-message --queue-url https://sqs.us-west-2.amazonaws.com/123456789012/my-queue --message-body "Hello from CLI"
  ```

## Monitoring

- **List CloudWatch alarms** – Use `describe-alarms` to view alarms (requires `jq` for clean output)【233804253121922†L169-L174】:

  ```sh
  aws cloudwatch describe-alarms
  ```

- **Get metrics for a specific instance**:

  ```sh
  aws cloudwatch get-metric-statistics --namespace AWS/EC2 --metric-name CPUUtilization \
    --dimensions Name=InstanceId,Value=i-0123456789abcdef0 --statistics Average --period 300 \
    --start-time 2024-01-01T00:00:00Z --end-time 2024-01-02T00:00:00Z
  ```

## Cost management

- **View AWS cost and usage report** (requires the Cost and Usage Report to be configured):

  ```sh
  aws cur describe-report-definitions
  ```

- **Use Cost Explorer to retrieve cost data**:

  ```sh
  aws ce get-cost-and-usage --time-period Start=2026-01-01,End=2026-01-31 --granularity MONTHLY --metrics "UnblendedCost"
  ```

This cheat sheet serves as a starting point.  Many other AWS services are covered in the full CLI reference.  Always test commands in a non‑production environment and follow least‑privilege principles.