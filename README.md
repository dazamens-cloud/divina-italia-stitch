# Divina Italia — Stitch Edition (v2)

Sistema profesional de gestión de cocina con diseño moderno inspirado en Stitch.

## Características

✨ **Nuevas**
- **Gestión de Mermas** — Registro detallado de desperdicios por motivo (caducidad, deterioro, error)
- **Ingeniería de Menú** — Análisis de popularidad vs rentabilidad de platos (en desarrollo)
- **Diseño Mejorado** — Componentes tipo Stitch con tema dorado/oscuro

📋 **Módulos Existentes**
- **Registro de Cocina** — Sesiones de elaboraciones con ingredientes
- **Control de Stock** — Registro semanal de preparaciones
- **Compras** — Pedidos a proveedores con WhatsApp + albaranes
- **Biblioteca de Productos** — Catálogo centralizado
- **Precios & Albaranes** — Integración con IA para OCR, food cost
- **Carta & Escandallos** — Platos con márgenes y rendimientos
- **Dashboard** — Analítica semanal y alertas

## Instalación

### 1. Clonar este repositorio

```bash
git clone https://github.com/dazamens-cloud/divina-italia-stitch.git
cd divina-italia-stitch
```

### 2. Subir a GitHub Pages (opcional)

```bash
git push origin main
# Activa GitHub Pages en Settings → Pages → Deploy from branch: main
```

### 3. Usar como PWA

**En Desktop:** Pincha en la URL → "Instalar" o ⋮ → "Instalar aplicación"

**En móvil:** Abre en navegador → ⋮ → "Agregar a pantalla de inicio"

## Backend

Esta PWA consume el backend de **Google Apps Script** del proyecto original:

```javascript
const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbySRURSKUJRm77ap0k93k8ny_3x4tS0ICTCRfjYvMzMp32JptBOx7iqD6M8PyjN7eeChQ/exec";
const WEB_APP_TOKEN = "DivinaItalia2026#Charco";
```

### Endpoints usados

| Acción | Función |
|--------|---------|
| `listarProductos` | Obtener biblioteca |
| `listarStockItems` | Obtener elaboraciones |
| `listarStock` | Stock semanal |
| `listarPlatosData` | Platos de la carta |
| `listarPreciosData` | Precios por producto |
| `guardarMerma` | Registrar merma (NUEVO) |
| `listarMermas` | Mermas del día (NUEVO) |
| ... | (ver script.js para lista completa) |

## Modificaciones necesarias en el Backend

El backend actual soporta todo lo necesario. Solo hay que verificar que existan los endpoints:

- `guardarMerma` — Guardar línea de merma
- `listarMermas` — Listar mermas de un día

Si no existen, usar el patrón existente en `Control_Cocina.json` para agregarlos.

## Estructura de Archivos

```
divina-italia-stitch/
├── index.html          # Pantallas HTML
├── style.css           # Estilos (Stitch + tema dorado)
├── script.js           # Lógica principal (2.5K líneas)
├── sw.js               # Service Worker (cache + offline)
├── offline.html        # Página offline
├── manifest.json       # Metadatos PWA
├── README.md           # Este archivo
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

## Desarrollo

### Agregar una pantalla nueva

1. Agregar HTML en `index.html` dentro de un `<div class="screen" id="screenNueva">`
2. Agregar función `function irA('screenNueva')` en `script.js`
3. Estilizar con clases CSS existentes (`.card`, `.btn-save`, etc.)

### Conectar nuevo endpoint

```javascript
async function cargarDatos() {
    const datos = await obtenerDatos('nuevoEndpoint', { param1: 'valor' });
    if (datos.ok) {
        // usar datos.resultado
    }
}
```

### Tema CSS

Las variables están en `style.css`:

```css
--bg: #0f0a04;           /* Negro profundo */
--gold: #c9a96e;         /* Dorado principal */
--accent-orange: #d97706; /* Naranja acción */
--success: #16a34a;      /* Verde éxito */
```

## Notas

- **Sin sincronización en tiempo real** — Los datos se guardan cuando se confirman
- **Offline first** — El SW cachea assets estáticos; API llama al servidor
- **Mobile first** — Diseñado para tablet en cocina + desktop
- **Tema único** — Dorado/oscuro; no hay dark/light mode

## Licencia

Privado — Divina Italia El Charco
