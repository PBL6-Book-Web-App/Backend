import { ApiProperty } from "@nestjs/swagger";
import { InteractionType } from "@prisma/client";
import { IsEnum, IsOptional, IsPositive, IsUUID, Max } from "class-validator";

export class UpsertInteractionByBookIdRequestBody {
  @ApiProperty({
    description: "Id of Book",
    example: "0d24551e-57f0-4702-bdd6-535d010df643",
  })
  @IsUUID()
  bookId: string;

  @ApiProperty({
    description: `List of values: \n  Available values: ${Object.values(InteractionType)}`,
  })
  @IsEnum(InteractionType)
  type: InteractionType;

  @ApiProperty({
    description: "Value",
  })
  @IsOptional()
  @IsPositive()
  @Max(5)
  value?: number;
}
