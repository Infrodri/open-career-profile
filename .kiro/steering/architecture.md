# Principios de Arquitectura

> Restricciones permanentes. Cambios requieren un ADR.

---

## Offline First

Ningún flujo core requiere conectividad de red.

## Privacy First

Todo el procesamiento ocurre localmente. Los datos nunca salen de la máquina sin acción explícita del usuario.

## Procesamiento Local

Todo el stack se ejecuta en la máquina del usuario.

## Domain First

El Perfil Profesional es el concepto central. La arquitectura gira alrededor del dominio, no de la infraestructura.

## Ports & Adapters

La lógica de negocio define interfaces (ports). Las implementaciones concretas (adapters) satisfacen esos contratos. La lógica de negocio nunca importa infraestructura directamente.

## Arquitectura de Plugins

Extensiones mediante plugins/adaptadores. Los siguientes son reemplazables:
- Motores de OCR
- Proveedores de IA
- Motores de renderizado
- Motores de validación
- Templates

## Single Source of Truth

El Perfil Profesional es el único dato permanente. Los outputs son derivados y descartables.

## Monorepo Modular

Separación clara de responsabilidades. Dependencias explícitas entre paquetes.

---

## Reglas de Dependencias

- Las apps nunca importan de otras apps.
- Los plugins nunca importan de apps.
- El core nunca importa implementaciones concretas.
- Sin dependencias circulares.

---

# Fin del Documento
