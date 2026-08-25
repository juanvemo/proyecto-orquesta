# Proyecto Orquesta — Arquitectura de Fundación

## Arquitectura técnica

- **Cliente:** React + TypeScript + Vite, React Router, TanStack Query, Tailwind y componentes shadcn/ui personalizados.
- **Persistencia y autenticación:** Supabase Auth + PostgreSQL + Storage.
- **Seguridad:** Row Level Security, grants mínimos, membresías por organización y matriz RBAC.
- **Aislamiento:** toda entidad operativa futura incluirá `organization_id` y políticas basadas en membresía aprobada.
- **Auditoría:** acciones sensibles se registran en `audit_logs` con actor, organización, entidad y valores.

## Capas del cliente

- `pages/`: pantallas enrutables.
- `components/layout/`: shell, navegación, búsqueda y barra superior.
- `components/auth/`: protección de rutas.
- `contexts/`: sesión, membresía y permisos.
- `config/`: navegación y activación progresiva por fase.
- `integrations/`: clientes externos.
- `types/`: contratos TypeScript compartidos.
- Futuro: `features/<modulo>/`, `services/`, `hooks/` y `validations/` por dominio.

## Modelo relacional de Fundación

- `organizations` 1—1 `organization_settings`.
- `organizations` 1—N `roles`.
- `auth.users` 1—1 `profiles`.
- `auth.users` N—N `organizations` mediante `organization_memberships`.
- `roles` N—N `permissions` mediante `role_permissions`.
- `organizations` 1—N `audit_logs`; el actor referencia `auth.users`.

## Registro y aprobación

1. El usuario se registra con Supabase Auth.
2. Un trigger crea su perfil y membresía.
3. El primer usuario se convierte en Administrador aprobado para inicializar la organización.
4. Los siguientes usuarios quedan como Músico/Pendiente.
5. Un Administrador con `users.approve` aprueba, rechaza, suspende o reasigna el rol.
6. La interfaz y PostgreSQL aplican los permisos; la interfaz no sustituye a RLS.

## Matriz base

- **Administrador:** acceso total, configuración, usuarios, roles y auditoría.
- **Director:** músicos, ensayos, eventos, repertorio, producción técnica y reportes.
- **Administración:** clientes, cotizaciones, finanzas y reportes.
- **Músico:** dashboard y futuro portal personal.
- **Consulta:** dashboard y reportes de solo lectura.

## Módulos y fases

La navegación declara todos los dominios para comunicar la arquitectura. Fundación, Músicos, Ensayos y Repertorio están activos; CRM, eventos, rider, finanzas e inventario permanecen bloqueados hasta su fase correspondiente. Esto evita interfaces sin persistencia o flujos parciales.

## Convenciones para las siguientes fases

- UUID como clave primaria.
- `organization_id NOT NULL` en toda entidad de negocio.
- Fechas con zona horaria y zona organizacional `America/Bogota`.
- Importes numéricos en COP; formato de interfaz `$2.500.000`.
- Estados históricos mediante inactivación o estados de dominio, no borrado destructivo.
- Cada tabla expuesta tendrá grants explícitos, RLS y políticas por operación antes de conectarse al cliente.

## Modelo relacional objetivo

Los módulos futuros se incorporarán por dominio, siempre enlazados a `organizations`:

- **Personas:** `musicians` → `musician_instruments` ← `instruments`; `musicians` → `musician_roles`; `availability` pertenece a músico.
- **Ensayos:** `rehearsals` → convocatorias y `rehearsal_attendance`; repertorio y músicos se vinculan con tablas puente.
- **Repertorio:** `genres` 1—N `songs`; `setlists` → `setlist_songs` → `songs` con orden, bloque y pausa.
- **Comercial:** `clients` 1—N `quotes`; `quotes` 1—N `quote_items`; una cotización aceptada origina un `event` conservando la referencia a la cotización.
- **Eventos:** `events` funciona como agregado central y enlaza músicos, setlist, checklist, presupuesto, documentos, producción, logística y rider.
- **Producción técnica:** `technical_riders` → `rider_versions`; cada versión relaciona stage plot, input list, patch list, monitores, contactos, transporte y hospitality.
- **Finanzas:** `financial_accounts` 1—N `financial_transactions`; movimientos opcionalmente enlazados a evento, cliente y músico; presupuestos y pagos conservan estimado y real.
- **Activos y soporte:** inventario, asignaciones, documentos, tareas y notificaciones conservan organización y referencias de dominio.
- **Auditoría:** toda operación sensible genera un registro inmutable en `audit_logs`.

## Arquitectura de módulos

Cada fase se implementará como un dominio dentro de `src/features/<dominio>/`, con componentes, consultas, validaciones y tipos propios. Las páginas actuarán como composición de dominio; `services/` concentrará operaciones externas y `hooks/` la orquestación reutilizable. La navegación seguirá centralizada en `src/config/navigation.ts` y las rutas permanecerán en `src/App.tsx`.

## Plan de desarrollo validado

1. **Fundación:** organización, autenticación, aprobación, RBAC, shell, dashboard y configuración.
2. **Músicos:** fichas, instrumentos, roles musicales, disponibilidad y perfil.
3. **Ensayos:** calendario, convocatorias, confirmaciones y asistencia.
4. **Repertorio:** canciones, géneros y setlists.
5. **CRM:** clientes, cotizaciones, PDF y conversión transaccional a evento.
6. **Eventos:** centro operativo, músicos, producción y checklist.
7. **Rider:** versiones, stage plot, listas técnicas, logística y paquete documental.
8. **Finanzas:** cuentas, movimientos, presupuestos, pagos y rentabilidad.
9. **Inventario:** activos, préstamos, transporte y documentos.
10. **Reportes:** indicadores, exportaciones PDF, Excel y CSV.
11. **Portal del músico:** experiencia individual limitada por permisos.
12. **Instalable:** PWA y empaquetado para escritorio y móvil.
