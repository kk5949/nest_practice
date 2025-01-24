import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { TimestampModel } from '../../timestamp/entities/timestamp.entity';
import { IsString } from 'class-validator';
import { stringValidationMessage } from '../../common/validation-message/string-validation.message';

@Entity()
export class PostsModel extends TimestampModel {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  id: string;

  @ManyToOne(() => User, (user) => user.posts, {
    nullable: false,
  })
  user: User;

  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  title: string;

  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  content: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;
}
