# Setup Backend — Módulo de Mermas

## 📋 Qué hacer

Necesitas agregar el módulo de Mermas a tu proyecto Google Apps Script. Hay 3 pasos:

---

## 1️⃣ Crear archivo `19_Mermas.gs`

En tu proyecto Google Apps Script:

1. Click en **+** (nuevo archivo) → selecciona **Script**
2. Nombre: `19_Mermas`
3. **Copia TODO el contenido** del archivo [19_Mermas.gs](./19_Mermas.gs) que está en esta carpeta
4. Pega y **Guardar** (Ctrl+S)

---

## 2️⃣ Actualizar `Main.gs` (función doPost)

En tu archivo `Main.gs`, busca la función `doPost()`. En el `switch(modo)`, añade estas dos líneas:

```javascript
case "merma":             guardarMerma(ss, body);            break;
case "resumenMermasMes":  resultado = resumenMermasMes(ss, body.mes); break;
```

**Busca dónde dice:**
```javascript
switch(modo) {
  case "cocina":    guardarRegistro(ss, body); break;
  case "inventario":guardarProducto(ss, body); break;
  // ... más casos
}
```

**Y agrega DENTRO del switch, al final (antes del `default`):**
```javascript
      case "merma":             guardarMerma(ss, body);            break;
      case "resumenMermasMes":  resultado = resumenMermasMes(ss, body.mes); break;
```

---

## 3️⃣ Actualizar `Main.gs` (función doGet)

En la función `doGet()`, busca el `switch(accion)`. Añade:

```javascript
      case "listarMermas":      resultado = listarMermasData(ss, e.parameter.fecha); break;
```

**Busca dónde dice:**
```javascript
switch(accion) {
  case "listarProductos": resultado = ... break;
  case "listarStock": resultado = ... break;
  // ... más casos
}
```

**Y agrega DENTRO, al final:**
```javascript
      case "listarMermas":      resultado = listarMermasData(ss, e.parameter.fecha); break;
```

---

## ✅ Listo

Después de hacer estos 3 cambios:

1. **Guardar el proyecto** (Ctrl+S)
2. **Deploy** (si lo tienes configurado con un webhook de Apps Script)
3. La PWA frontend ya puede usar:
   - Registrar mermas
   - Listar mermas del día
   - Ver resumen mensual

---

## 📝 Resumen de cambios

| Archivo | Cambio | Líneas |
|---------|--------|--------|
| `19_Mermas.gs` | **NUEVO archivo** | ~110 |
| `Main.gs` (doPost) | Añadir 2 casos en switch | +2 |
| `Main.gs` (doGet) | Añadir 1 caso en switch | +1 |
| **Total** | | ~113 líneas nuevas |

---

## 🧪 Test (opcional)

Una vez hecho, prueba desde la PWA:

1. Ve a **Mermas** en la app
2. Busca un producto
3. Añade cantidad, unidad, motivo
4. Click **REGISTRAR MERMA**
5. Debe aparecer en la lista de abajo

Si ves "Cargando..." infinito, revisa que el endpoint esté bien en el backend.

---

## ❓ Troubleshooting

**"Error: guardarMerma is not defined"**
→ El archivo `19_Mermas.gs` no está creado o no se guardó bien

**"No se ve la lista de mermas"**
→ Falta el caso `listarMermas` en doGet, o la Hoja "Mermas" no existe

**"Los totales salen €0"**
→ Es normal si no tienes precios configurados en el backend. Los precios vienen de otra hoja.
