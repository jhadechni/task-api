import { Injectable, Logger } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { ConfigService } from '@nestjs/config';
import { Note } from './models';

@Injectable()
export class DynamoDbService {
  private readonly logger = new Logger(DynamoDbService.name);
  private readonly client: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('aws.region');
    const endpoint = this.configService.get<string>('aws.dynamodb.endpoint');

    const dynamoClient = new DynamoDBClient({
      region,
      credentials: {
        accessKeyId: this.configService.get<string>('aws.accessKeyId') || '',
        secretAccessKey:
          this.configService.get<string>('aws.secretAccessKey') || '',
      },
      ...(endpoint && { endpoint }),
    });

    this.client = DynamoDBDocumentClient.from(dynamoClient);
    this.tableName =
      this.configService.get<string>('aws.dynamodb.tableName') || 'Notes';
  }

  async createNote(note: Note): Promise<Note> {
    try {
      await this.client.send(
        new PutCommand({
          TableName: this.tableName,
          Item: note,
        })
      );
      return note;
    } catch (error: unknown) {
      this.logger.error('Error creating note:', error);
      throw error;
    }
  }

  async getNote(id: string): Promise<Note | null> {
    try {
      const result = await this.client.send(
        new GetCommand({
          TableName: this.tableName,
          Key: { id },
        })
      );
      return (result.Item as Note) || null;
    } catch (error: unknown) {
      this.logger.error('Error getting note:', error);
      throw error;
    }
  }

  async listNotes(): Promise<Note[]> {
    try {
      const result = await this.client.send(
        new ScanCommand({
          TableName: this.tableName,
        })
      );
      return (result.Items as Note[]) || [];
    } catch (error: unknown) {
      this.logger.error('Error listing notes:', error);
      throw error;
    }
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    try {
      const updateExpression: string[] = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      Object.keys(updates).forEach((key, index) => {
        const attributeName = `#attr${index}`;
        const attributeValue = `:val${index}`;

        updateExpression.push(`${attributeName} = ${attributeValue}`);
        expressionAttributeNames[attributeName] = key;
        expressionAttributeValues[attributeValue] = updates[key as keyof Note];
      });

      const result = await this.client.send(
        new UpdateCommand({
          TableName: this.tableName,
          Key: { id },
          UpdateExpression: `SET ${updateExpression.join(', ')}`,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: 'ALL_NEW',
        })
      );

      return result.Attributes as Note;
    } catch (error: unknown) {
      this.logger.error('Error updating note:', error);
      throw error;
    }
  }

  async deleteNote(id: string): Promise<boolean> {
    try {
      await this.client.send(
        new DeleteCommand({
          TableName: this.tableName,
          Key: { id },
        })
      );
      return true;
    } catch (error: unknown) {
      this.logger.error('Error deleting note:', error);
      throw error;
    }
  }
}
