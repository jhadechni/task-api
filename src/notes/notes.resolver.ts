import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { NotesService } from './notes.service';
import { PdfService } from './pdf.service';
import { Note, CreateNoteInput, UpdateNoteInput, ExportResult } from './models';

@Resolver(() => Note)
export class NotesResolver {
  constructor(
    private readonly notesService: NotesService,
    private readonly pdfService: PdfService
  ) {}

  @Query(() => [Note], { name: 'notes' })
  async findAll(): Promise<Note[]> {
    return this.notesService.list();
  }

  @Query(() => Note, { name: 'note' })
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<Note> {
    return this.notesService.get(id);
  }

  @Mutation(() => Note)
  async createNote(@Args('input') input: CreateNoteInput): Promise<Note> {
    return this.notesService.create(input);
  }

  @Mutation(() => Note)
  async updateNote(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateNoteInput
  ): Promise<Note> {
    return this.notesService.update(id, input);
  }

  @Mutation(() => Boolean)
  async deleteNote(
    @Args('id', { type: () => ID }) id: string
  ): Promise<boolean> {
    return this.notesService.delete(id);
  }

  @Mutation(() => ExportResult)
  async exportNoteToPdf(
    @Args('id', { type: () => ID }) id: string
  ): Promise<ExportResult> {
    const note = await this.notesService.get(id);
    return this.pdfService.generatePdf(note);
  }
}
