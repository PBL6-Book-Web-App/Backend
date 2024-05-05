import { PassportModule } from "@nestjs/passport";
import { ConfigModule } from "@nestjs/config";
import { Module } from "@nestjs/common";
import { UserModule } from "./modules/users";
import { AuthModule } from "./modules/auth";
import { BookModule } from "./modules/books";
import { InteractionModule } from "./modules/interaction";
import { FileModule } from "./modules/file";
import { SelfModule } from "./modules/self";
import { SettingModule } from "./modules/setting";

@Module({
  imports: [
    UserModule,
    AuthModule,
    FileModule,
    BookModule,
    PassportModule,
    InteractionModule,
    SelfModule,
    SettingModule,
    ConfigModule.forRoot(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
