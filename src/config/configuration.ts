//import { access } from "fs";

export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  appEnv: process.env.APP_ENV || process.env.NODE_ENV || 'development',

  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    dynamodb: {
      tableName: process.env.DYNAMODB_TABLE_NAME || 'Notes',
      endpoint: process.env.DYNAMODB_ENDPOINT, // For local development
    },
    s3: {
      bucketName: process.env.S3_BUCKET_NAME || 'notes-pdf-exports',
    },
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },

  graphql: {
    playground: (process.env.APP_ENV || process.env.NODE_ENV) !== 'prod',
    introspection: true,
    debug: (process.env.APP_ENV || process.env.NODE_ENV) !== 'prod',
  },

  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '30000', 10),
    prefix: process.env.CACHE_PREFIX || 'notes:',
  },

  pdf: {
    expiryHours: parseInt(process.env.PDF_EXPIRY_HOURS || '1', 10),
  },
});
