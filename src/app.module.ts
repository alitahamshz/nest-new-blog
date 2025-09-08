import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
     TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',   // اگر داکر یا سرور داری اینو تغییر بده
      port: 5432,
      username: 'postgres', // یوزرنیم دیتابیس
      password: 'admin123456789', // پسورد دیتابیس
      database: 'blog-db', // اسم دیتابیس
      autoLoadEntities: true, // همه‌ی Entity ها رو خودکار لود میکنه
      synchronize: true, // فقط در محیط توسعه فعال باشه
    }),
     PostsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
