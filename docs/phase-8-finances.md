# Fase 8 — Finanzas

## Alcance

El módulo `/finanzas` consolida la operación económica de la organización:

- Cuentas de caja, banco, billetera digital u otras.
- Ingresos, egresos y cuentas por cobrar.
- Confirmación de pagos pendientes.
- Relación opcional con evento, cliente o músico.
- Presupuesto de ingresos y egresos por evento.
- Comparación de utilidad estimada y utilidad real.
- Resumen de aportes pagados y pendientes de ensayos.

## Modelo

- `financial_accounts`: cuentas financieras por organización.
- `financial_transactions`: libro de movimientos; conserva los anticipos y saldos creados por cotizaciones aceptadas y agrega cuenta, tercero, categoría, fecha, medio de pago y notas.
- `event_budget_items`: partidas estimadas por evento.

Los movimientos reales no se duplican. Finanzas reutiliza `financial_transactions`, mientras los aportes de ensayo siguen en `rehearsal_contributions` y se presentan como resumen integrado.

## Seguridad

- Todas las tablas tienen grants explícitos y RLS.
- Solo miembros aprobados con `finances.manage` pueden consultar o modificar el módulo.
- Las referencias a cuenta, evento, cliente y músico se validan dentro de la misma organización.
- Las operaciones se registran en `audit_logs`.
- `get_finance_context` entrega únicamente información financiera de la organización autorizada.

## Usuarios y músicos

- Toda membresía aprobada crea o vincula automáticamente una ficha de músico.
- Las nuevas fichas no pueden existir sin `user_id`.
- La creación manual independiente se retiró; el alta comienza desde el registro y aprobación del usuario.
- El administrador puede eliminar otros usuarios desde el panel.
- Nunca puede eliminarse a sí mismo ni eliminar al último administrador.
- Si el músico tiene historial operativo, la eliminación se bloquea y debe utilizarse la suspensión para conservar la trazabilidad.
