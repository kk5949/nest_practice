import { Injectable } from '@nestjs/common';
import { TimestampModel } from '../timestamp/entities/timestamp.entity';
import { BasePaginationDto } from './dto/base-pagination.dto';
import { FindManyOptions, FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';

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
  ){}
  private async cursorPaginate<T extends TimestampModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ){}

  private composeFindOptions<T extends TimestampModel>(
    dto: BasePaginationDto,
  ): FindManyOptions<T>{
    let where: FindOptionsWhere<T> = {};
    let order: FindOptionsOrder<T> = {};


  }
}
