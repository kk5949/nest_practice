import { BadRequestException, Injectable } from '@nestjs/common';
import { TimestampModel } from '../timestamp/entities/timestamp.entity';
import { BasePaginationDto } from './dto/base-pagination.dto';
import { FindManyOptions, FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';
import { FILTER_MAPPER } from './const/filter-mapper.const';
import { HOST, PROTOCOL } from './const/env.const';

@Injectable()
export class CommonService {

  paginate<T extends TimestampModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ){
    if(dto.page){
      return this.pagePaginate(dto, repository, overrideFindOptions);
    }else{
      return this.cursorPaginate(dto, repository, overrideFindOptions, path);
    }
  }

  private async pagePaginate<T extends TimestampModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
  ){
    const findOptions = this.composeFindOptions<T>(dto);

    const [data, total] = await repository.findAndCount({
      ...findOptions,
      ...overrideFindOptions,
    });

    return {
      data,
      total,
    }
  }

  private async cursorPaginate<T extends TimestampModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ){
    const findOptions: FindManyOptions<T> = this.composeFindOptions(dto) as FindManyOptions<T>;
    const overrideOptions: FindManyOptions<T> = overrideFindOptions as FindManyOptions<T>;

    const results = await repository.find({
      ...findOptions,
      ...overrideOptions,
    })

    const lastItem= results.length > 0 && results.length === dto.take ? results[results.length - 1] : null;
    const nextUrl = lastItem && new URL(`${PROTOCOL}://${HOST}/${path}`);

    if (nextUrl) {
      // dto 의 값들을 추출하여 query string 생성하기
      for (const key of Object.keys(dto)) {
        if (dto[key]) {
          if (key !== 'where__id__more_than' && key !== 'where__id__less_than') {
            nextUrl.searchParams.append(key, dto[key]);
          }
        }
      }

      let key = null;

      if (dto.order__createdAt === 'ASC') {
        key = 'where__id__more_than';
      } else {
        key = 'where__id__less_than';
      }

      nextUrl.searchParams.append(key, lastItem.id.toString());
    }

    return {
      data: results,
      count: results.length,
      cursor: {
        after: lastItem?.id ?? null,
      },
      next: nextUrl?.toString() ?? null,
    };
  }

  private composeFindOptions<T extends TimestampModel>(
    dto: BasePaginationDto,
  ): FindManyOptions<T> {
    let where: FindOptionsWhere<T> = {};
    let order: FindOptionsOrder<T> = {};

    for (const [key, value] of Object.entries(dto)) {
      if (key.startsWith('where__')) {
        where = {
          ...where,
          ...this.parseQueryFilter(key, value)
        }
      } else if (key.startsWith('order__')) {
        order = {
          ...order,
          ...this.parseQueryFilter(key, value)
        }
      }
    }
    return {
      where,
      order,
      skip: dto.page ? (dto.page - 1) * dto.take : 0,
      take: dto.take
    }
  }

  private parseQueryFilter<T extends TimestampModel>(key: string, value:any)
    :FindOptionsWhere<T> | FindOptionsOrder<T>
  {
    const options: FindOptionsWhere<T> | FindOptionsOrder<T> = {};
    const split = key.split('__');

    if (![2, 3].includes(split.length)) {
      throw new BadRequestException('where 필터가 잘못됨, 잘못된 키값 = ' + key);
    }

    if(split.length === 2){
      const [_, field] = split;
      options[field] = value;
    }else{
      const [_, field, operator] = split;
      if(operator === 'between'){
        // Between 같은 경우에는 value가 값이 2개이기 때문에 예외처리
        const values = Array.isArray(value) ? value : value.toString().split(',');
        options[field] = FILTER_MAPPER[operator](values[0], values[1]);
      }else if(operator === 'i_like'){
        const searchValue = Array.isArray(value) ? value[0] : value;
        options[field] = FILTER_MAPPER[operator](`%${searchValue}%`);
      }else{
        options[field] = FILTER_MAPPER[operator](value);
      }
    }
    return options;
  }
}
