import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ClasseModule } from './classe/classe.module';
import { MatiereModule } from './matiere/matiere.module';
import { EleveModule } from './eleve/eleve.module';
import { AnneeScolaireModule } from './annee-scolaire/annee-scolaire.module';
import { EtablissementConfigModule } from './etablissement_config/etablissement_config.module';
import { PeriodeModule } from './periode/periode.module';
import { EnseignantModule } from './enseignant/enseignant.module';
import { ParentModule } from './parent/parent.module';
import { ParentEleveModule } from './parent-eleve/parent-eleve.module';
import { InscriptionModule } from './inscription/inscription.module';
import { BulletinModule } from './bulletin/bulletin.module';
import { CreneauModule } from './creneau/creneau.module';
import { AbsenceModule } from './absence/absence.module';
import { RubriqueFinanciereModule } from './rubrique-financiere/rubrique-financiere.module';
import { PaiementModule } from './paiement/paiement.module';
import { SanctionModule } from './sanction/sanction.module';
import { MessageModule } from './message/message.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { MatiereNiveauModule } from './matiere-niveau/matiere-niveau.module';
import { EvaluationModule } from './evaluation/evaluation.module';
import { NoteModule } from './note/note.module';
import { DashboardModule } from './dashboard/dashboard.module';
  
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    DatabaseModule,
    UsersModule,
    AuthModule,
    ClasseModule,
    MatiereModule,
    EleveModule,
    AnneeScolaireModule,
    EtablissementConfigModule,
    PeriodeModule,
    EnseignantModule,
    ParentModule,
    ParentEleveModule,
    InscriptionModule,
    BulletinModule,
    CreneauModule,
    AbsenceModule,
    RubriqueFinanciereModule,
    PaiementModule,
    SanctionModule,
    MessageModule,
    ActivityLogModule,
    MatiereNiveauModule,
    EvaluationModule,
    NoteModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
