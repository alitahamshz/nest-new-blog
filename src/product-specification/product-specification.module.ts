import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSpecification } from '../entities/product-specification.entity';
import { ProductSpecificationService } from './product-specification.service';
import { ProductSpecificationController } from './product-specification.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductSpecification])],
  controllers: [ProductSpecificationController],
  providers: [ProductSpecificationService],
  exports: [ProductSpecificationService],
})
export class ProductSpecificationModule {}
