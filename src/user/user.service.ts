import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from '../auth/dto/register-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    console.log(user);
    return this.userRepository.save(user);
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  getUserByEmail(email: string) {
    return this.userRepository.findOne({
      where: {
        email,
      },
      select: ['id', 'email', 'nickname', 'password'],
    });
  }

  async createUser(user: RegisterUserDto) {
    const uniqueNickname = await this.userRepository.exists({
      where: {
        nickname: user.nickname,
      },
    });
    if (uniqueNickname) {
      throw new BadRequestException('닉네임 중복');
    }

    const uniqueEmail = await this.userRepository.exists({
      where: {
        email: user.email,
      },
    });
    if (uniqueEmail) {
      throw new BadRequestException('이메일 중복');
    }

    const newFace = this.userRepository.create(user);
    return this.userRepository.save(newFace);
  }
}
