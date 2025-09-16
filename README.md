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

##### Create Note
Creates a new note with title, content, and optional tags.

```graphql
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
```

**Input Schema:**
```typescript
{
  title: string;      // Required, minimum 1 character
  content: string;    // Required, minimum 1 character
  tags?: string[];    // Optional array of strings
}
```

**Example Variables:**
```json
{
  "input": {
    "title": "My First Note",
    "content": "This is the content of my note with **markdown** support.",
    "tags": ["personal", "important"]
  }
}
```

##### Update Note
Updates an existing note. All fields are optional - only provided fields will be updated.

```graphql
mutation UpdateNote($id: ID!, $input: UpdateNoteInput!) {
  updateNote(id: $id, input: $input) {
    id
    title
    content
    tags
    updatedAt
  }
}
```

**Input Schema:**
```typescript
{
  title?: string;     // Optional, minimum 1 character if provided
  content?: string;   // Optional, minimum 1 character if provided
  tags?: string[];    // Optional array of strings
}
```

**Example Variables:**
```json
{
  "id": "note-123",
  "input": {
    "title": "Updated Note Title",
    "tags": ["updated", "modified"]
  }
}
```

##### Delete Note
Permanently deletes a note by ID.

```graphql
mutation DeleteNote($id: ID!) {
  deleteNote(id: $id)
}
```

**Example Variables:**
```json
{
  "id": "note-123"
}
```

##### Export Note to PDF
Generates a PDF version of the note and returns a presigned URL for download.

```graphql
mutation ExportToPdf($id: ID!) {
  exportNoteToPdf(id: $id) {
    url
    expiresAt
  }
}
```

**Response Schema:**
```typescript
{
  url: string;        // Presigned S3 URL for PDF download
  expiresAt: string;  // ISO timestamp when URL expires
}
```

**Example Variables:**
```json
{
  "id": "note-123"
}
```

**Example Response:**
```json
{
  "data": {
    "exportNoteToPdf": {
      "url": "https://your-bucket.s3.amazonaws.com/pdfs/note-123.pdf?X-Amz-Algorithm=...",
      "expiresAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### Error Handling

All mutations follow GraphQL error conventions. Common errors include:

- **ValidationError**: Invalid input data (e.g., empty title/content)
- **NotFoundError**: Note not found for update/delete/export operations
- **InternalServerError**: Server-side errors during processing

Example error response:
```json
{
  "errors": [
    {
      "message": "Note not found",
      "code": "NOT_FOUND",
      "path": ["updateNote"]
    }
  ],
  "data": null
}
```

### Best Practices

1. **Input Validation**: Always validate input on the client side before sending mutations
2. **Error Handling**: Implement proper error handling for all mutation responses
3. **PDF Expiry**: PDF URLs expire after 1 hour by default - download immediately after generation
4. **Rate Limiting**: Be mindful of API rate limits, especially for PDF generation
5. **Caching**: Use GraphQL query caching for better performance

### GraphQL Playground

When running locally, access the GraphQL Playground at `http://localhost:3000/graphql` to:
- Explore the schema interactively
- Test mutations with the built-in editor
- View auto-generated documentation
- Debug queries and mutations

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
