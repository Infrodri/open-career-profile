/**
 * Script to remove duplicate documents from the database.
 * Keeps the first document (oldest) and removes duplicates by fileName + sizeBytes.
 * Run with: npx tsx scripts/dedup-documents.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, fileName: true, sizeBytes: true, profileId: true, createdAt: true },
  });

  console.log(`Total documentos en BD: ${documents.length}`);

  // Group by fileName + sizeBytes + profileId
  const groups = new Map<string, typeof documents>();
  for (const doc of documents) {
    const key = `${doc.fileName}|${doc.sizeBytes}|${doc.profileId ?? 'null'}`;
    const group = groups.get(key) ?? [];
    group.push(doc);
    groups.set(key, group);
  }

  let removed = 0;
  for (const [key, group] of groups) {
    if (group.length <= 1) continue;

    // Keep the first (oldest), remove the rest
    const [keep, ...duplicates] = group;
    console.log(`\nDuplicado: "${keep!.fileName}" (${group.length} copias)`);
    console.log(`  Manteniendo: ${keep!.id} (${keep!.createdAt.toISOString()})`);

    for (const dup of duplicates) {
      console.log(`  Eliminando:  ${dup.id} (${dup.createdAt.toISOString()})`);
      // Delete evidence links first
      await prisma.evidence.deleteMany({ where: { documentId: dup.id } });
      await prisma.document.delete({ where: { id: dup.id } });
      removed++;
    }
  }

  console.log(`\nResultado: ${removed} duplicados eliminados.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
