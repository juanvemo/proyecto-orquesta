# Fase 3 — Calendario, ensayos y asistencia

## Alcance implementado

- Calendario central con vistas mensual, semanal, diaria y lista.
- Creación y edición de ensayos con fecha, horario, lugar, responsable, objetivo y observaciones.
- Convocatoria de múltiples músicos en la misma operación.
- Respuestas `CONFIRMADO`, `PENDIENTE` y `NO PUEDO ASISTIR`.
- Respuesta individual del músico vinculada a su cuenta.
- Centro de control del ensayo con resumen, convocatoria y asistencia.
- Registro de asistencia `PRESENTE`, `AUSENTE`, `JUSTIFICADO` y `TARDE`, con horas de llegada y salida.
- Estadísticas de asistencia conectadas al perfil de cada músico.
- Próximo ensayo y alertas de confirmación conectados al dashboard.
- Búsqueda global de ensayos.

## Modelo relacional

- `organizations` 1—N `rehearsals`.
- `musicians` 1—N `rehearsals` como responsable opcional.
- `rehearsals` N—N `musicians` mediante `rehearsal_musicians`.
- `rehearsals` N—N `musicians` mediante `rehearsal_attendance`, conservando el estado y los horarios reales.

Las tres tablas contienen `organization_id`, claves foráneas, validaciones de estado, RLS y auditoría automática.

## Seguridad

- `rehearsals.view`: permite consultar calendario y ensayos.
- `rehearsals.manage`: permite planificar, editar, convocar y cambiar estados.
- `attendance.manage`: permite registrar y corregir asistencia.
- El músico puede actualizar únicamente su propia respuesta a una convocatoria.
- La lectura y escritura de relaciones valida pertenencia a la organización.

## Administración de usuarios

La función `admin-manage-user` permite a un administrador autorizado:

- Modificar nombre y apellidos.
- Sincronizar el nombre con la ficha musical vinculada.
- Asignar una nueva contraseña de mínimo ocho caracteres.
- Registrar la operación en auditoría sin almacenar la contraseña.

La actualización de credenciales se ejecuta del lado servidor con la clave de servicio; el navegador nunca recibe privilegios administrativos.
