import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  APP_ENV: Joi.string()
    .valid('dev', 'staging', 'prod', 'development', 'production', 'test')
    .optional(),

  PORT: Joi.number().default(3000),

  AWS_REGION: Joi.string().default('us-east-1'),

  DYNAMODB_TABLE_NAME: Joi.string().required(),

  DYNAMODB_ENDPOINT: Joi.string().optional(), // For local development

  S3_BUCKET_NAME: Joi.string().required(),

  CACHE_TTL: Joi.number().default(30000),

  PDF_EXPIRY_HOURS: Joi.number().default(1),

  AWS_ACCESS_KEY_ID: Joi.string().when('NODE_ENV', {
    is: 'development',
    then: Joi.optional(),
    otherwise: Joi.optional(),
  }),

  AWS_SECRET_ACCESS_KEY: Joi.string().when('NODE_ENV', {
    is: 'development',
    then: Joi.optional(),
    otherwise: Joi.optional(),
  }),
});
