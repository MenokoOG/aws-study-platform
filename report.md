# AWS AIF-C01 AI Practitioner Study Platform: Research and Application Overview

## Overview of the AWS Certified AI Practitioner (AIF‑C01) Exam

The AWS Certified AI Practitioner exam validates a candidate's ability to understand and apply artificial intelligence, machine learning, and generative AI concepts and use cases on AWS.  The exam is intended for individuals in AI/ML-adjacent roles — such as business analysts, project managers, developers, and cloud practitioners — who work with AI solutions but may not build models themselves.  Candidates should be familiar with foundational AI/ML terminology, the AWS AI/ML service portfolio, responsible AI principles, and the basics of generative AI including foundation models and prompt engineering.  The exam contains **65 scored questions and 20 unscored questions** (85 total).  Questions are a mix of multiple‑choice and multiple‑response, and the minimum passing scaled score is **700**.


### Domain weighting

The exam is divided into five domains:

| Domain | % of score | Focus |
|---|---|---|
| **Domain 1 - Fundamentals of AI and ML** | 20% | Core AI/ML concepts, terminology, model types, training/inference, ML pipeline stages, and appropriate use cases for AI on AWS. |
| **Domain 2 - Fundamentals of Generative AI** | 24% | Foundation models (FMs), large language models (LLMs), tokens, embeddings, prompt engineering, inference parameters, and the generative AI development lifecycle. |
| **Domain 3 - Applications of Foundation Models** | 28% | Model selection, customization techniques (fine-tuning, RAG, prompt engineering), Amazon Bedrock, AI Agents, Knowledge Bases, evaluation, and deployment patterns. |
| **Domain 4 - Guidelines for Responsible AI** | 14% | Bias and fairness, explainability, transparency, human oversight, social and ethical considerations, and AWS tools for responsible AI. |
| **Domain 5 - Security, Compliance, and Governance for AI Solutions** | 14% | IAM for AI services, data privacy, regulatory compliance, Amazon Bedrock Guardrails, and governance frameworks for AI workloads. |

### Key tasks and knowledge areas

Below is a condensed summary of the tasks and knowledge statements for each domain. The bullets are not exhaustive; refer to the official AIF-C01 exam guide for full details.

**Domain 1 - Fundamentals of AI and ML** (20%):

- *AI/ML concepts* - Understand the difference between AI, ML, deep learning, and generative AI. Know supervised, unsupervised, and reinforcement learning. Identify common ML problem types: classification, regression, clustering, and recommendation.
- *ML pipeline* - Know the stages of an ML lifecycle: data collection and preparation, feature engineering, model training, evaluation, and deployment. Understand bias/variance trade-offs and overfitting.
- *AWS AI/ML services overview* - Be familiar with purpose-built AWS AI services: Amazon Rekognition (image/video analysis), Amazon Transcribe (speech to text), Amazon Comprehend (NLP/sentiment), Amazon Textract (document extraction), Amazon Polly (text to speech), Amazon Translate, and Amazon Forecast. Know Amazon SageMaker as the end-to-end ML platform for data scientists and developers.

**Domain 2 - Fundamentals of Generative AI** (24%):

- *Foundation models and LLMs* - Understand what foundation models are, how they differ from traditional ML models, and their training on large unlabeled datasets. Know key terminology: tokens, context window, temperature, top-p, top-k, and inference parameters.
- *Prompt engineering* - Know zero-shot, few-shot, and chain-of-thought prompting techniques. Understand how to craft effective prompts and the role of system prompts vs. user prompts.
- *Generative AI use cases* - Identify appropriate use cases: text summarization, text generation, code generation, image generation, question answering, and conversational AI (chatbots). Understand when generative AI is or is not appropriate.
- *AWS generative AI services* - Know Amazon Bedrock as the managed service for accessing foundation models (Anthropic Claude, Amazon Titan, Meta Llama, Mistral, Stability AI, etc.) via API without managing infrastructure. Know Amazon Q (for business and developer productivity).

**Domain 3 - Applications of Foundation Models** (28%):

- *Model selection criteria* - Choose the right model based on: task type, latency requirements, context window size, cost, modality (text/image/multimodal), and licensing.
- *Customization techniques* - Understand prompt engineering (no training cost) vs. RAG (Retrieval-Augmented Generation, retrieves external knowledge at inference) vs. fine-tuning (retrains model weights on domain-specific data). Know the trade-offs: cost, complexity, and freshness of knowledge.
- *Amazon Bedrock features* - Know Bedrock Knowledge Bases (managed RAG with S3/vector store), Bedrock Agents (multi-step task automation with tool use), Bedrock Guardrails (content filtering, topic denial, PII redaction), and Bedrock Model Evaluation.
- *Inference and deployment* - Understand on-demand inference vs. provisioned throughput in Bedrock. Know how to call Bedrock APIs and interpret model responses. Know Amazon SageMaker JumpStart for deploying open-source foundation models.

