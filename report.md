# AWS Solutions Architect Study Platform: Research and Application Overview

## Overview of the AWS Certified Solutions Architect – Associate (SAA‑C03) Exam

The AWS Certified Solutions Architect – Associate exam validates a candidate’s ability to design AWS solutions that follow the Well‑Architected Framework.  According to the official exam guide, the exam assesses whether a candidate can **design architectures that are secure, resilient, high‑performing and cost‑optimized**【506934707838674†L92-L97】.  Candidates should have at least one year of hands‑on experience designing cloud solutions and be able to design solutions that use AWS services to meet current and future business requirements【506934707838674†L9-L14】.  The exam contains 50 scored questions and 15 unscored questions.  Questions are a mix of multiple‑choice and multiple‑response, and the minimum passing scaled score is **720**【506934707838674†L25-L60】.

### Domain weighting

The exam content is divided into four domains【506934707838674†L92-L97】:

| Domain | % of score | Focus |
|------|-------------|------|
| **Domain 1 – Design Secure Architectures** | 30 % | Designing secure access to AWS resources, secure workloads/applications, and appropriate data‑security controls【506934707838674†L92-L97】. |
| **Domain 2 – Design Resilient Architectures** | 26 % | Building scalable, loosely coupled, highly available and fault‑tolerant architectures using AWS managed services, event‑driven patterns, microservices and DR strategies【506934707838674†L163-L190】. |
| **Domain 3 – Design High‑Performing Architectures** | 24 % | Selecting high‑performance storage, compute, database and network solutions to meet performance and scalability requirements【506934707838674†L248-L333】. |
| **Domain 4 – Design Cost‑Optimized Architectures** | 20 % | Designing storage, compute, database and network architectures that minimize cost while meeting requirements【506934707838674†L362-L401】. |

### Key tasks and knowledge areas

Below is a condensed summary of the tasks and knowledge statements highlighted in the official exam guide.  The bullets are not exhaustive; refer to the exam guide for full details.

**Domain 1 – Design Secure Architectures** (30 %)【506934707838674†L96-L117】:

- *Secure access* – Understand identity‑and‑access management (IAM) concepts, federated access, AWS global infrastructure and the AWS shared‑responsibility model.  Be able to apply least‑privilege principles, design flexible authorization models with IAM users/groups/roles/policies, and plan cross‑account access strategies【506934707838674†L100-L116】.
- *Secure workloads & applications* – Know how to secure application credentials, endpoints and network traffic; design VPC architectures with security components (security groups, route tables, network ACLs, NAT gateways); implement network segmentation; integrate services such as AWS Shield, WAF and Secrets Manager; and secure external connections (VPN, Direct Connect)【506934707838674†L117-L140】.
- *Data security controls* – Understand data access governance, recovery, retention and encryption; map AWS technologies to compliance requirements; encrypt data at rest and in transit using KMS and Certificate Manager; manage encryption keys and certificates; implement backup, replication, lifecycle and key‑rotation policies【506934707838674†L141-L156】.

**Domain 2 – Design Resilient Architectures** (26 %)【506934707838674†L163-L190】:

- *Scalable, loosely coupled architectures* – Know API creation/management (API Gateway, REST), AWS managed services (SQS, Secrets Manager, Transfer Family), caching, microservices vs. monolithic design, event‑driven architectures, horizontal and vertical scaling, use of edge accelerators (CloudFront), containers and orchestration (ECS/EKS), serverless (Lambda, Fargate), storage options (object/file/block) and read‑replicas【506934707838674†L163-L190】.  You should be able to design event‑driven and multi‑tier architectures, select appropriate services to achieve loose coupling and decide when to use containers or serverless【506934707838674†L195-L206】.
- *High availability & fault tolerance* – Understand AWS global infrastructure, load balancing, disaster‑recovery strategies (backup and restore, pilot light, warm standby, active‑active), distributed design patterns, failover strategies, immutable infrastructure, storage durability, quotas/throttling and workload visibility (e.g., X‑Ray)【506934707838674†L206-L247】.  You must be able to automate infrastructure deployment, select services for cross‑region or multi‑AZ high availability, identify metrics for availability, mitigate single points of failure, implement backups and choose appropriate DR strategies【506934707838674†L206-L247】.

