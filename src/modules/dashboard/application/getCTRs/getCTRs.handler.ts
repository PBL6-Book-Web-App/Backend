import { GetCTRsQueryResponse } from "./getCTRs.response";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PrismaService } from "src/database";
import { GetCTRsQuery } from "./getCTRs.query";
import * as _ from "lodash";
import { InteractionType, ModelType } from "@prisma/client";

@QueryHandler(GetCTRsQuery)
export class GetCTRsHandler
  implements IQueryHandler<GetCTRsQuery> {
  constructor(
    private readonly dbContext: PrismaService,
  ) { }

  public async execute(): Promise<GetCTRsQueryResponse> {
    const totalContentBasedClicks = await this.dbContext.interaction.count({
      where: {
        type: InteractionType.VIEW_CONTENT_BASED
      }
    });

    const totalContentBasedImpressions = await this.dbContext.modelRequest.count({
      where: {
        modelType: ModelType.CONTENT_BASED
      }
    });
    
    const totalCollaborativeClicks = await this.dbContext.interaction.count({
      where: {
        type: InteractionType.VIEW_COLLABORATIVE
      }
    });

    const totalCollaborativeImpressions = await this.dbContext.modelRequest.count({
      where: {
        modelType: ModelType.COLLABORATIVE
      }
    });

    // console.log({ totalContentBasedClicks, totalContentBasedImpressions, totalCollaborativeClicks, totalCollaborativeImpressions})

    return {
      CTR_CONTENT_BASED: totalContentBasedClicks / totalContentBasedImpressions,
      CTR_COLLABORATIVE: totalCollaborativeClicks / totalCollaborativeImpressions,
    };
  }
}
