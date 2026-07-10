// 19_Mermas.gs
// Gestión de mermas (desperdicios) en cocina

function setupMermasSheet(ss) {
  ensureSheet(ss, "Mermas", ["Fecha", "Producto", "Cantidad", "Unidad", "Motivo", "Notas"]);
}

function guardarMerma(ss, data) {
  var sheet = ss.getSheetByName("Mermas");
  if (!sheet) {
    setupMermasSheet(ss);
    sheet = ss.getSheetByName("Mermas");
  }

  if (!data.producto) {
    throw new Error("El campo 'producto' es obligatorio.");
  }
  if (!data.cantidad || isNaN(data.cantidad)) {
    throw new Error("El campo 'cantidad' es obligatorio y debe ser un número.");
  }
  if (!data.unidad) {
    throw new Error("El campo 'unidad' es obligatorio.");
  }
  if (!data.motivo) {
    throw new Error("El campo 'motivo' es obligatorio (caducidad, deterioro, rotura, error, etc).");
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

function listarMermasData(ss, fecha) {
  var sheet = ss.getSheetByName("Mermas");
  if (!sheet) return { ok: true, mermas: [] };

  if (!fecha) {
    return { ok: false, error: "Falta el parámetro 'fecha'. Ejemplo: 2026-07-10" };
  }

  var valores = sheet.getDataRange().getValues();
  var lista = [];

  for (var i = 1; i < valores.length; i++) {
    var fechaFila = parsearFechaCelda(valores[i][0]);
    if (!fechaFila) continue;

    var fechaFormato = Utilities.formatDate(fechaFila, Session.getScriptTimeZone(), "yyyy-MM-dd");
    if (fechaFormato === fecha) {
      lista.push({
        producto: valores[i][1] || "",
        cantidad: valores[i][2] || 0,
        unidad: valores[i][3] || "",
        motivo: valores[i][4] || "",
        notas: valores[i][5] || "",
        fecha: formatFecha(fechaFila)
      });
    }
  }

  return { ok: true, mermas: lista };
}

function listarMermas(ss, fecha) {
  return crearRespuesta(listarMermasData(ss, fecha));
}

// ── Resumen de mermas por mes ──
function resumenMermasMes(ss, mes) {
  try {
    var sheet = ss.getSheetByName("Mermas");
    if (!sheet) return { ok: true, resumen: {} };

    if (!mes) {
      mes = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM");
    }

    var valores = sheet.getDataRange().getValues();
    var resumen = {
      mes: mes,
      total_lineas: 0,
      por_motivo: {
        "Caducidad": 0,
        "Deterioro": 0,
        "Rotura": 0,
        "Error": 0,
        "Otro": 0
      },
      productos: {}
    };

    for (var i = 1; i < valores.length; i++) {
      var fechaFila = parsearFechaCelda(valores[i][0]);
      if (!fechaFila) continue;

      var mesFormato = Utilities.formatDate(fechaFila, Session.getScriptTimeZone(), "yyyy-MM");
      if (mesFormato === mes) {
        resumen.total_lineas++;
        var motivo = valores[i][4] || "Otro";
        if (resumen.por_motivo[motivo] !== undefined) {
          resumen.por_motivo[motivo]++;
        }

        var producto = valores[i][1] || "Desconocido";
        if (!resumen.productos[producto]) {
          resumen.productos[producto] = {
            cantidad: 0,
            unidad: valores[i][3] || "",
            ocurrencias: 0
          };
        }
        resumen.productos[producto].cantidad += parseFloat(valores[i][2]) || 0;
        resumen.productos[producto].ocurrencias++;
      }
    }

    return { ok: true, resumen: resumen };

  } catch(err) {
    console.error("Error en resumenMermasMes:", err);
    return { ok: false, error: err.message };
  }
}
