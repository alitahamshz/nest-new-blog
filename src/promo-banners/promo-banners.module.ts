import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoBanner } from './promo-banner.entity';
import { PromoBannersService } from './promo-banners.service';
import {
  PromoBannersController,
  AdminPromoBannersController,
} from './promo-banners.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PromoBanner])],
  controllers: [PromoBannersController, AdminPromoBannersController],
  providers: [PromoBannersService],
})
export class PromoBannersModule {}
