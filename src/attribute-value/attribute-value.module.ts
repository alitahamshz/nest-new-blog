import { Module } from '@nestjs/common';
import { AttributeValueService } from './attribute-value.service';
import { AttributeValueController } from './attribute-value.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttributeValue } from 'src/entities/attribute-value.entity';
import { Attribute } from 'src/entities/attribute.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AttributeValue, Attribute])],
  controllers: [AttributeValueController],
  providers: [AttributeValueService],
})
export class AttributeValueModule {}
