import { PickType } from '@nestjs/mapped-types';
import { User } from '../../user/entities/user.entity';

export class RegisterUserDto extends PickType(User, ['email','nickname','password']){

}