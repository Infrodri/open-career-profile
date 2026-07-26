import { type PrismaClient } from '@prisma/client';
import { type InstitutionalRuleSet } from '@ocp/core';
import { parseRuleSet } from '@ocp/rules-engine';

/**
 * Resolves an InstitutionalRuleSet from the database by template ID.
 *
 * Acts as the bridge between the Prisma `InstitutionalTemplate.rules` JSON
 * field and the typed InstitutionalRuleSet the rules engine expects.
 */
export class RuleSetResolver {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Look up an institutional template by ID and parse its rules.
   * Returns null if the template does not exist.
   */
  async resolve(templateId: string): Promise<InstitutionalRuleSet | null> {
    const template = await this.prisma.institutionalTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return null;
    }

    return parseRuleSet(template.rules);
  }
}
