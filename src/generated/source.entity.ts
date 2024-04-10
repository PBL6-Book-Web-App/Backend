import { ApiProperty } from "@nestjs/swagger";
import { BookEntity } from "./book.entity";

export class SourceEntity {
  @ApiProperty({
    required: false,
  })
  id: string;
  @ApiProperty({
    required: false,
  })
  name: string;
  @ApiProperty({
    isArray: true,
    required: false,
  })
  books?: BookEntity[];
}
