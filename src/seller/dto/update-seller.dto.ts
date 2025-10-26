import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateSellerDto } from './create-seller.dto';

// در Update نباید userId رو بشه تغییر داد
// چون رابطه Seller با User ثابت و یک‌به‌یک است
export class UpdateSellerDto extends PartialType(
  OmitType(CreateSellerDto, ['userId'] as const),
) {}
