import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AccessTokensModule } from './access-tokens'
import { AuthModule } from './auth'
import { DrizzleModule } from './drizzle'
import { EmailModule } from './email'
import { LoggerModule } from './logger'
import { MinioModule } from './minio'
import { RedisModule } from './redis'
import { ServicesModule } from './services'

@Module({
  controllers: [],
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    LoggerModule,
    DrizzleModule,
    RedisModule,
    MinioModule,
    EmailModule,
    AuthModule,
    AccessTokensModule,
    ServicesModule,
  ],
  providers: [],
})
export class AppModule {}
