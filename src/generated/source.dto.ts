import { ApiProperty } from "@nestjs/swagger";

export class SourceDto {
  @ApiProperty({
    required: false,
  })
  id: string;
  @ApiProperty({
    required: false,
  })
  name: string;
}
