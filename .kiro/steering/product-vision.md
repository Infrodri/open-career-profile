# Open Career Profile — Visión del Producto

> Este documento se subordina a `project-identity.md`, que es la fuente de verdad del proyecto.

## Misión

Open Career Profile es una plataforma Open Source que permite a cualquier persona construir, mantener y evolucionar un perfil profesional de carrera de forma local y privada.

El sistema NO gestiona currículums. El sistema gestiona información profesional.

Un CV es solo uno de los posibles outputs generados a partir del Perfil Profesional.

## Problema que resuelve

- La información profesional de las personas está dispersa en plataformas propietarias que controlan los datos.
- No existe un formato estándar, local y extensible para representar una trayectoria profesional completa.
- Los documentos generados (CVs, portfolios) se convierten erróneamente en la fuente de verdad, creando inconsistencias.
- Los profesionales dependen de conexión a internet y servicios de terceros para acceder a su propia información.
- No hay trazabilidad entre la información declarada y la evidencia documental que la respalda.

## Usuarios objetivo

| Rol | Necesidad principal |
|-----|---------------------|
| Cualquier profesional | Mantener un perfil profesional único, privado y local como fuente de verdad |
| Comunidad open-source | Extender la plataforma con plugins, templates e integraciones |
| Instituciones educativas | Consumir perfiles en formatos oficiales propios |
| Organizaciones | Generar formatos específicos desde perfiles existentes |

## Principios fundamentales

1. **Privacy First** — La información personal pertenece al usuario. No se requiere ninguna dependencia cloud. Todo debe funcionar localmente.
2. **Offline First** — La aplicación debe seguir funcionando sin acceso a Internet. La sincronización cloud puede existir en el futuro pero siempre será opcional.
3. **Single Source of Truth** — El Perfil Profesional es la única fuente permanente de información. Los documentos generados nunca deben convertirse en fuente de verdad.
4. **Evidence Driven** — Toda información almacenada en el perfil debe ser trazable a su documento original cuando sea posible.
5. **AI Assisted** — La inteligencia artificial es opcional. El sistema debe ser completamente funcional sin IA. La IA existe solo para mejorar la productividad.
6. **Plugin First** — El sistema debe ser extensible. OCR, proveedores de IA, motores de renderizado, validación, reglas institucionales y templates deben ser reemplazables mediante plugins o adaptadores.
7. **Open Source First** — Cada decisión arquitectónica debe favorecer la transparencia, la documentación y las contribuciones de la comunidad.

## Visión a largo plazo

Construir la plataforma Open Source de Perfil Profesional más extensible del mundo.

La arquitectura debe permitir que la comunidad cree:

- Templates de CV
- Formatos específicos de instituciones
- Formatos gubernamentales
- Portfolios profesionales
- Perfiles académicos
- Expedientes profesionales digitales
- Integraciones futuras

sin modificar el core de la aplicación.

## Lo que este proyecto ES

- Gestor de Perfil Profesional
- Aplicación Local-first
- Plataforma Open Source
- Arquitectura Extensible
- Plataforma basada en Plugins
- Asistido por IA (opcional)
- Enfocado en privacidad
- Impulsado por la comunidad

## Lo que este proyecto NO ES

- Un Resume Builder (constructor de CVs)
- Una plataforma SaaS
- Una aplicación solo-cloud
- Un producto dependiente de IA
- Un producto con vendor lock-in

## Alcance del MVP

- Modelo de datos del Perfil Profesional (experiencia, educación, habilidades, proyectos, certificaciones, evidencias).
- Gestión local de perfiles (crear, editar, validar).
- Sistema de templates para generar diferentes outputs (CV, portfolio) desde el perfil.
- Generación de PDF como output.
- Interfaz web local para gestión del perfil (React + Vite).
- OCR básico para extracción de datos desde documentos (Tesseract.js, opcional).
- Arquitectura de plugins documentada y funcional.
- Despliegue local con Docker.

## Métricas de éxito

- El modelo de datos soporta al menos el 90% de la información profesional típica.
- Un usuario puede crear y gestionar su perfil completamente offline.
- El sistema puede ejecutarse con un solo comando (`docker compose up`).
- Al menos 2 templates de generación de documentos disponibles en el MVP.
- Toda funcionalidad core opera sin conexión a internet.
- La IA mejora la experiencia pero su ausencia no bloquea ningún flujo.
