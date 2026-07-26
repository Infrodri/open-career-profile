/**
 * Script to mark ALL entries in ALL profiles as verified.
 * Run with: npx tsx scripts/verify-all.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get all section table names that have a 'verified' column
  const sectionTables = [
    'formacionAcademica',
    'postgrado',
    'cursoEspecialidad',
    'certificacionCiberseguridad',
    'certificacionSistemasInstitucionales',
    'cursoAdministrativo',
    'cursoProgramacion',
    'cursoGeneral',
    'experienciaAdministrativa',
    'experienciaDocente',
    'experienciaDesarrollo',
    'reconocimientoExpositor',
    'reconocimientoRepresentacion',
    'reconocimientoLaboral',
    'idioma',
    'habilidad',
  ] as const;

  let total = 0;

  for (const table of sectionTables) {
    try {
      const result = await (prisma as any)[table].updateMany({
        where: { verified: false },
        data: { verified: true },
      });
      if (result.count > 0) {
        console.log(`  ${table}: ${result.count} entradas verificadas`);
        total += result.count;
      }
    } catch (err) {
      console.log(`  ${table}: error (tabla puede no existir) - ${(err as Error).message?.slice(0, 80)}`);
    }
  }

  console.log(`\nTotal: ${total} entradas marcadas como verificadas.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
