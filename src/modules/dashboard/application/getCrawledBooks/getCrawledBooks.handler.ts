import { GetCrawledBooksQueryResponse } from "./getCrawledBooks.response";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PrismaService } from "src/database";
import { GetCrawledBooksQuery } from "./getCrawledBooks.query";
import * as dayjs from "dayjs";
import * as _ from "lodash";

@QueryHandler(GetCrawledBooksQuery)
export class GetCrawledBooksHandler
  implements IQueryHandler<GetCrawledBooksQuery>
{
  constructor(private readonly dbContext: PrismaService) {}

  public async execute(
    { query }: GetCrawledBooksQuery
  ): Promise<GetCrawledBooksQueryResponse> {
    const allBooks = await this.dbContext.book.findMany(
      {
        select: {
          createdAt: true,
          source: true
        },
        distinct: "createdAt",
        orderBy: {
          createdAt: "asc"
        },
        where: {
          sourceId: query.sourceId
        }
      }
    );

    const listTimesCreatedAt = [... new Set (allBooks.map(x => dayjs(x.createdAt).startOf('day').format('YYYY-MM-DD')))]
    const allTimesCreatedAt = new Set(listTimesCreatedAt.map(x => new Date(x))) ;

    const groupedTimesCreatedAt = this.groupTimesCreatedAt(allTimesCreatedAt);

    const result = await this.mapStatisticsCrawledBooks({
      sourceId: query.sourceId,
      groupedTimesCreatedAt
    })

    return result;
  }

  private async mapStatisticsCrawledBooks (options: {sourceId: number, groupedTimesCreatedAt: Date[]}) {
    const {sourceId, groupedTimesCreatedAt} = options;

    const statisticsCrawledBooks = await this.getStatisticsCrawledBooks({
      sourceId,
      groupedTimesCreatedAt
    })

    return _.groupBy(statisticsCrawledBooks, 'sourceId') ;
  }

  private groupTimesCreatedAt(allTimesCreatedAt: Set<Date>) {
    const result: Date[] = [];

    for (const x of allTimesCreatedAt) {
      const lastElement = result.length? result[result.length - 1]: null;

      const diffDate = (dayjs(x).diff(dayjs(lastElement), 'day'));

      if ((!lastElement) || (diffDate >= 3)) {
        result.push(x);
      }
    }

    return result;
  }

  private async getStatisticsCrawledBooks(options: {sourceId: number, groupedTimesCreatedAt: Date[]}) {
    const {sourceId, groupedTimesCreatedAt} = options;

    const statisticsCrawledBooks = 
      sourceId ? 
        await Promise.all( groupedTimesCreatedAt.map(async createdAt => {
          const countBooks = await this.dbContext.book.count({
            where: {
              sourceId,
              createdAt: {
                gte: createdAt,
                lt: dayjs(createdAt).add(2, 'day').toDate()
              }
            },
          })
          return {
            createdAt, 
            countBooks,
            sourceId
          }
        }) ) 
      : await Promise.all(groupedTimesCreatedAt.flatMap(async createdAt => {
        const results = [];
          
        for (const i of [1, 4]) {
              const countBooks = await this.dbContext.book.count({
                  where: {
                      sourceId: i,
                      createdAt: {
                          gte: createdAt,
                          lt: dayjs(createdAt).add(2, 'day').toDate()
                      }
                  },
              });

              if (countBooks > 0) {
                results.push({
                  createdAt,
                  countBooks,
                  sourceId: i
                });
              }
          }
          return results;
      }))

    return statisticsCrawledBooks.flat()
  }
}
