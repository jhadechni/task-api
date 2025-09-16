import { Field, ID, ObjectType, InputType } from '@nestjs/graphql';
import { IsString, IsArray, IsOptional, MinLength } from 'class-validator';

@ObjectType()
export class Note {
  @Field(() => ID) id!: string;
  @Field() title!: string;
  @Field() content!: string;
  @Field(() => [String], { nullable: true }) tags?: string[];
  @Field() createdAt!: string;
  @Field() updatedAt!: string;
}

@InputType()
export class CreateNoteInput {
  @Field()
  @IsString()
  @MinLength(1)
  title!: string;

  @Field()
  @IsString()
  @MinLength(1)
  content!: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

@InputType()
export class UpdateNoteInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

@ObjectType()
export class ExportResult {
  @Field() url!: string;
  @Field() expiresAt!: string;
}
