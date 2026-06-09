import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global() faz com que o PrismaService fique disponivel em qualquer modulo
// sem ser preciso re-importar este modulo em cada um.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
