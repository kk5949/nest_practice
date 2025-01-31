import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { FindOptionsOrderValue } from 'typeorm';

export class PaginatePostDto {
  @IsOptional()
  @IsString()
  where__id_more_than?: string = '1'; // bigint

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order__createdAt?: FindOptionsOrderValue = 'ASC';

  @IsNumber()
  @IsOptional()
  take?: number = 20;
}
