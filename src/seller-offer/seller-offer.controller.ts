import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SellerOfferService } from './seller-offer.service';
import { CreateSellerOfferDto } from './dto/create-seller-offer.dto';
import { UpdateSellerOfferDto } from './dto/update-seller-offer.dto';

@Controller('seller-offer')
export class SellerOfferController {
  constructor(private readonly sellerOfferService: SellerOfferService) {}

  @Post()
  create(@Body() createSellerOfferDto: CreateSellerOfferDto) {
    return this.sellerOfferService.create(createSellerOfferDto);
  }

  @Get()
  findAll() {
    return this.sellerOfferService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sellerOfferService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSellerOfferDto: UpdateSellerOfferDto) {
    return this.sellerOfferService.update(+id, updateSellerOfferDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sellerOfferService.remove(+id);
  }
}
