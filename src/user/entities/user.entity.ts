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

@Entity()
export class User extends TimestampModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
    type: 'varchar',
    length: 20,
  })
  nickname: string;

  @Column({
    unique: true,
    type: 'varchar',
    length: 100,
  })
  email: string;

  @Column({
    select: false,
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
