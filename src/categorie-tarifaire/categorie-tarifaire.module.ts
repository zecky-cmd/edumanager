import { Module } from '@nestjs/common';
import { CategorieTarifaireService } from './categorie-tarifaire.service';
import { CategorieTarifaireController } from './categorie-tarifaire.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CategorieTarifaireController],
  providers: [CategorieTarifaireService],
  exports: [CategorieTarifaireService],
})
export class CategorieTarifaireModule {}
