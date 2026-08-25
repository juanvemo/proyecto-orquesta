# Fase 2 — Músicos

## Alcance implementado

- Directorio responsive de músicos con búsqueda y filtros por estado e instrumento.
- Ficha personal, musical y administrativa con tarifas en COP.
- Relación N—N entre músicos e instrumentos, incluyendo instrumento principal y dominio.
- Relación N—N entre músicos y roles musicales, incluyendo rol principal.
- Catálogos configurables de instrumentos y roles sin borrado histórico; los registros se activan o desactivan.
- Disponibilidad recurrente por día, horario, estado y restricciones.
- Perfil individual con identidad, contacto, experiencia, biografía, instrumentos, roles y tarifas.
- Espacio individual para que una cuenta con rol Músico gestione únicamente su disponibilidad.
- Búsqueda global de músicos por nombre y especialidad.
- Métricas reales de músicos conectadas al dashboard.

## Modelo relacional

- `organizations` 1—N `musicians`.
- `organizations` 1—N `instruments`.
- `organizations` 1—N `musical_roles`.
- `musicians` N—N `instruments` mediante `musician_instruments`.
- `musicians` N—N `musical_roles` mediante `musician_roles`.
- `musicians` 1—N `availability`.
- `auth.users` 0—1 `musicians` por organización mediante `musicians.user_id`.

Todas las tablas incluyen `organization_id`, claves foráneas, RLS y grants explícitos. Las políticas de tablas puente comprueban además que las entidades relacionadas pertenezcan a la misma organización.

## Acceso

- **Administrador:** lectura y gestión total.
- **Director:** lectura y gestión total del dominio musical.
- **Consulta:** lectura del directorio y perfiles.
- **Músico:** acceso únicamente a su propia ficha a nivel de base de datos y edición de su disponibilidad.
- **Administración:** sin acceso al directorio por defecto, respetando la matriz funcional definida.

## Sincronización de cuentas

Al aprobar una membresía con rol `MUSICIAN`, el trigger `on_musician_membership_approved` busca una ficha con el mismo correo y la vincula. Si no existe, crea una ficha básica desde `profiles`. La restricción parcial `musicians_organization_user_unique` impide duplicar la relación cuenta–músico.

## Preparación para siguientes fases

Las secciones de ensayos, asistencia, eventos, pagos y documentos aparecen en el perfil como destinos futuros, pero no simulan información ni crean tablas antes de su fase correspondiente. Las relaciones utilizarán `musicians.id`, evitando duplicar datos personales.
