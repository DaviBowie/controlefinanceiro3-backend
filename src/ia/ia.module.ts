import { Module } from '@nestjs/common';
import { IaController } from './ia.controller';
import { IaService } from './ia.service';
import { IaContextService } from './ia-context.service';

@Module({
  controllers: [IaController],
  providers: [IaService, IaContextService],
})
export class IaModule {}
