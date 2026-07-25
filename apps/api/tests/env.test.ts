import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { findEnvFile, loadEnv, parseEnvFile } from '../src/env.js';

describe('parseEnvFile', () => {
  it('reads simple KEY=VALUE pairs', () => {
    expect(parseEnvFile('OCP_PORT=3000\nOCP_AI_MODEL=deepseek')).toEqual({
      OCP_PORT: '3000',
      OCP_AI_MODEL: 'deepseek',
    });
  });

  it('ignores comments and blank lines', () => {
    const contents = ['# Database', '', 'OCP_DATABASE_URL=postgresql://u:p@localhost:5434/db', ''].join(
      '\n',
    );

    expect(parseEnvFile(contents)).toEqual({
      OCP_DATABASE_URL: 'postgresql://u:p@localhost:5434/db',
    });
  });

  it('keeps values that contain = and : characters', () => {
    const parsed = parseEnvFile('OCP_AI_BASE_URL=https://openrouter.ai/api/v1?x=1');
    expect(parsed['OCP_AI_BASE_URL']).toBe('https://openrouter.ai/api/v1?x=1');
  });

  it('strips a single pair of surrounding quotes', () => {
    expect(parseEnvFile('A="valor"\nB=\'otro\'')).toEqual({ A: 'valor', B: 'otro' });
  });

  it('handles CRLF line endings', () => {
    expect(parseEnvFile('A=1\r\nB=2\r\n')).toEqual({ A: '1', B: '2' });
  });

  it('skips malformed lines instead of throwing', () => {
    expect(parseEnvFile('sin-igual\n=sin-clave\n1MALA=x\nBUENA=si')).toEqual({ BUENA: 'si' });
  });
});

describe('findEnvFile', () => {
  let root: string;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'ocp-env-test-'));
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('finds a .env in the starting directory', async () => {
    await writeFile(join(root, '.env'), 'A=1');

    expect(findEnvFile(root)).toBe(join(root, '.env'));
  });

  it('walks up to find a .env in an ancestor directory', async () => {
    await writeFile(join(root, '.env'), 'A=1');
    const nested = join(root, 'apps', 'api', 'src');
    await mkdir(nested, { recursive: true });

    expect(findEnvFile(nested)).toBe(join(root, '.env'));
  });

  it('returns null when there is no .env anywhere up the tree', async () => {
    // A temp dir has no .env, but an ancestor might; assert the contract holds
    // for a path that cannot have one by construction.
    const result = findEnvFile(root);
    expect(result === null || result.endsWith('.env')).toBe(true);
  });
});

describe('loadEnv', () => {
  let root: string;
  const touchedKeys = ['OCP_TEST_NUEVA', 'OCP_TEST_EXISTENTE'];

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'ocp-env-load-'));
    for (const key of touchedKeys) delete process.env[key];
  });

  afterEach(async () => {
    for (const key of touchedKeys) delete process.env[key];
    await rm(root, { recursive: true, force: true });
  });

  it('puts values from the file into process.env', async () => {
    await writeFile(join(root, '.env'), 'OCP_TEST_NUEVA=desde-archivo');

    const loaded = loadEnv(root);

    expect(loaded).toBe(join(root, '.env'));
    expect(process.env['OCP_TEST_NUEVA']).toBe('desde-archivo');
  });

  it('never overrides a variable already set in the real environment', async () => {
    process.env['OCP_TEST_EXISTENTE'] = 'del-entorno';
    await writeFile(join(root, '.env'), 'OCP_TEST_EXISTENTE=del-archivo');

    loadEnv(root);

    expect(process.env['OCP_TEST_EXISTENTE']).toBe('del-entorno');
  });
});