**Domain 3 – Design High‑Performing Architectures** (24 %)【506934707838674†L249-L333】:

- *Storage* – Know hybrid storage options, AWS storage services (S3, EFS, EBS), and storage types (object, file, block).  Be able to choose and configure storage for performance and scalability【506934707838674†L249-L262】.
- *Compute* – Know AWS compute services (Batch, EMR, Fargate), distributed computing with global/edge infrastructure, messaging, auto‑scaling, serverless patterns and container orchestration.  Be able to decouple workloads, select appropriate compute types/features and tune resources for performance【506934707838674†L262-L285】.
- *Databases* – Understand caching (ElastiCache), data access patterns, capacity planning, connections/proxies, replication and database engines/types (Aurora, DynamoDB, relational vs. non‑relational).  Be able to configure read replicas, design database architectures, choose database engines/types and integrate caching【506934707838674†L286-L299】【506934707838674†L309-L314】.
- *Networking* – Know edge networking services (CloudFront, Global Accelerator), network design (subnets, routing, IP addressing), load balancing, VPN/Direct Connect/PrivateLink.  Be able to design scalable network topologies, place resources appropriately and select load‑balancing strategies【506934707838674†L315-L329】.

**Domain 4 – Design Cost‑Optimized Architectures** (20 %)【506934707838674†L362-L401】:

- *Cost‑optimized storage* – Understand access options (e.g., S3 Requester Pays), AWS cost‑management features (cost allocation tags, multi‑account billing), cost‑management tools (Cost Explorer, Budgets, Cost & Usage Report), storage services (FSx, EFS, S3, EBS), backup strategies, storage lifecycles and tiering.  You should be able to select cost‑effective storage services, determine storage size, choose low‑cost data‑transfer methods and manage object lifecycles【506934707838674†L362-L401】.
- *Cost‑optimized compute* – Know cost‑management features/tools and purchasing options (Spot, Reserved Instances, Savings Plans).  Understand distributed compute strategies (edge processing), hybrid compute options (Outposts, Snowball Edge), instance types/families/sizes and compute utilization optimization (containers, serverless, microservices).  Be able to choose load‑balancing and scaling strategies, select cost‑effective compute services and size instances appropriately【506934707838674†L402-L433】.
- *Cost‑optimized databases* – Understand cost‑management features/tools, caching strategies, retention policies, capacity planning, connections/proxies, database engines/types, replication and migration.  Be able to design backup/retention policies, select database engines/types and migrate schemas/data【506934707838674†L439-L458】.
- *Cost‑optimized networking* – Know cost‑management features/tools, load balancing, NAT gateway cost considerations, network connectivity (private/dedicated lines, VPNs), network routing/topology/peering (Transit Gateway, VPC peering), network services (DNS) and CDN/edge caching.  Be able to select NAT gateways, configure cost‑effective connectivity and routing, plan CDNs/edge caching, optimize existing workloads and choose throttling strategies【506934707838674†L470-L493】.

## Free Study Resources and Instructional Materials

Although AWS restricts direct access to some pages, there are still freely available resources to help you prepare:

