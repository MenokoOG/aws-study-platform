// Cheat sheet data for the study platform.  These entries correspond to the
// cheat sheets in the repository.  Each entry includes a command, description
// and optional notes.

export const cheatData = {
  awsCli: [
    {
      command: 'aws configure --profile <profile-name>',
      description: 'Create or update a named AWS CLI profile with credentials and default region.',
      notes: 'Profiles allow you to switch between multiple AWS accounts or roles.'
    },
    {
      command: 'aws s3 ls',
      description: 'List all S3 buckets in your account.',
      notes: ''
    },
    {
      command: 'aws ec2 describe-instances',
      description: 'Describe EC2 instances.  Use with --query or jq to filter output.',
      notes: ''
    },
    {
      command: 'aws lambda invoke --function-name <function> --payload <json> output.json',
      description: 'Invoke a Lambda function with a JSON payload and write the response to a file.',
      notes: ''
    },
    {
      command: 'aws help',
      description: 'Display top-level AWS CLI commands and options.',
      notes: 'Use aws <service> help for service-specific help.'
    }
  ],
  development: [
    {
      command: 'npm init -y',
      description: 'Initialize a new Node.js project with default settings.',
      notes: ''
    },
    {
      command: 'npm install react react-dom',
      description: 'Install React and ReactDOM dependencies.',
      notes: ''
    },
    {
      command: 'npm run dev',
      description: 'Start Vite’s development server.',
      notes: ''
    },
    {
      command: 'npm run build',
      description: 'Create an optimized production build of the front‑end.',
      notes: ''
    },
    {
      command: 'node src/index.js',
      description: 'Run the Express back‑end.',
      notes: 'Make sure you installed dependencies first.'
    }
  ]
};