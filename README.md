# Barbería - Página de reservas (local)

Pequeña página para que los clientes reserven turnos de forma local (sin servidor). Guarda los turnos en el almacenamiento local del navegador (localStorage).

Archivos añadidos:
- `index.html`: interfaz principal con el formulario y la lista de turnos.
- `assets/css/styles.css`: estilos básicos.
- `assets/js/app.js`: lógica de reservas (validación, almacenamiento, cancelación).

Cómo usar:
1. Abrir `index.html` en el navegador.
2. Completar nombre, teléfono, servicio, fecha y hora.
3. Confirmar turno; se guardará en localStorage y aparecerá en la lista.
4. Para cancelar un turno, presionar "Cancelar" al lado del turno.

Notas y mejoras posibles:
- Actualmente los turnos se guardan localmente; para uso real en producción necesitás un backend para persistir y sincronizar entre dispositivos.
- Se podría añadir validación por número de teléfono más estricta, notificaciones por e-mail/SMS y selección dinámica de franjas horarias según disponibilidad del barbero.
