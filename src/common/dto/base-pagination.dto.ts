import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { FindOptionsOrderValue } from 'typeorm';

export class BasePaginationDto {
  @IsNumber()
  @IsOptional()
  page?: number;

  @IsOptional()
  @IsString()
  where__id__more_than?: string; // bigint

  @IsOptional()
  @IsString()
  where__id__less_than?: string; // bigint

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order__createdAt?: FindOptionsOrderValue = 'ASC';

  @IsNumber()
  @IsOptional()
  take?: number = 20;
}