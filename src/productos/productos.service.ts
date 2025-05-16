import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './producto.entity';
import { CreateProductoDto } from './create-producto.dto';
import { UpdateProductoDto } from './update-producto.dto';
import { faker } from '@faker-js/faker';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly repo: Repository<Producto>,
  ) {}

  async crear(dto: CreateProductoDto) {
  try {
    const producto = this.repo.create(dto);
    const saved = await this.repo.save(producto);
    return { ok: true, producto: saved };
  } catch (err) {
    if (err.code === '23505') {
      if (err.detail?.includes('sku')) {
        return { ok: false, status: 400, message: 'El SKU ya existe' };
      }
      return { ok: false, status: 400, message: 'Ya existe un valor duplicado único' };
    }

    return { ok: false, status: 500, message: 'Error al guardar el producto' };
  }
}


  async obtenerUno(id: string) {
  try {
    const producto = await this.repo.findOne({ where: { id } }); 
    if (!producto) {
      return { ok: false, status: 404, message: 'Producto no encontrado' };
    }
    return { ok: true, producto };
  } catch {
    return { ok: false, status: 500, message: 'Error al obtener producto' };
  }
}


 async obtenerTodos(page = 1, limit = 10) {
  try {
    const [data, total] = await this.repo.findAndCount({
      order: { nombre: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { ok: true, data, total };
  } catch {
    return { ok: false, status: 500, message: 'Error al obtener productos' };
  }
}


  async actualizar(id: string, dto: UpdateProductoDto) {
    try {
      const result = await this.repo.update({ id, activo: true }, dto);
      if (!result.affected) {
        return { ok: false, status: 404, message: 'Producto no encontrado' };
      }
      return { ok: true };
    } catch {
      return { ok: false, status: 500, message: 'Error al actualizar producto' };
    }
  }

  async softDelete(id: string) {
    try {
      const result = await this.repo.update({ id, activo: true }, { activo: false });
      if (!result.affected) {
        return { ok: false, status: 404, message: 'Producto no encontrado' };
      }
      return { ok: true };
    } catch {
      return { ok: false, status: 500, message: 'Error al eliminar producto' };
    }
  }

  async seed(n = 51) {
    try {
      const total = await this.repo.count();
      const faltantes = Math.max(0, n - total);
      if (faltantes === 0) return { ok: true, creados: 0 };

      const productos: Producto[] = [];

      for (let i = 0; i < faltantes; i++) {
        const producto = this.repo.create({
          nombre: faker.commerce.productName().slice(0, 50),
          sku: `SKU-${faker.string.alphanumeric(6).toUpperCase()}-${Date.now() + i}`,
          precio: faker.number.int({ min: 1000, max: 100000 }),
          stock: faker.number.int({ min: 0, max: 100 }),
          activo: true,
        });
        productos.push(producto);
      }

      await this.repo.save(productos);
      return { ok: true, creados: productos.length };
    } catch {
      return { ok: false, status: 500, message: 'Error al generar productos' };
    }
  }
}