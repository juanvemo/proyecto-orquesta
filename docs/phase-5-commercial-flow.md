# Fase 5 — Flujo comercial integrado

## Alcance

La Fase 5 conecta el portal público, clientes, solicitudes, cotizaciones, calendario, disponibilidad, eventos, músicos, finanzas y rider técnico. No funciona como un módulo aislado: cada conversión conserva las relaciones con la entidad anterior.

## Flujo

1. El cliente entra a `/proyecto-orquesta` y selecciona **Cotiza tu evento**.
2. Completa `/solicitar-cotizacion` sin crear una cuenta.
3. `submit_quote_request()` valida y registra cliente, solicitud, estado inicial de disponibilidad y timeline.
4. Administración revisa la solicitud en `/solicitudes/:id`, consulta conflictos de ensayos/eventos y disponibilidad de músicos.
5. Al confirmar disponibilidad se crea una cotización heredando todos los datos del cliente y evento.
6. Cada guardado genera una versión inmutable con conceptos, valores y condiciones.
7. El envío cambia estados, registra timeline, copia el enlace privado y prepara el correo del cliente.
8. El cliente abre `/cotizacion/:token`, imprime o guarda el PDF y acepta, rechaza o solicita cambios.
9. Las solicitudes de cambio se resuelven automáticamente al guardar una nueva versión.
10. La aceptación conserva la versión exacta, fecha, identidad e IP cuando los encabezados de infraestructura la exponen.
11. Administración convierte la cotización aceptada en evento.
12. La conversión crea las cuentas por cobrar de anticipo y saldo.
13. El evento permite asignar y confirmar músicos, setlist, estado operativo, pagos y rider técnico.
14. Cada transición relevante se conserva en `commercial_timeline`.

## Roles y catálogos

- `/roles` permite crear roles personalizados y asignar permisos por módulo.
- El rol `ADMIN` está protegido para evitar dejar la organización sin administración.
- `/catalogos-registro` administra instrumentos y roles musicales disponibles en el registro público.
- Desactivar un catálogo lo retira de nuevos registros sin borrar relaciones históricas.

## Cotizaciones y PDF

El portal del cliente presenta una hoja profesional con logo, datos del cliente y evento, conceptos, subtotal, descuento, total, anticipo, saldo, condiciones y observaciones. La acción **Imprimir / guardar PDF** utiliza el generador PDF del navegador y establece el número de cotización como nombre sugerido del documento.

Los enlaces usan UUID no predecibles. Las cotizaciones vencidas siguen siendo consultables como referencia, pero ya no aceptan respuestas.

## Seguridad

- Todas las tablas comerciales tienen RLS habilitado.
- Ninguna tabla comercial concede acceso directo a `anon`.
- El acceso público está limitado a `submit_quote_request`, `get_public_quote` y `respond_to_public_quote`.
- Las funciones administrativas verifican permisos de organización y no son ejecutables por `anon`.
- El portal público nunca devuelve información de otros clientes, músicos, costos internos o finanzas.
- Versiones y aceptaciones no tienen permisos de modificación directa para usuarios autenticados.
- Las cotizaciones aceptadas, rechazadas, canceladas o vencidas quedan bloqueadas para nuevas versiones.
- El historial comercial no puede eliminarse desde el cliente autenticado.

## Métricas

El dashboard presenta:

- Solicitudes nuevas.
- Cotizaciones enviadas.
- Cotizaciones en negociación.
- Cotizaciones aceptadas.
- Cotizaciones rechazadas.
- Valor cotizado.
- Valor contratado.
- Valor cobrado.
- Pendiente por cobrar.
- Tasa de conversión.

Los valores se expresan en COP y los eventos históricos no cancelados participan en el valor contratado.
