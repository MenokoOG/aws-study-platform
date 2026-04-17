import os
import boto3
from PIL import Image
import io

s3_client = boto3.client("s3")


def lambda_handler(event, context):
    # Get the bucket and filename from the event
    source_bucket = event["Records"][0]["s3"]["bucket"]["name"]
    key = event["Records"][0]["s3"]["object"]["key"]

    # Get the destination bucket from the environment variable
    destination_bucket = os.environ["DESTINATION_BUCKET"]

    # Download the image from the source bucket
    try:
        response = s3_client.get_object(Bucket=source_bucket, Key=key)
        image_content = response["Body"].read()

        # Open the image using Pillow
        image = Image.open(io.BytesIO(image_content))

        # Resize the image by 50%
        new_size = (int(image.width * 0.5), int(image.height * 0.5))
        image = image.resize(new_size)

        # Save the resized image to a BytesIO object
        image_bytes = io.BytesIO()
        image.save(image_bytes, format="PNG")
        image_bytes.seek(0)

        # Define the new filename for the resized image, you can adjust this logic as needed
        new_key = f"resized-{key}"

        # Upload the resized image to the destination bucket
        s3_client.put_object(
            Bucket=destination_bucket,
            Key=new_key,
            Body=image_bytes,
            ContentType="image/png",
        )

        print(
            f"Successfully processed '{key}' and uploaded as '{new_key}' to '{destination_bucket}'"
        )

    except Exception as e:
        print(f"Error processing object {key} from bucket {source_bucket}. Error: {e}")
        raise e
