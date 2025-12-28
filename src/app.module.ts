import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SubjectsModule } from './subjects/subjects.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { AiModule } from './ai/ai.module';
import { ShareModule } from './share/share.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('database.url');
        if (!uri) {
          throw new Error('DATABASE_URL is not defined in environment variables');
        }
        return {
          uri,
          retryWrites: true,
          w: 'majority',
        };
      },
    }),
    AuthModule,
    UsersModule,
    SubjectsModule,
    QuizzesModule,
    AiModule,
    ShareModule,
  ],
})
export class AppModule {}
