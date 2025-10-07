import { PartialType } from '@nestjs/swagger';
import { CreateSellerOfferDto } from './create-seller-offer.dto';

export class UpdateSellerOfferDto extends PartialType(CreateSellerOfferDto) {}
