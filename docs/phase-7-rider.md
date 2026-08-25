# Fase 7 — Rider y Producción Técnica

## Alcance

El módulo `/produccion-tecnica` reutiliza `events` como entidad central. Cada evento tiene como máximo un `event_rider`, que representa el estado actual, y múltiples registros inmutables en `rider_versions`.

El editor incluye:

- Información y contacto técnico.
- Stage plot por músico, posición, instrumentos y energía.
- Input list y patch con canal, fuente, micrófono/DI, soporte y phantom.
- Mezclas de monitores.
- Sistema PA, consola, microfonía, cajas directas y backline.
- Iluminación y requerimientos eléctricos.
- Horarios, carga, acceso, parqueadero, transporte y hospitality.
- Contactos de producción.
- Notas finales y notas por versión.
- Impresión o guardado PDF del paquete técnico.

## Seguridad

- Acceso: `technical.manage`, `events.manage` o `quotes.manage`.
- El RPC `get_technical_events` expone únicamente datos operativos y no entrega valores contratados ni movimientos financieros.
- `rider_versions` tiene RLS y solo permite lectura autorizada desde el cliente.
- Las versiones se crean mediante `save_rider_version`, que valida organización y permisos.
- No existe acceso anónimo al módulo ni a sus funciones.
- Cada cambio genera auditoría y una entrada en la línea de tiempo del evento.

## Integraciones

- Evento, cliente y lugar provienen del módulo de Eventos.
- Músicos e instrumentos se generan desde la conformación actual del evento.
- El rider puede abrirse desde Eventos o desde su entrada propia de navegación.
- Cada guardado incrementa la versión sin sobrescribir el historial anterior.