**Domain 4 - Guidelines for Responsible AI** (14%):

- *Bias and fairness* - Identify sources of bias (training data, labeling, sampling) and their impact. Know AWS tools for bias detection: Amazon SageMaker Clarify.
- *Explainability and transparency* - Understand model explainability and why it matters for trust and compliance. Know SageMaker Clarify's feature importance and SHAP-based explanations.
- *Human oversight and ethics* - Know when human review is required (Amazon Augmented AI / A2I). Understand responsible AI dimensions: fairness, reliability, privacy, inclusiveness, transparency, and accountability.
- *Social impact* - Identify potential harms of AI outputs: misinformation, deepfakes, job displacement, and discriminatory decisions. Know Bedrock Guardrails as a mechanism to enforce responsible content policies at the application layer.

**Domain 5 - Security, Compliance, and Governance for AI Solutions** (14%):

- *IAM and access control* - Apply least-privilege IAM policies to Amazon Bedrock, SageMaker, and other AI services. Know resource-based policies and VPC endpoints for private model access.
- *Data privacy* - Understand data residency requirements, encryption at rest and in transit for training data and model artifacts (KMS), and PII handling with Bedrock Guardrails.
- *Compliance and governance* - Know relevant regulatory frameworks (GDPR, HIPAA considerations) as they apply to AI workloads. Understand model versioning, audit logging (CloudTrail), and model cards for governance documentation.
- *Shared responsibility for AI* - Apply the AWS shared responsibility model to AI services: AWS manages the underlying FM infrastructure; the customer is responsible for their data, prompts, application-layer guardrails, and output validation.

## Free Study Resources

- **Official AIF-C01 Exam Guide** - The AWS Certified AI Practitioner exam guide (PDF) documents the five domains, task statements, in-scope AWS services, and exam policies. Start here.
- **AWS Skill Builder** - Offers the "AWS Certified AI Practitioner" official learning plan and "Exam Prep Standard Course". Some content is free; the full practice exam requires a subscription.
- **AWS Machine Learning University (MLU)** - Free publicly available courses on core ML concepts, NLP, computer vision, and tabular data at mlu-explain.github.io and on YouTube.
- **Amazon Bedrock Workshop** - Free hands-on workshop (AWS Workshop Studio) covering Bedrock APIs, RAG with Knowledge Bases, Agents, and Guardrails. No charges when using workshop-provided credentials.
- **YouTube** - Search "AWS AIF-C01 exam prep". Andrew Brown's (freeCodeCamp) full-length AIF-C01 course is freely available on YouTube.
- **AWS Documentation** - Key pages: Amazon Bedrock User Guide, Amazon SageMaker Developer Guide, and the AWS AI Services product pages for Rekognition, Comprehend, Transcribe, Textract, and Polly.

## Study and Flashcard Platform

This platform is built with **React + Vite** on the front end and **Node.js/Express** on the back end. It functions as an AI Practitioner flashcard study companion.

### How the platform works

1. **Flashcards** - Cards are auto-generated from content files placed in `server/src/data/aws-lessons/` (`.txt`, `.md`, `.json`, `.sh`, `.html` files are ingested; PDFs are skipped). Quiz anchor cards from `server/src/data/quizzes.json` are always included as "Exam Critical" cards.
2. **Subjects** - Cards are tagged by subject: *Certification Essentials*, *Core Services*, and *Exam Critical*. The subject filter in the UI lets you focus on one area at a time.
3. **Queues** - Cards flow through queues: *New Cards* -> *All Due* -> *Review Queue* (cards answered incorrectly) -> *Mastered* (sufficient correct-answer streaks).
4. **Tutor** - A tutor panel sends your question and current card context to OpenAI to generate a concise, supportive explanation with a follow-up check question.
5. **Progress** - Attempts, streaks, correct/incorrect counts, and answer history are persisted in `server/src/data/progress-memory.json`. Reset per-subject or globally via the Reset controls.

### Content folder naming convention

Place lesson content folders inside `server/src/data/aws-lessons/` using this naming pattern:

```
aws-certified-ai-practitioner-{topic}/
```

For example:
```
server/src/data/aws-lessons/
  aws-certified-ai-practitioner-ai-ml-fundamentals/
  aws-certified-ai-practitioner-generative-ai/
  aws-certified-ai-practitioner-bedrock-applications/
  aws-certified-ai-practitioner-responsible-ai/
  aws-certified-ai-practitioner-security-governance/
```

