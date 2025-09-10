import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // دسترسی فرانت به فایل‌ها
  });
   const config = new DocumentBuilder()
    .setTitle('Blog API')
    .setDescription('API documentation for the Blog project')
    .setVersion('1.0')
    .addTag('blog') // می‌تونی تگ‌های مختلف بزنی مثل posts, categories, users
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // آدرس Swagger: /api-docs
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
