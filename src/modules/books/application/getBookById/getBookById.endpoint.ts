import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { GetBookByIdQuery } from "./getBookById.query";
import { GetBookByIdRequestParam } from "./getBookById.request-param";
import { GetBookByIdQueryResponse } from "./getBookById.response";
import { RoleGuard } from "src/common/role/role.guard";
import { Role } from "src/common/role/role.decorator";
import { RoleType } from "@prisma/client";
import { AuthenGuard } from "src/common/guard/authen.guard";

@ApiTags("Book")
@Controller({
  path: "books",
  version: "1",
})
@ApiBearerAuth()
@UseGuards(AuthenGuard, RoleGuard)
@Role(RoleType.ADMIN)
export class GetBookByIdEndpoint {
  constructor(protected queryBus: QueryBus) {}

  @ApiOperation({ description: "Get Book by id" })
  @Get(":id")
  public get(
    @Param() { id }: GetBookByIdRequestParam
  ): Promise<GetBookByIdQueryResponse> {
    return this.queryBus.execute<GetBookByIdQuery, GetBookByIdQueryResponse>(
      new GetBookByIdQuery(id)
    );
  }
}
