import { Controller, Get, Post, Body, Param, ParseIntPipe, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { NoteService } from './note.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleUser } from '../users/entities/user.entity';

@ApiTags('Notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('note')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post()
  @Roles(RoleUser.adm, RoleUser.dir, RoleUser.ens)
  @ApiOperation({ 
    summary: 'Enregistrer ou mettre à jour une note',
    description: 'Les enseignants ne peuvent saisir des notes que pour les matières et classes qui leur sont affectées.'
  })
  @ApiResponse({ status: 200, description: 'Note enregistrée' })
  @ApiResponse({ status: 403, description: 'Interdit - Rôle insuffisant ou vous n\'êtes pas l\'enseignant affecté à cette matière' })
  upsert(@Body() dto: CreateNoteDto, @Request() req) {
    return this.noteService.upsert(dto, req.user);
  }

  @Get('evaluation/:id')
  @Roles(RoleUser.adm, RoleUser.dir, RoleUser.ens)
  @ApiOperation({ 
    summary: 'Récupérer les notes d\'une évaluation',
    description: 'Un enseignant ne peut voir que les notes des évaluations qu\'il a lui-même créées ou qui concernent ses matières.'
  })
  @ApiResponse({ status: 403, description: 'Interdit - Vous n\'avez pas accès aux notes de cette évaluation' })
  findByEvaluation(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.noteService.findByEvaluation(id, req.user);
  }

  @Get('eleve/:id')
  @Roles(RoleUser.adm, RoleUser.dir, RoleUser.ens, RoleUser.par, RoleUser.elv)
  @ApiOperation({ 
    summary: 'Récupérer les notes d\'un élève',
    description: 'Règles de sécurité : Un élève ne voit que ses notes. Un parent ne voit que les notes de ses enfants rattachés.'
  })
  @ApiQuery({ name: 'periodeId', required: false, description: 'ID de la période' })
  @ApiResponse({ status: 403, description: 'Interdit - Vous n\'êtes pas autorisé à voir les notes de cet élève' })
  findByEleve(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Query('periodeId') periodeId?: string,
  ) {
    return this.noteService.findByEleve(id, req.user, periodeId ? +periodeId : undefined);
  }
}
