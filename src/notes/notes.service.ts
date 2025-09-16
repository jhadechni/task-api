import { Injectable, NotFoundException } from '@nestjs/common';
import { Cachealo, CachealoEvict } from '@jhadechine/cachealo';
import { v4 as uuidv4 } from 'uuid';
import { Note, CreateNoteInput, UpdateNoteInput } from './models';
import { DynamoDbService } from './dynamodb.service';

@Injectable()
export class NotesService {
  constructor(private readonly dynamoDbService: DynamoDbService) {}

  @Cachealo({
    ttl: 30_000,
    key: () => 'notes:all',
  })
  async list(): Promise<Note[]> {
    return this.dynamoDbService.listNotes();
  }

  @Cachealo({
    ttl: 30_000,
    key: (ctx) => `notes:${String(ctx.args[0])}`,
  })
  async get(id: string): Promise<Note> {
    const note = await this.dynamoDbService.getNote(id);
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  @CachealoEvict({
    key: () => 'notes:all',
  })
  async create(input: CreateNoteInput): Promise<Note> {
    const id = uuidv4();
    const now = new Date().toISOString();
    const note: Note = { id, createdAt: now, updatedAt: now, ...input };
    return this.dynamoDbService.createNote(note);
  }

  @CachealoEvict({
    key: (ctx) => `notes:${String(ctx.args[0])}`,
  })
  @CachealoEvict({
    key: () => 'notes:all',
  })
  async update(id: string, input: UpdateNoteInput): Promise<Note> {
    await this.get(id); // Check if note exists
    const updated = {
      ...input,
      updatedAt: new Date().toISOString(),
    };
    return this.dynamoDbService.updateNote(id, updated);
  }

  @CachealoEvict({
    key: (ctx) => `notes:${String(ctx.args[0])}`,
  })
  @CachealoEvict({
    key: () => 'notes:all',
  })
  async delete(id: string): Promise<boolean> {
    await this.get(id); // Check if note exists
    return this.dynamoDbService.deleteNote(id);
  }
}
