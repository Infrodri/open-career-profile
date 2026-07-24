# Open Career Profile — Architectural Principles

> Este documento se subordina a `project-identity.md`, que es la fuente de verdad del proyecto.
>
> Este documento define SOLAMENTE principios arquitectónicos y restricciones permanentes.
> La documentación detallada de arquitectura (diagramas, componentes, flujos) vive en `project/architecture/`.

---

## Propósito

Definir las restricciones arquitectónicas permanentes que todo código, Spec y decisión deben respetar. Estos principios no cambian sin un ADR aprobado.

---

## Principios permanentes

### Offline First

La aplicación debe funcionar completamente sin conexión a Internet.

Ningún flujo core requiere red. La sincronización cloud puede existir en el futuro pero siempre será opcional.

---

### Privacy First

Los datos del usuario nunca salen de su máquina sin consentimiento explícito.

Todo procesamiento (OCR, AI, renderizado) ocurre localmente.

---

### Local Processing

Todo el stack se ejecuta en la máquina del usuario.

No existe dependencia de servicios cloud para ningún flujo core.

---

### Plugin Architecture

Toda extensión se hace mediante plugins y adaptadores, no modificando el core.

El sistema debe ser extensible sin tocar la lógica de negocio.

Los siguientes subsistemas deben ser reemplazables mediante adaptadores:

- OCR engines
- AI providers
- Render engines
- Validation engines
- Institution rules
- Templates

---

### Ports & Adapters (Hexagonal)

La lógica de negocio está completamente aislada de la infraestructura.

El dominio define interfaces (ports). Las implementaciones concretas (adapters) satisfacen esos contratos.

La lógica de negocio **nunca** importa directamente:

- Framework HTTP (Express)
- ORM (Prisma)
- Motor OCR (Tesseract.js)
- Proveedor AI (Ollama)
- Motor de renderizado (Puppeteer)
- Librería de UI (React)

---

### Domain First

El Perfil Profesional es el concepto central del sistema.

Toda la arquitectura gira alrededor del dominio, no de la infraestructura.

El dominio es el paquete más estable — cambia con menor frecuencia que los adaptadores.

---

### Single Source of Truth

El Perfil Profesional es la única fuente permanente de información.

Los documentos generados (CVs, portfolios, formatos institucionales) son outputs derivados.

Los outputs nunca deben convertirse en fuente de verdad.

---

### Evidence Driven

La información del perfil debe ser trazable a su documento original cuando sea posible.

El sistema permite vincular evidencia documental a cada dato profesional.

---

### Modular Monorepo

El código se organiza en un monorepo con separación estricta de responsabilidades.

Cada paquete tiene un propósito claro y dependencias explícitas.

---

## Restricciones permanentes

| Restricción | Regla |
|-------------|-------|
| Acoplamiento del core | La lógica de negocio nunca importa implementaciones concretas de infraestructura |
| Dependencias entre apps | Las aplicaciones no se importan entre sí |
| Plugins → Apps | Los plugins no importan de las aplicaciones |
| Dependencias circulares | Prohibidas |
| AI como requisito | La IA es siempre opcional; ningún flujo puede depender de ella |
| Cloud como requisito | Cloud es siempre opcional; todo funciona localmente |
| Reemplazabilidad | Toda dependencia externa debe ser intercambiable sin modificar el core |

---

## Dónde vive la documentación detallada

| Tipo de documentación | Ubicación |
|----------------------|-----------|
| Principios y restricciones permanentes | Este documento (`.kiro/steering/architecture.md`) |
| Diagramas de sistema | `project/architecture/` |
| Descripción de componentes | `project/architecture/` |
| Flujos de comunicación | `project/architecture/` |
| Decisiones arquitectónicas | `project/decisions/` (ADRs) |

---

# End of Document
