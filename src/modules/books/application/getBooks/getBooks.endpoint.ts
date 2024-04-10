import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { GetBooksQuery } from "./getBooks.query";
import { GetBooksRequestQuery } from "./getBooks.request-query";
import { GetBooksQueryResponse } from "./getBooks.response";
import { PaginatedOutputDto } from "src/common/dto/pageOutput.dto";
import { Role } from "src/common/role/role.decorator";
import { RoleType } from "@prisma/client";
import { RoleGuard } from "src/common/role/role.guard";
import { AuthenGuard } from "src/common/guard/authen.guard";

@ApiTags("Book")
@Controller({
  path: "books",
  version: "1",
})
@ApiBearerAuth()
@UseGuards(AuthenGuard, RoleGuard)
@Role(RoleType.ADMIN)
export class GetBooksEndpoint {
  constructor(protected queryBus: QueryBus) {}

  @ApiOperation({ description: "Get all Books" })
  @Get()
  public get(
    @Query() query: GetBooksRequestQuery
  ): Promise<PaginatedOutputDto<GetBooksQueryResponse>> {
    return this.queryBus.execute<
      GetBooksQuery,
      PaginatedOutputDto<GetBooksQueryResponse>
    >(new GetBooksQuery(query));
  }
}
