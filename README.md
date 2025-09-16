# Notes API

A comprehensive GraphQL API for managing notes with PDF export functionality, built with NestJS and deployed on AWS Lambda.

## Features

- 📝 **Full CRUD Operations**: Create, read, update, and delete notes
- 🎨 **GraphQL API**: Modern, type-safe API with introspection and playground
- 📄 **PDF Export**: Generate beautiful PDFs from notes using Puppeteer
- 🚀 **Serverless Deployment**: Runs on AWS Lambda for automatic scaling
- 💾 **DynamoDB Storage**: NoSQL database for high-performance data access
- 📦 **S3 Integration**: Secure PDF storage with presigned URLs
- 🔄 **Smart Caching**: Redis-like caching for improved performance
- 🏗️ **Infrastructure as Code**: CloudFormation templates for reproducible deployments
- 🔄 **CI/CD Pipeline**: Automated testing and deployment with GitHub Actions
- 🐳 **Docker Support**: Containerized deployment with optimized Lambda layers

## Tech Stack

- **Backend**: NestJS, TypeScript, GraphQL
- **Database**: DynamoDB
- **Storage**: S3
- **PDF Generation**: Puppeteer
- **Deployment**: AWS Lambda, API Gateway
- **Infrastructure**: CloudFormation
- **CI/CD**: GitHub Actions
- **Containerization**: Docker

## Quick Start

### Prerequisites

- Node.js 18+
- AWS Account
- AWS CLI configured
- Docker (optional, for local development)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd notes-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your AWS credentials and configuration
   ```

4. **Start development server**
   ```bash
   npm run start:dev
   ```

5. **Access GraphQL Playground**
   - Open http://localhost:3000/graphql in your browser

### Deployment

The application automatically deploys via GitHub Actions when you push to:
- `main` branch → Production environment
- `develop` branch → Development environment

## GraphQL API

### Available Operations

#### Queries

```graphql
# Get all notes
query GetAllNotes {
  notes {
    id
    title
    content
    tags
    createdAt
    updatedAt
  }
}

# Get a specific note
query GetNote($id: ID!) {
  note(id: $id) {
    id
    title
    content
    tags
    createdAt
    updatedAt
  }
}
```

#### Mutations

```graphql
# Create a new note
mutation CreateNote($input: CreateNoteInput!) {
  createNote(input: $input) {
    id
    title
    content
    tags
    createdAt
    updatedAt
  }
}

# Update a note
mutation UpdateNote($id: ID!, $input: UpdateNoteInput!) {
  updateNote(id: $id, input: $input) {
    id
    title
    content
    tags
    updatedAt
  }
}

# Delete a note
mutation DeleteNote($id: ID!) {
  deleteNote(id: $id)
}

# Export note to PDF
mutation ExportToPdf($id: ID!) {
  exportNoteToPdf(id: $id) {
    url
    expiresAt
  }
}
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `PORT` | Server port | `3000` | No |
| `AWS_REGION` | AWS region | `us-east-1` | No |
| `DYNAMODB_TABLE_NAME` | DynamoDB table name | - | Yes |
| `S3_BUCKET_NAME` | S3 bucket for PDFs | - | Yes |
| `CACHE_TTL` | Cache TTL in milliseconds | `30000` | No |
| `PDF_EXPIRY_HOURS` | PDF URL expiry time | `1` | No |

## Development

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Linting

```bash
npm run lint
```

### Building

```bash
npm run build
```

## License

This project is licensed under the MIT License.
