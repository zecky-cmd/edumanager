import { Module } from '@nestjs/common';
import { BulletinService } from './bulletin.service';
import { BulletinController } from './bulletin.controller';
import { DatabaseModule } from 'src/database/database.module';
import { BulletinCalculService } from './sub-services/bulletin-calcul.service';
import { BulletinRangService } from './sub-services/bulletin-rang.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    BulletinService,
    BulletinCalculService,  // ← ajouter
    BulletinRangService,    // ← ajouter
  ],
  controllers: [BulletinController],
})
export class BulletinModule {}