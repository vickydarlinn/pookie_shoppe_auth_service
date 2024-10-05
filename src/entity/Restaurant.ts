import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "restaurants" })
export class Restaurant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar", { length: 100 })
  name: string;

  @Column("varchar", { length: 255 })
  address: string;

  @UpdateDateColumn()
  updatedAt: number;

  @CreateDateColumn()
  createdAt: number;
}
