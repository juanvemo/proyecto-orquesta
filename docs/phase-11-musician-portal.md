# Fase 11 — Portal y registro de músicos

## Registro público

El acceso público dejó de utilizar el registro genérico de Supabase. La pestaña **Registrarme** crea una solicitud específica para músicos y exige:

- Nombre y apellidos.
- Correo y contraseña de mínimo 8 caracteres.
- Teléfono.
- Dirección de residencia.
- EPS.
- Contacto y teléfono de emergencia.
- Al menos un instrumento o un rol musical.
- Autorización de tratamiento de datos.

WhatsApp y comuna de Cali son opcionales. La comuna solo acepta valores entre 1 y 22.

Los catálogos de instrumentos y roles se obtienen con `get_registration_catalogs()`. Esta función solo expone nombres e identificadores activos; las tablas internas no tienen acceso anónimo.

## Alta automática

`handle_new_user()` valida nuevamente los datos en PostgreSQL. No es posible omitir las validaciones manipulando el navegador.

Al crear la cuenta:

1. Se crea el perfil de usuario.
2. Se crea una membresía con rol `MUSICIAN` y estado `PENDING`.
3. Se crea la ficha musical vinculada mediante `user_id`.
4. Se guardan datos personales, EPS, dirección y emergencia.
5. Se asigna el instrumento o rol seleccionado.
6. La ficha permanece `INACTIVO` hasta la aprobación.

Al aprobar la membresía, `sync_approved_musician_membership()` activa la ficha. Suspender o rechazar el acceso vuelve a dejarla inactiva.

## Portal personal

Los músicos aprobados tienen acceso a:

- Dashboard.
- Mi perfil.
- Mi disponibilidad.
- Mis aportes.
- Calendario y ensayos convocados.
- Repertorio en lectura.

En **Mi perfil** pueden actualizar sus datos personales, musicales, de salud y emergencia. La escritura se ejecuta mediante `update_my_musician_profile()` y solo permite modificar campos propios seguros; no permite alterar tarifas, estado, permisos ni datos de otros músicos.

## Revisión administrativa

La pantalla de Usuarios permite abrir cada solicitud musical y revisar:

- Instrumento y rol.
- Teléfono y WhatsApp.
- Dirección y comuna.
- EPS.
- Contacto y teléfono de emergencia.

La aprobación activa simultáneamente el acceso y la ficha musical.

## Seguridad

- RLS permanece habilitado en todas las tablas.
- La creación de perfiles y asignaciones se realiza con funciones `SECURITY DEFINER` de alcance limitado.
- `update_my_musician_profile()` no puede ejecutarse con el rol `anon`.
- El backend valida pertenencia de instrumentos y roles a la organización.
- Se corrigieron las políticas de tablas puente para comparar explícitamente su `organization_id`.
- Los músicos solo consultan su propia ficha y sus relaciones personales.
