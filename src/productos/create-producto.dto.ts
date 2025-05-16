import { IsBoolean, IsInt, IsNotEmpty, IsPositive, IsString, Length, Min } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @Length(1, 50)
  nombre: string;

  @IsString()
  @Length(1, 30)
  sku: string;

  @IsInt()
  @IsPositive()
  precio: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsBoolean()
  activo: boolean;
}