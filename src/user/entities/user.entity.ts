import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoleEnum } from '../../enums/role-enum';
import { PostsModel } from '../../posts/entities/posts.entity';
import { TimestampModel } from '../../timestamp/entities/timestamp.entity';
import {
  IsEmail,
  IsString,
  Length,
  MaxLength,
  ValidationArguments,
} from 'class-validator';
import { lengthValidationMessage } from '../../common/validation-message/length-validation.message';
import { stringValidationMessage } from '../../common/validation-message/string-validation.message';
import { emailValidationMessage } from '../../common/validation-message/email-validation.message';

@Entity()
export class User extends TimestampModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
    type: 'varchar',
    length: 20,
  })
  @IsString({
    message: stringValidationMessage
  })
  @Length(1, 20, {
    message: lengthValidationMessage
  })
  nickname: string;

  @Column({
    unique: true,
    type: 'varchar',
    length: 100,
  })
  @IsString({
    message: stringValidationMessage
  })
  @IsEmail({}, {
    message: emailValidationMessage
  })
  email: string;

  @Column({
    select: false,
  })
  @IsString({
    message: stringValidationMessage
  })
  @Length(8, 20, {
    message: lengthValidationMessage
  })
  password: string;

  @Column({
    type: 'enum',
    enum: RoleEnum,
    default: RoleEnum.USER,
  })
  role: RoleEnum;

  @OneToMany(() => PostsModel, (posts) => posts.user)
  posts: PostsModel[];

  @DeleteDateColumn()
  deletedAt: Date;
}
