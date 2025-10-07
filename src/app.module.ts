import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModule } from './posts/posts.module';
import { CategoryModule } from './category/category.module';
import { TagsModule } from './tags/tags.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { FilesModule } from './files/files.module';
import { CommentsModule } from './comments/comments.module';
import { UserProfileModule } from './users/user-profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // همه‌جا در دسترس باشه
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER, // یوزرنیم دیتابیس
      password: process.env.DB_PASS, // پسورد دیتابیس
      database: process.env.DB_NAME, // اسم دیتابیس
      autoLoadEntities: true, // همه‌ی Entity ها رو خودکار لود میکنه
      synchronize: false, // فقط در محیط توسعه فعال باشه
    }),
    PostsModule,
    CategoryModule,
    TagsModule,
    UsersModule,
    RolesModule,
    AuthModule,
    FilesModule,
    CommentsModule,
    UserProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