- **Official Exam Guide** – The AWS Certified Solutions Architect Associate exam guide (PDF) outlines domains, task statements, example topics, scoring and exam policies【506934707838674†L92-L97】.  Reviewing this guide should be your first step in understanding the exam structure.
- **AWS Digital Training** – The AWS Skill Builder platform offers hundreds of self‑paced digital courses and exam‑prep resources.  While some content requires a subscription, there are free courses covering fundamentals of networking, compute, storage and security.
- **Free practice exams and question banks** – Many training providers publish free sample questions.  Look for “AWS Solutions Architect Associate free practice questions” to find sets of 30–50 questions to gauge your readiness.
- **YouTube bootcamps** – Several instructors publish complete “AWS Solutions Architect Associate” bootcamps on YouTube.  These videos usually cover core services, architecture patterns and exam‑style questions at no cost.
- **Blogs and cheat sheets** – Blog posts and cheat sheets summarizing AWS services and CLI commands can provide quick references.  For example, Blue Matador’s AWS CLI cheat sheet explains that the AWS CLI allows you to manage AWS resources across accounts and regions from the command line【233804253121922†L60-L68】 and highlights helpful commands such as using `aws help` to discover available sub‑commands【233804253121922†L82-L89】.

## Proposed Study & Lesson Platform

To help you prepare for the exam, a full‑stack study platform can be built using **React** and **Vite** on the front end and **Express** on the back end.  The platform would serve four main purposes:

1. **Lessons** – Each lesson aligns with one of the four exam domains.  Lessons include learning objectives, explanatory text, diagrams and links to free resources (e.g., the official exam guide, blog posts, free practice questions).
2. **Hands‑on projects** – At the end of each lesson, a hands‑on project gives you practical experience with AWS services.  Projects are described using step‑by‑step instructions and expected outcomes.
3. **Quizzes** – Short quizzes assess your understanding of each lesson.  Questions are multiple‑choice or multiple‑response and include explanations after submission.
4. **Cheat sheets** – A dedicated section provides quick reference material for AWS CLI commands, AWS service limits, and common development commands (npm, Vite, React).  The cheat sheet draws inspiration from resources like Blue Matador’s CLI guide【233804253121922†L60-L68】.

### Architecture Overview

The application is separated into a **back‑end** and a **front‑end**:

- **Back‑end (Node.js/Express)** – Serves lesson metadata, quiz questions and project descriptions via a REST API (e.g., `/api/lessons`, `/api/lessons/:id`, `/api/quizzes/:lessonId`, `/api/projects/:lessonId`).  Data is stored in JSON files for simplicity.  You can extend the server later to use a database and authentication.
- **Front‑end (React/Vite)** – Fetches data from the API and renders pages for lessons, quizzes, projects and cheat sheets.  Routing can be handled with React Router.  Components such as `LessonList`, `LessonDetail`, `Quiz` and `CheatSheet` encapsulate individual views.  The UI uses CSS modules or a simple design framework for styling.

### Proposed Lessons and Hands‑On Projects

The table below outlines suggested lessons and projects for each domain.  Projects are designed to be completed in your own AWS account using the free tier where possible.

