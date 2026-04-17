#!/bin/bash  

# Allowing YUM updates and installations from cloud_user  
echo '%password%' | passwd cloud_user --stdin  
yum update -y  
yum install -y httpd  

# Starting and enabling HTTPD service  
systemctl start httpd.service  
systemctl enable httpd.service  

# Adding HTTPD group and adding cloud_user  
groupadd www  
usermod -a -G www cloud_user  

# Get the IMDSv2 token  
TOKEN=`curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600"`  

# Creating simple index.html file for HTTPD base page  
echo '<html><h1>Hello Gurus!</h1><h2>I live in this Availability Zone: ' > /var/www/html/index.html  
curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/placement/availability-zone >> /var/www/html/index.html  
echo '</h2> <h2>I go by this Instance Id: ' >> /var/www/html/index.html  
curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id >> /var/www/html/index.html  
echo '</2></html> ' >> /var/www/html/index.html  

# Restarting HTTPD service to enforce new index.html just to be safe.  
systemctl restart httpd.service