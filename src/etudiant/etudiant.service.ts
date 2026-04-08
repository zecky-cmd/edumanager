// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class EtudiantService {
//     constructor(private readonly prisma: PrismaService) {}

//     async create(data: CreateEtudiantDto) {
//         return this.prisma.etudiant.create({ data });
//     }

//     async findAll() {
//         return this.prisma.etudiant.findMany();
//     }

//     async findOne(id: number) {
//         return this.prisma.etudiant.findUnique({ where: { id } });
//     }

//     async update(id: number, data: UpdateEtudiantDto) {
//         return this.prisma.etudiant.update({ where: { id }, data });
//     }

//     async remove(id: number) {
//         return this.prisma.etudiant.delete({ where: { id } });
//     }
// }