Drop `.txt`, `.md`, or `.json` files inside each folder. The server auto-ingests on startup, or click **Refresh Material** to hot-reload without restarting.

### Architecture

- **Back-end** (`server/src/index.js`) - Express REST API on port 3000. Key endpoints: `GET /api/study/session`, `POST /api/study/answer`, `GET /api/progress`, `POST /api/progress/reset`, `POST /api/tutor`.
- **Front-end** (`client/src/App.jsx`) - React/Vite SPA on port 5173. Mobile-first dark-mode-by-default UI with subject/queue filters, card navigation, stats panel, session summary, and tutor panel.

### Running the platform

```bash
# Terminal 1 - Server
cd server
npm install
# Ensure server/.env contains: OPENAI_API_KEY=... OPENAI_MODEL=gpt-4.1-mini PORT=3000
npm run dev

# Terminal 2 - Client
cd client
npm install
npm run dev
# Open http://localhost:5173
```

## AIF-C01 Key AWS Services Quick Reference

| Service | Category | What to know for the exam |
|---|---|---|
| **Amazon Bedrock** | Generative AI | Managed FM access (Claude, Titan, Llama, Mistral, Stable Diffusion). Knowledge Bases (RAG), Agents, Guardrails, Model Evaluation, on-demand vs. provisioned throughput. |
| **Amazon SageMaker** | ML Platform | End-to-end ML: data labeling (Ground Truth), notebooks, training jobs, pipelines, model registry, endpoints, Feature Store, Clarify (bias/explainability), JumpStart (FM deployment). |
| **Amazon Rekognition** | Vision AI | Object/scene detection, facial analysis, content moderation, video analysis. |
| **Amazon Transcribe** | Speech AI | ASR, custom vocabulary, speaker diarization, real-time and batch transcription. |
| **Amazon Comprehend** | NLP AI | Sentiment analysis, entity recognition, key phrase extraction, topic modeling, custom classifiers. |
| **Amazon Textract** | Document AI | Extracts text, tables, and forms from scanned documents and PDFs beyond simple OCR. |
| **Amazon Polly** | Speech synthesis | Text-to-speech with neural voices, SSML support, lexicons. |
| **Amazon Translate** | Translation | Neural machine translation, custom terminology, real-time and batch. |
| **Amazon Forecast** | Time-series AI | Managed forecasting using ML; auto-selects best algorithm (DeepAR+, ARIMA, etc.). |
| **Amazon Personalize** | Recommendations | Real-time personalized recommendations; no ML expertise required. |
| **Amazon Q** | Generative AI assistant | Amazon Q Business (enterprise chatbot over internal data), Amazon Q Developer (code assistance in IDEs and CLI). |
| **AWS AI Service Cards** | Responsible AI | Published documentation of intended use, limitations, and responsible AI considerations for each AWS AI service. |

## Cheat Sheet Highlights

- **Prompt engineering** - Zero-shot (no examples), few-shot (2-5 examples in prompt), chain-of-thought (ask model to reason step by step). Use system prompts to set role/context; user prompts for the task. Lower temperature = more deterministic; higher = more creative.
- **RAG vs. Fine-tuning** - RAG: no retraining, knowledge retrieved at query time from a vector store, FM weights frozen, good for frequently updated knowledge. Fine-tuning: retrains model weights, higher cost, better for style/format adaptation and specialized vocabulary.
- **Bedrock Guardrails** - Configure: topic denial, content filters (hate/violence/sexual/insults severity), word filters (custom blocklists), PII redaction, and grounding checks (reduce hallucinations in RAG).
- **SageMaker Clarify** - Bias detection on datasets (pre-training) and models (post-training). Feature importance via SHAP. Integrates with SageMaker Pipelines.
- **AWS CLI for AI services** - `aws bedrock list-foundation-models`; `aws bedrock-runtime invoke-model`; `aws sagemaker list-endpoints`; `aws rekognition detect-labels`.
- **Development commands** - `npm run dev` starts Vite (client) and nodemon (server). `npm run build` creates production bundle. Server reads `server/.env` for `OPENAI_API_KEY` and `OPENAI_MODEL`.

## Agent Specification (AGENTS.md)

The platform includes an AI-powered study assistant agent documented in `AGENTS.md`. The agent acts as a virtual tutor for AIF-C01 exam preparation: it answers questions about AI/ML concepts and AWS AI services, evaluates quiz answers with explanations, tracks flashcard progress, retrieves cheat-sheet entries, and allows the user to record personal notes. The agent integrates with OpenAI (via `/api/tutor`) and can optionally delegate to a local model such as Ollama. All interactions are logged server-side for debugging. The agent follows responsible AI guidelines: it does not provide real exam-dump answers, cites sources when making factual claims, and encourages understanding over memorization.
