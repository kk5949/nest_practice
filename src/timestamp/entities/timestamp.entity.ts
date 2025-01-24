import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class TimestampModel {
  @UpdateDateColumn()
  updatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
