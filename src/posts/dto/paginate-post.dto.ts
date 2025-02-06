import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { FindOptionsOrderValue } from 'typeorm';

export class PaginatePostDto {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsOptional()
  @IsString()
  where__id_more_than?: string; // bigint

  @IsOptional()
  @IsString()
  where__id_less_than?: string; // bigint

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order__createdAt?: FindOptionsOrderValue = 'ASC';

  @IsNumber()
  @IsOptional()
  take?: number = 20;
}
