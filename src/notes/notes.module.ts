import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesResolver } from './notes.resolver';
import { DynamoDbService } from './dynamodb.service';
import { PdfService } from './pdf.service';

@Module({
  providers: [NotesService, NotesResolver, DynamoDbService, PdfService],
  exports: [NotesService],
})
export class NotesModule {}
