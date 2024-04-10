import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PrismaService } from "src/database";
import { UpsertInteractionByBookIdCommand } from "./upsertInteractionByBookId.command";
import { NotFoundException } from "@nestjs/common";
import { InteractionType } from "@prisma/client";

@CommandHandler(UpsertInteractionByBookIdCommand)
export class UpdateUserByIdHandler
  implements ICommandHandler<UpsertInteractionByBookIdCommand>
{
  constructor(private readonly dbContext: PrismaService) {}

  public async execute(
    command: UpsertInteractionByBookIdCommand
  ): Promise<void> {
    const {
      userId,
      body: { bookId, type, value },
    } = command;

    await this.validate({ bookId, userId });

    const newValue = await this.getValue({ bookId, type, value, userId });
    await this.dbContext.interaction.upsert({
      where: {
        userId_bookId_type: {
          bookId,
          userId,
          type,
        },
      },
      create: {
        bookId,
        userId,
        type,
        value,
      },
      update: {
        value,
      },
    });
  }

  private async getValue(options: {
    type: InteractionType;
    value: number;
    bookId: string;
    userId: string;
  }) {
    const { type, value, bookId, userId } = options;

    if (type === InteractionType.RATING) {
      return value;
    }

    const prevInteraction = await this.dbContext.interaction.findUnique({
      where: {
        userId_bookId_type: {
          bookId,
          userId,
          type,
        },
      },
      select: {
        value: true,
      },
    });

    return prevInteraction.value + 1;
  }

  private async validate(option: { bookId: string; userId: string }) {
    const { bookId, userId } = option;

    const [book, user] = await Promise.all([
      this.dbContext.book.findUnique({
        where: {
          id: bookId,
        },
        select: {
          id: true,
        },
      }),

      this.dbContext.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
        },
      }),
    ]);

    if (!book?.id) {
      throw new NotFoundException("The book does not exist");
    }

    if (!user) {
      throw new NotFoundException("The user does not exist");
    }
  }
}
