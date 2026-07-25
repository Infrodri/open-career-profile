export const config = {
  port: parseInt(process.env['OCP_PORT'] || '3000', 10),
  databaseUrl: process.env['OCP_DATABASE_URL'] || '',
  storagePath: process.env['OCP_STORAGE_PATH'] || './storage/documents',
};
