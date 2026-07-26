import { describe, it, expect } from 'vitest';
import { ComputrabajoBoProvider } from '../src/providers/computrabajo-bo.js';

const MOCK_HTML = `
<html>
<body>
  <article class="box_offer">
    <a href="/oferta-de-trabajo-ingeniero-sistemas-ABC123/abc" class="js-o-link">
      <h2 class="title_offer">Ingeniero de Sistemas</h2>
    </a>
    <p class="fs16 fc_base">TechCorp Bolivia</p>
    <p class="fs13 fc_aux">Sucre | Hace 2 días</p>
  </article>
  <article class="box_offer">
    <a href="/oferta-de-trabajo-analista-datos-DEF456/def" class="js-o-link">
      <h2 class="title_offer">Analista de Datos</h2>
    </a>
    <p class="fs16 fc_base">DataCo</p>
    <p class="fs13 fc_aux">La Paz | Hace 5 días</p>
  </article>
</body>
</html>
`;

const FALLBACK_HTML = `
<html>
<body>
  <div>
    <a href="/oferta-de-trabajo/dev-frontend-GHI789">Desarrollador Frontend</a>
    <a href="/oferta-de-trabajo/soporte-tecnico-JKL012">Soporte Técnico</a>
    <a href="/otro-link">No es oferta</a>
  </div>
</body>
</html>
`;

describe('ComputrabajoBoProvider', () => {
  const provider = new ComputrabajoBoProvider();

  it('has correct metadata', () => {
    expect(provider.id).toBe('computrabajo_bo');
    expect(provider.name).toBe('CompuTrabajo Bolivia');
    expect(provider.country).toBe('bo');
    expect(provider.isAvailable()).toBe(true);
  });

  describe('parseListingsPage', () => {
    it('parses box_offer articles correctly', () => {
      const jobs = provider.parseListingsPage(MOCK_HTML);

      expect(jobs).toHaveLength(2);

      expect(jobs[0].title).toBe('Ingeniero de Sistemas');
      expect(jobs[0].company).toBe('TechCorp Bolivia');
      expect(jobs[0].location).toBe('Sucre');
      expect(jobs[0].postedDate).toBe('Hace 2 días');
      expect(jobs[0].url).toContain('computrabajo.com.bo');
      expect(jobs[0].externalId).toBe('ingeniero-sistemas-ABC123');

      expect(jobs[1].title).toBe('Analista de Datos');
      expect(jobs[1].company).toBe('DataCo');
      expect(jobs[1].location).toBe('La Paz');
    });

    it('uses fallback for pages without box_offer structure', () => {
      const jobs = provider.parseListingsPage(FALLBACK_HTML);

      expect(jobs).toHaveLength(2);
      expect(jobs[0].title).toBe('Desarrollador Frontend');
      expect(jobs[0].url).toContain('/oferta-de-trabajo/dev-frontend-GHI789');
      expect(jobs[1].title).toBe('Soporte Técnico');
    });

    it('returns empty array for empty/invalid HTML', () => {
      expect(provider.parseListingsPage('')).toEqual([]);
      expect(provider.parseListingsPage('<html><body></body></html>')).toEqual([]);
    });

    it('skips entries with title shorter than 3 chars', () => {
      const html = `
        <html><body>
          <article class="box_offer">
            <a href="/oferta-de-trabajo/x"><h2 class="title_offer">AB</h2></a>
            <p class="fs16 fc_base">Co</p>
          </article>
        </body></html>
      `;
      const jobs = provider.parseListingsPage(html);
      expect(jobs).toHaveLength(0);
    });
  });
});