| Domain/Lesson | Key topics | Hands‑on project |
|---|---|---|
| **Lesson 1 – Secure Architectures** | IAM roles and policies, root vs. IAM users, MFA, networking security (VPC, subnets, security groups, network ACLs), AWS shared responsibility, encryption at rest and in transit【506934707838674†L96-L156】. | **Secure S3 and IAM** – Create an S3 bucket with encryption enabled, configure a bucket policy that grants read access to a specific IAM role, enable MFA‑delete, and configure a CloudFront distribution.  Create IAM roles for an application and implement cross‑account access.  Demonstrate encrypting data with KMS. |
| **Lesson 2 – Resilient Architectures** | Microservices vs. monolithic design, SQS/SNS, event‑driven architectures, edge caching (CloudFront), horizontal & vertical scaling, auto‑scaling, serverless (Lambda/Fargate), containers and orchestration (ECS/EKS), load balancing, DR strategies【506934707838674†L163-L247】. | **Serverless Message Processor** – Build a simple serverless application that uses Amazon API Gateway, AWS Lambda and SQS.  The API triggers a Lambda function that enqueues messages into SQS and another Lambda function that processes messages asynchronously.  Configure CloudWatch alarms and test high availability by deploying across multiple Availability Zones. |
| **Lesson 3 – High‑Performing Architectures** | Performance‑oriented storage (S3 vs. EFS vs. EBS), compute options (EC2, Fargate, Lambda, Batch), auto‑scaling policies, caching (ElastiCache), high‑performance database options (Aurora, DynamoDB) and network topologies (subnets, routing, Global Accelerator)【506934707838674†L249-L333】. | **Auto‑scaling Web App** – Deploy a simple web application on EC2 behind an Application Load Balancer with an Auto‑Scaling Group.  Configure CloudWatch metrics to scale based on CPU utilization.  For the database, create an Aurora Serverless cluster or DynamoDB table.  Add an ElastiCache Redis cluster to cache read‑heavy queries. |
| **Lesson 4 – Cost‑Optimized Architectures** | Cost allocation tags, cost‑management tools (Cost Explorer, Budgets), S3 storage classes (Standard, Infrequent Access, Glacier), Savings Plans/Reserved Instances/Spot Instances, cost‑effective database and network choices【506934707838674†L362-L401】. | **Cost‑Optimization Challenge** – Given a workload running on EC2 and storing data in S3, right‑size the instances, convert to a Savings Plan, enable S3 Intelligent‑Tiering and configure lifecycle rules to transition objects to Glacier.  Use AWS Cost Explorer to visualize the cost impact.  Compare NAT instance and NAT Gateway pricing, and implement the most cost‑effective solution. |

Each lesson page in the application can include a mini‑lecture (written content), diagrams, external resource links and the hands‑on project description.  After completing the project, you can take the quiz to reinforce the concepts.  Quizzes can include multiple‑choice and multiple‑response questions.

## Cheat Sheet Highlights

The cheat sheet component of the platform should compile frequently used commands and concepts.  A few examples include:

- **Configuring the AWS CLI** – Use `aws configure --profile <profile-name>` to create named profiles and set output format and region【233804253121922†L97-L109】.  You can choose JSON, YAML or text output formats and specify a default region【233804253121922†L103-L110】.
- **Getting help** – The AWS CLI includes a built‑in help system.  Typing `aws help` displays top‑level services, and `aws <service> help` shows commands for a specific service【233804253121922†L82-L89】.
- **Resource listing** – Example commands include listing API Gateway REST APIs (`aws apigateway get-rest-apis`), listing CloudFront distributions (`aws cloudfront list-distributions`) and describing EC2 instances with instance IDs and tags using `aws ec2 describe-instances` in combination with `--query` or `jq`【233804253121922†L115-L163】【233804253121922†L257-L263】.
- **Best practices** – Use command completion (Tab key) to speed up CLI usage and `jq` to parse JSON output【233804253121922†L75-L95】.  Always follow least‑privilege principles when creating IAM roles and policies and enable MFA on root accounts【506934707838674†L100-L116】.
- **Development commands** – On the development side, remember key package‑management commands: `npm init -y` to initialize a project, `npm install <package>` to add dependencies, `npm run dev` to start Vite’s development server, and `npm run build` to create a production build.  Use React’s component model and hooks for state management (e.g., `useState`, `useEffect`).

The full cheat sheets provided in the platform will present commands and frameworks in organized tables for quick reference.

## Agent Specification (AGENTS.MD)

The application can include an intelligent “study assistant” agent that answers questions and tracks your progress.  The agent should abide by rules similar to those used by large language models: follow user instructions, respect safety guidelines, maintain a memory of lesson completions and quiz scores, and log interactions for future reference.  A separate file, **AGENTS.MD**, included in this repository, documents the agent’s behavior, available skills, memory and logging strategies, and integration with local models such as Ollama.  Because the agent acts as a teaching assistant, it should respond with helpful explanations, suggest resources and encourage best practices when designing AWS architectures.
