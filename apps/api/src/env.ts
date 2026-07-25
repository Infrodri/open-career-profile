import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

/**
 * Minimal .env loader.
 *
 * Prisma's CLI reads .env on its own, but Prisma Client does not do it at
 * runtime, so the API has to load the file itself. Without this the server
 * starts fine and only fails on the first database call, with a confusing
 * "Environment variable not found" error coming from deep inside Prisma.
 *
 * Deliberately small: no dependency, and it supports exactly what this
 * project's .env needs. Values already present in the real environment always
 * win, so Docker and CI can override the file.
 */

/** Parse `KEY=VALUE` lines, ignoring blanks and `#` comments. */
export function parseEnvFile(contents: string): Record<string, string> {
  const result: Record<string, string> = {};

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (line === '' || line.startsWith('#')) continue;

    const separator = line.indexOf('=');
    if (separator <= 0) continue;

    const key = line.slice(0, separator).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;

    let value = line.slice(separator + 1).trim();

    // Strip a single pair of matching surrounding quotes.
    const quoted =
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")));
    if (quoted) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

/**
 * Walk up from `startDir` looking for a .env file.
 * The API runs from the repo root in development and from its own folder in
 * other setups, so the location cannot be assumed.
 */
export function findEnvFile(startDir: string = process.cwd()): string | null {
  let current = resolve(startDir);

  // Stop at the filesystem root.
  for (;;) {
    const candidate = join(current, '.env');
    if (existsSync(candidate)) return candidate;

    const parent = dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

/**
 * Load the nearest .env into process.env without overwriting existing values.
 * @returns the path that was loaded, or null when no file was found
 */
export function loadEnv(startDir: string = process.cwd()): string | null {
  const envPath = findEnvFile(startDir);
  if (!envPath) return null;

  const parsed = parseEnvFile(readFileSync(envPath, 'utf-8'));

  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  return envPath;
}
