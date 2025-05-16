import { Entity, PrimaryColumn, Column, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Producto {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generarId() {
    this.id = uuidv4();
  }

  @Column({ length: 50})
  nombre: string;

  @Column({ length: 30, unique: true })
  sku: string;

  @Column()
  precio: number;

  @Column()
  stock: number;

  @Column({ default: true })
  activo: boolean;
}