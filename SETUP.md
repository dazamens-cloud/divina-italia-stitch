# Setup — Divina Italia Stitch Edition

## 🚀 Paso 1: Crear el repositorio en GitHub

1. Ve a https://github.com/new
2. **Repository name:** `divina-italia-stitch`
3. **Description:** "Sistema de gestión de cocina — versión Stitch con mermas"
4. **Public** (o Private si prefieres)
5. **NO** inicialices con README, .gitignore ni licencia (ya los tenemos)
6. Click **Create repository**

Copiar la URL que te da (ej: `https://github.com/dazamens-cloud/divina-italia-stitch.git`)

## 🖥️ Paso 2: Inicializar el repo localmente

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
cd "C:\Users\andre\AppData\Local\Temp\claude\D--proyectos-godot-void-sentinel\ff0c04fa-6a74-474e-9cd4-b30acaf9db96\scratchpad\divina-italia-stitch"

git init
git add .
git commit -m "feat: Divina Italia Stitch Edition v2 con sistema de mermas"
git branch -M main
git remote add origin https://github.com/dazamens-cloud/divina-italia-stitch.git
git push -u origin main
```

(Reemplaza la URL con la que te devuelve GitHub)

## 📦 Paso 3: Copiar íconos

El proyecto necesita íconos en `/icons/`. Opciones:

**A) Copiar del proyecto original:**
```powershell
Copy-Item "C:\Users\andre\Downloads\divina-italdia-main\divina-italia-main\icons\*" `
  -Destination "C:\Users\andre\AppData\Local\Temp\claude\D--proyectos-godot-void-sentinel\ff0c04fa-6a74-474e-9cd4-b30acaf9db96\scratchpad\divina-italia-stitch\icons\" -Force
```

**B) O generar nuevos** en https://www.favicon-generator.org (PNG 192x192 + 512x512)

Luego commit:
```powershell
git add icons/
git commit -m "chore: agregar íconos de la app"
git push
```

## 🔌 Paso 4: Backend (AppScript) — SIN CAMBIOS NECESARIOS

✅ **El backend actual soporta todo.**

Pero si quieres verificar que los endpoints de mermas existan, busca en tu `Control_Cocina.json`:

- Función `guardarMerma()` 
- Función `listarMermas()`

Si no existen, crearlas siguiendo el patrón de `guardarCompra()`.

### Script.gs nuevo módulo (si hace falta)

Si necesitas agregar mermas al backend, pega esto en un archivo `19_Mermas.gs` en tu proyecto GAS:

```javascript
// 19_Mermas.gs

function setupMermasSheet(ss) {
  ensureSheet(ss, "Mermas", ["Fecha", "Producto", "Cantidad", "Unidad", "Motivo", "Notas"]);
}

function guardarMerma(ss, data) {
  var sheet = ss.getSheetByName("Mermas");
  if (!sheet) {
    setupMermasSheet(ss);
    sheet = ss.getSheetByName("Mermas");
  }
  var fecha = new Date();
  sheet.appendRow([
    formatFecha(fecha),
    data.producto || "",
    data.cantidad || 0,
    data.unidad || "",
    data.motivo || "",
    data.notas || ""
  ]);
}

function listarMermas(ss, fecha) {
  var sheet = ss.getSheetByName("Mermas");
  if (!sheet) return { ok: true, mermas: [] };
  
  var valores = sheet.getDataRange().getValues();
  var lista = [];
  
  for (var i = 1; i < valores.length; i++) {
    var fechaFila = valores[i][0];
    if (!fechaFila) continue;
    
    var fechaStr = fechaFila.toString().split(' ')[0];
    if (fechaStr === fecha) {
      lista.push({
        producto: valores[i][1],
        cantidad: valores[i][2],
        unidad: valores[i][3],
        motivo: valores[i][4],
        notas: valores[i][5]
      });
    }
  }
  
  return { ok: true, mermas: lista };
}
```

En `Main.gs`, agregar en el `switch` de `doPost()`:
```javascript
case "merma":  guardarMerma(ss, body);  break;
```

En `doGet()` del mismo archivo:
```javascript
case "listarMermas": resultado = listarMermas(ss, e.parameter.fecha); break;
```

## ✅ Listo

Una vez hecho, tu app está en GitHub y lista para:

- 🚀 Desplegarla en **GitHub Pages** (Settings → Pages → Deploy from branch: main)
- 📱 Usar como **PWA** en móvil/tablet
- 🔄 Sincronizar cambios con `git push`

## Verificar que funciona

1. Clona el repo en otra carpeta (para probar):
   ```powershell
   git clone https://github.com/dazamens-cloud/divina-italia-stitch.git test-clone
   cd test-clone
   ```

2. Abre `index.html` en el navegador (doble clic o arrastra a Chrome)

3. Comprueba que:
   - ✅ El menú home carga
   - ✅ Los módulos existen (Cocina, Stock, Compras, **Mermas**, Dashboard, etc.)
   - ✅ El tema dorado/oscuro es correcto

## Troubleshooting

**"Cannot find script.google.com"** → Normal sin conexión a internet o si el AppScript está caído. Comprueba que `URL_SCRIPT` y `WEB_APP_TOKEN` en `script.js` son correctos.

**"Los estilos se ven raros"** → Limpia caché (`Ctrl+Shift+R` en Chrome) o abre en incógnito.

**"Pantalla en blanco"** → Abre la consola (`F12`) y busca errores de JavaScript.
