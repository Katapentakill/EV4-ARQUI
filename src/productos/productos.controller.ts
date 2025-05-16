import {
  Controller, Post, Get, Patch, Delete, Param, Body, Query, Headers,
  HttpCode, HttpStatus, BadRequestException, InternalServerErrorException, NotFoundException
} from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './create-producto.dto';
import { UpdateProductoDto } from './update-producto.dto';
import { AuthService } from '../auth/auth.service';

@Controller('productos')
export class ProductosController {
  constructor(
    private readonly productosService: ProductosService,
    private readonly authService: AuthService,
  ) {}

  private async validarToken(authHeader: string) {
    if (!authHeader) throw new BadRequestException('Falta token');
    const token = authHeader.replace('Bearer ', '');
    try {
      await this.authService.verifyToken(token);
    } catch {
      throw new BadRequestException('Token inválido o expirado');
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(@Headers('authorization') auth: string, @Body() dto: CreateProductoDto) {
    await this.validarToken(auth);
    const res = await this.productosService.crear(dto);

    if (!res.ok) {
      if (res.status === 400) throw new BadRequestException({ code: 400, message: res.message });
      throw new InternalServerErrorException({ code: 500, message: res.message });
    }

    return {
      code: 201,
      message: 'Producto creado correctamente',
      data: res.producto,
    };
  }

  @Get(':id')
  async obtenerUno(@Headers('authorization') auth: string, @Param('id') id: string) {
    await this.validarToken(auth);
    const res = await this.productosService.obtenerUno(id);

    if (!res.ok) {
      if (res.status === 404) throw new NotFoundException({ code: 404, message: res.message });
      throw new InternalServerErrorException({ code: 500, message: res.message });
    }

    return {
      code: 200,
      message: 'Producto encontrado',
      data: res.producto,
    };
  }

  @Get()
  async obtenerTodos(
    @Headers('authorization') auth: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    await this.validarToken(auth);
    const res = await this.productosService.obtenerTodos(Number(page), Number(limit));

    if (!res.ok) {
      throw new InternalServerErrorException({ code: 500, message: res.message });
    }

    return {
      code: 200,
      message: 'Lista paginada de productos',
      total: res.total,
      data: res.data,
    };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async actualizar(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
    @Body() dto: UpdateProductoDto,
  ) {
    await this.validarToken(auth);
    const res = await this.productosService.actualizar(id, dto);

    if (!res.ok) {
      if (res.status === 404) throw new NotFoundException({ code: 404, message: res.message });
      throw new InternalServerErrorException({ code: 500, message: res.message });
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(@Headers('authorization') auth: string, @Param('id') id: string) {
    await this.validarToken(auth);
    const res = await this.productosService.softDelete(id);

    if (!res.ok) {
      if (res.status === 404) throw new NotFoundException({ code: 404, message: res.message });
      throw new InternalServerErrorException({ code: 500, message: res.message });
    }
  }

  @Post('seed')
  async seed(@Headers('authorization') auth: string) {
    await this.validarToken(auth);
    const res = await this.productosService.seed(100);

    if (!res.ok) {
      throw new InternalServerErrorException({ code: 500, message: res.message });
    }

    return {
      code: 201,
      message: 'Productos generados correctamente',
      cantidad: res.creados,
    };
  }
}