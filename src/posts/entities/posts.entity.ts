import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { TimestampModel } from '../../timestamp/entities/timestamp.entity';

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
  title: string;

  @Column()
  content: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;
}
