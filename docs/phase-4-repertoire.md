# Fase 4 — Repertorio, setlists y aportes de ensayo

## Repertorio

- Catálogo de canciones con artista, compositor, género, tonalidad, BPM, duración, tipo, nivel y estado.
- Enlaces de YouTube, Spotify, audio y partituras, además de letra y observaciones.
- Búsqueda por canción, artista o compositor y filtros por género y estado.
- Géneros personalizados activables o inactivables sin borrar el historial.
- Relación `rehearsal_songs` para reutilizar canciones en cada ensayo y registrar su avance.

## Setlists

- Múltiples setlists con estados Borrador, Listo y Archivado.
- Bloques configurables para organizar la presentación.
- Canciones y pausas dentro de una misma secuencia.
- Cálculo automático de cantidad de canciones y duración total.
- Reordenamiento visual mediante arrastrar y soltar.

## Costos y aportes de ensayo

Cada ensayo puede registrar un único costo consolidado en `rehearsal_costs`. La dirección define:

- Costo total en COP.
- Descripción del gasto.
- Responsable del recaudo.
- Importe individual de cada músico convocado.
- Distribución automática en partes iguales o valores personalizados.

Cada deuda se almacena en `rehearsal_contributions`. Cuando el director confirma el pago:

1. Cambia de `PENDIENTE` a `PAGADO`.
2. Guarda fecha, hora y usuario que confirmó.
3. Desaparece de la lista pendiente.
4. Permanece en el historial del ensayo y del músico.
5. El importe confirmado queda protegido frente a redistribuciones posteriores.

La página **Mis aportes** muestra a cada músico únicamente sus deudas e historial.

## Seguridad

- Todas las tablas incluyen `organization_id`.
- RLS está habilitado y no existen grants para `anon`.
- Administrador y Director gestionan repertorio y costos.
- Músico y Consulta acceden al repertorio en modo lectura.
- Cada músico solo puede consultar sus propios aportes.
- Las políticas de tablas puente validan explícitamente la organización de ambos extremos.
- Las operaciones se registran en auditoría; la confirmación también genera la acción `PAY`.
