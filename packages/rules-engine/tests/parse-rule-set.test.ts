import { describe, it, expect } from 'vitest';
import { parseRuleSet } from '../src/parse-rule-set.js';

describe('parseRuleSet', () => {
  it('returns defaults for null input', () => {
    const result = parseRuleSet(null);

    expect(result.requiredSections).toEqual([]);
    expect(result.includeSections).toEqual([]);
    expect(result.excludeSections).toEqual([]);
    expect(result.onlyVerified).toBe(false);
    expect(result.requirePhoto).toBe(false);
    expect(result.maxPages).toBeUndefined();
    expect(result.maxSummaryLength).toBeUndefined();
    expect(result.notes).toBeUndefined();
  });

  it('returns defaults for undefined input', () => {
    const result = parseRuleSet(undefined);
    expect(result.onlyVerified).toBe(false);
  });

  it('returns defaults for non-object input', () => {
    const result = parseRuleSet('invalid');
    expect(result.onlyVerified).toBe(false);
  });

  it('parses valid section arrays', () => {
    const result = parseRuleSet({
      requiredSections: ['formacionAcademica', 'experienciaAdministrativa'],
      includeSections: ['idiomas'],
      excludeSections: ['postgrado'],
    });

    expect(result.requiredSections).toEqual(['formacionAcademica', 'experienciaAdministrativa']);
    expect(result.includeSections).toEqual(['idiomas']);
    expect(result.excludeSections).toEqual(['postgrado']);
  });

  it('filters out invalid section keys', () => {
    const result = parseRuleSet({
      requiredSections: ['formacionAcademica', 'invalidSection', 123, null],
    });

    expect(result.requiredSections).toEqual(['formacionAcademica']);
  });

  it('parses boolean fields', () => {
    const result = parseRuleSet({
      onlyVerified: true,
      requirePhoto: true,
    });

    expect(result.onlyVerified).toBe(true);
    expect(result.requirePhoto).toBe(true);
  });

  it('defaults non-boolean values to false', () => {
    const result = parseRuleSet({
      onlyVerified: 'yes',
      requirePhoto: 1,
    });

    expect(result.onlyVerified).toBe(false);
    expect(result.requirePhoto).toBe(false);
  });

  it('parses positive integer fields', () => {
    const result = parseRuleSet({
      maxPages: 5,
      maxSummaryLength: 500,
    });

    expect(result.maxPages).toBe(5);
    expect(result.maxSummaryLength).toBe(500);
  });

  it('ignores non-positive numbers', () => {
    const result = parseRuleSet({
      maxPages: 0,
      maxSummaryLength: -10,
    });

    expect(result.maxPages).toBeUndefined();
    expect(result.maxSummaryLength).toBeUndefined();
  });

  it('floors decimal numbers', () => {
    const result = parseRuleSet({ maxPages: 3.7 });
    expect(result.maxPages).toBe(3);
  });

  it('parses notes string', () => {
    const result = parseRuleSet({ notes: 'Adjuntar declaración jurada' });
    expect(result.notes).toBe('Adjuntar declaración jurada');
  });

  it('ignores empty notes', () => {
    const result = parseRuleSet({ notes: '   ' });
    expect(result.notes).toBeUndefined();
  });

  it('handles a complete valid input', () => {
    const input = {
      requiredSections: ['formacionAcademica'],
      includeSections: ['formacionAcademica', 'experienciaAdministrativa', 'habilidades'],
      excludeSections: [],
      onlyVerified: true,
      requirePhoto: true,
      maxPages: 3,
      maxSummaryLength: 300,
      notes: 'Formato requerido para postulación',
    };

    const result = parseRuleSet(input);

    expect(result.requiredSections).toEqual(['formacionAcademica']);
    expect(result.includeSections).toEqual(['formacionAcademica', 'experienciaAdministrativa', 'habilidades']);
    expect(result.excludeSections).toEqual([]);
    expect(result.onlyVerified).toBe(true);
    expect(result.requirePhoto).toBe(true);
    expect(result.maxPages).toBe(3);
    expect(result.maxSummaryLength).toBe(300);
    expect(result.notes).toBe('Formato requerido para postulación');
  });
});
