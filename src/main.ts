// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import { NestExpressApplication } from '@nestjs/platform-express';
// import { join } from 'path';
// import { TransformInterceptor } from './common/interceptors/transform.interceptors';
// import { AllExceptionsFilter } from './common/interceptors/http-exception.filter';

// async function bootstrap() {
//   const app = await NestFactory.create<NestExpressApplication>(AppModule);
//   // app.useStaticAssets(join(__dirname, '..', 'uploads'), {
//   //   prefix: '/uploads/', // دسترسی فرانت به فایل‌ها
//   // });
//     app.useStaticAssets('/var/www/blog_uploads', {
//     prefix: '/uploads/', // URL عمومی: https://khoobit.ir/uploads/...
//   });
//   app.useGlobalInterceptors(new TransformInterceptor());
//   app.useGlobalFilters(new AllExceptionsFilter());
//   app.setGlobalPrefix('api/v1', {
//     exclude: ['swagger'],
//   });
//   app.enableCors({
//     origin: '*',
//   });
//   const config = new DocumentBuilder()
//     .setTitle('Blog API')
//     .setDescription('API documentation for the Blog project')
//     .setVersion('1.0')
//     .addTag('blog') // می‌تونی تگ‌های مختلف بزنی مثل posts, categories, users
//     .addBearerAuth(
//       { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
//       'access-token', // 👈 اسم security
//     )
//     .build();

//   const document = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup('api-docs', app, document); // آدرس Swagger: /api-docs
//   await app.listen(process.env.PORT ?? 5000);
// }
// bootstrap();

// backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { TransformInterceptor } from './common/interceptors/transform.interceptors';
import { AllExceptionsFilter } from './common/interceptors/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve local uploads folder in development
  if (process.env.NODE_ENV !== 'production') {
    app.useStaticAssets(join(process.cwd(), 'uploads'), {
      prefix: '/uploads',
    });
  }

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());
  app.setGlobalPrefix('api/v1', {
    exclude: ['swagger'],
  });
  app.enableCors({
    origin: '*',
    // origin: (origin, callback) => {
    //   // اجازه به همه originها (برای dev) یا فقط origin مجاز (برای prod)
    //   const allowed = process.env.CORS_ORIGIN?.split(',') ?? [];
    //   if (!origin || allowed.length === 0 || allowed.includes(origin)) {
    //     callback(null, true);
    //   } else {
    //     callback(null, false);
    //   }
    // },
    // methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    // allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    // credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Blog API')
    .setDescription('API documentation for the Blog project')
    .setVersion('1.0')
    .addTag('blog')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
