import { describe, it, expect } from 'vitest';
import { personalInfoSchema } from '../../src/validation/index.js';

describe('personalInfoSchema', () => {
  it('accepts valid personal info with all fields', () => {
    const data = {
      fullName: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '+593 99 123 4567',
      city: 'Quito',
      country: 'Ecuador',
      summary: 'Senior software developer with 10 years of experience.',
      links: [{ label: 'GitHub', url: 'https://github.com/juanperez' }],
      birthDate: '1990-05-15',
      identityDocument: '1234567890',
    };

    const result = personalInfoSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('accepts minimal personal info (only fullName)', () => {
    const data = { fullName: 'Ana García' };
    const result = personalInfoSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('rejects empty fullName', () => {
    const data = { fullName: '' };
    const result = personalInfoSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects missing fullName', () => {
    const data = { email: 'test@test.com' };
    const result = personalInfoSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects invalid email format', () => {
    const data = { fullName: 'Test', email: 'not-an-email' };
    const result = personalInfoSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects invalid link URL', () => {
    const data = {
      fullName: 'Test',
      links: [{ label: 'Bad', url: 'not-a-url' }],
    };
    const result = personalInfoSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('defaults links to empty array when not provided', () => {
    const data = { fullName: 'Test' };
    const result = personalInfoSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.links).toEqual([]);
    }
  });
});
