import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateSettingCrawlCommand } from "./updateSettingCrawl.command";
import { UpdateSettingCrawlRequestBody } from "./updateSettingCrawl.request-body";
import { PrismaService } from "src/database";
import { PeriodType } from "@prisma/client";
import {
  CrawlValueMonthEnum,
  CrawlValueWeekEnum,
} from "src/common/enum/crawlTime.enum";
import { BadRequestException } from "@nestjs/common";

@CommandHandler(UpdateSettingCrawlCommand)
export class UpdateSettingCrawlHandler
  implements ICommandHandler<UpdateSettingCrawlCommand>
{
  constructor(private readonly dbContext: PrismaService) {}

  public async execute(command: UpdateSettingCrawlCommand): Promise<void> {
    return this.updateSettingCrawl(command.body);
  }

  private async updateSettingCrawl(
    body: UpdateSettingCrawlRequestBody
  ): Promise<void> {
    const { isAutoCrawl, periodType, value, time } = body;

    if (!isAutoCrawl) {
      await this.dbContext.settingCrawl.deleteMany();
      return;
    }

    this.validate({ periodType, value });

    const settingCrawl = await this.dbContext.settingCrawl.findFirst({
      select: { id: true },
    });

    const newData = { periodType, value, time };

    if (settingCrawl?.id) {
      await this.dbContext.settingCrawl.update({
        where: { id: settingCrawl.id },
        data: newData,
      });
    } else {
      await this.dbContext.settingCrawl.create({ data: newData });
    }
  }

  private validate(option: { periodType: PeriodType; value: string }) {
    const { periodType, value } = option;

    if (periodType === PeriodType.MONTH) {
      const [monthString, day] = value.split("-");
      if (Object.values(CrawlValueMonthEnum).includes(monthString as any)) {
        const month = CrawlValueMonthEnum[monthString];
        return this.validateMonthDay({ month, day: Number(day) });
      }
    }

    if (
      periodType === PeriodType.WEEK &&
      Object.values(CrawlValueWeekEnum).includes(value)
    ) {
      return true;
    }

    throw new BadRequestException(
      "Please input valid value in accordance with period type!"
    );
  }

  private validateMonthDay(option: {
    month: CrawlValueMonthEnum;
    day: number;
  }): boolean {
    const { month, day } = option;
    const validMonth = {
      31: [
        CrawlValueMonthEnum.JANUARY,
        CrawlValueMonthEnum.MARCH,
        CrawlValueMonthEnum.MAY,
        CrawlValueMonthEnum.JULY,
        CrawlValueMonthEnum.AUGUST,
        CrawlValueMonthEnum.OCTOBER,
        CrawlValueMonthEnum.DECEMBER,
      ],
      30: [
        CrawlValueMonthEnum.APRIL,
        CrawlValueMonthEnum.JUNE,
        CrawlValueMonthEnum.SEPTEMBER,
        CrawlValueMonthEnum.NOVEMBER,
      ],
      29: [CrawlValueMonthEnum.FEBRUARY],
    };

    for (const [key, value] of Object.entries(validMonth)) {
      if (value.includes(month) && day < Number(key) && day > 0) {
        return true;
      }
    }

    throw new BadRequestException("That month does not have that day!");
  }
}
