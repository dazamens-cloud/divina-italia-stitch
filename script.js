/* =====================================================
   DIVINA ITALIA — Stitch Edition (v2)
   Script.js — Lógica Principal
   ===================================================== */

const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbySRURSKUJRm77ap0k93k8ny_3x4tS0ICTCRfjYvMzMp32JptBOx7iqD6M8PyjN7eeChQ/exec";
const WEB_APP_TOKEN = "DivinaItalia2026#Charco";

let datosGlobales = {
    productos: [],
    stockItems: [],
    proveedores: {},
    platosFiltrados: [],
    platosTodos: [],
    elaboracionesActuales: [],
    ingredientesSesion: [],
    lineasPedido: [],
    lineasStock: [],
    mermasHoy: [],
    precios: {}
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   NAVEGACIÓN
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function irA(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
        history.pushState({ screen: screenId }, '', '#' + screenId);
        // Inicializar pantalla si es necesario
        if (screenId === 'screenDashboard') {
            cargarDashboard();
        } else if (screenId === 'screenMermas') {
            cargarMermasHoy();
        } else if (screenId === 'screenProductos') {
            cargarProductos();
        }
    }
}

window.addEventListener('popstate', function(e) {
    if (e.state && e.state.screen) {
        irA(e.state.screen);
    }
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   UTILITY: SUCCESS OVERLAY
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function mostrarExito(msg = '¡GUARDADO!') {
    const overlay = document.getElementById('successOverlay');
    const text = document.getElementById('successText');
    text.textContent = msg;
    overlay.classList.add('show');
    setTimeout(() => {
        overlay.classList.remove('show');
    }, 1500);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   API CALLS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

async function llamarAPI(modo, datos = {}) {
    try {
        const payload = { ...datos, modo, token: WEB_APP_TOKEN };
        const response = await fetch(URL_SCRIPT, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        return await response.json();
    } catch (err) {
        console.error('Error API:', err);
        return { ok: false, error: err.message };
    }
}

async function obtenerDatos(accion, params = {}) {
    try {
        const url = new URL(URL_SCRIPT);
        url.searchParams.append('token', WEB_APP_TOKEN);
        url.searchParams.append('accion', accion);
        Object.keys(params).forEach(k => url.searchParams.append(k, params[k]));
        const response = await fetch(url);
        return await response.json();
    } catch (err) {
        console.error('Error obtener datos:', err);
        return { ok: false };
    }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   COCINA — REGISTRO DE ELABORACIONES
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

async function cargarElaboraciones() {
    const datos = await obtenerDatos('listarStockItems');
    if (datos.ok && datos.items) {
        datosGlobales.elaboracionesActuales = datos.items;
        renderizarElaboraciones();
    }
}

function renderizarElaboraciones() {
    const container = document.getElementById('listaElaboraciones');
    container.innerHTML = '';
    datosGlobales.elaboracionesActuales.forEach(elab => {
        const btn = document.createElement('div');
        btn.className = 'stat-card';
        btn.textContent = elab.nombre;
        btn.onclick = () => seleccionarElaboracion(elab);
        container.appendChild(btn);
    });
}

function seleccionarElaboracion(elab) {
    datosGlobales.ingredientesSesion = [];
    document.getElementById('listaIngredientes').innerHTML = `
        <div class="card">
            <label style="color:var(--gold);font-weight:700">🍳 ${elab.nombre}</label>
            <input type="text" id="inputNombreIng" placeholder="Nombre del ingrediente">
            <input type="text" id="inputLoteIng" placeholder="Lote (opcional)">
            <input type="number" id="inputCantidadIng" placeholder="Cantidad" step="0.1">
            <button class="btn-save" onclick="agregarIngrediente('${elab.nombre}')">➕ AÑADIR</button>
            <div id="listaIngred"></div>
        </div>
    `;
    document.getElementById('btnGuardarSesion').classList.remove('hidden');
}

function agregarIngrediente(elaboracion) {
    const nombre = document.getElementById('inputNombreIng').value.trim();
    const lote = document.getElementById('inputLoteIng').value.trim();
    const cantidad = document.getElementById('inputCantidadIng').value;
    if (!nombre || !cantidad) {
        alert('Completa nombre y cantidad');
        return;
    }
    datosGlobales.ingredientesSesion.push({ nombre, lote, cantidad });
    renderizarIngredientes();
    document.getElementById('inputNombreIng').value = '';
    document.getElementById('inputLoteIng').value = '';
    document.getElementById('inputCantidadIng').value = '';
}

function renderizarIngredientes() {
    const lista = document.getElementById('listaIngred');
    lista.innerHTML = datosGlobales.ingredientesSesion.map((ing, i) => `
        <div class="list-item">
            <div class="list-item-primary">
                <div class="list-item-name">${ing.nombre}</div>
                <div class="list-item-meta">${ing.lote || 'Sin lote'}</div>
            </div>
            <div style="text-align:right">
                <div class="list-item-value">${ing.cantidad}</div>
                <button onclick="eliminarIngrediente(${i})" style="background:transparent;border:none;color:var(--error);cursor:pointer;padding:4px;font-size:1.2rem">✕</button>
            </div>
        </div>
    `).join('');
}

function eliminarIngrediente(index) {
    datosGlobales.ingredientesSesion.splice(index, 1);
    renderizarIngredientes();
}

async function guardarSesion() {
    if (datosGlobales.ingredientesSesion.length === 0) {
        alert('Añade al menos un ingrediente');
        return;
    }
    const resultado = await llamarAPI('sesion', {
        elaboracion: document.querySelector('.section-title').textContent.trim(),
        ingredientes: datosGlobales.ingredientesSesion
    });
    if (resultado.ok) {
        mostrarExito('Sesión guardada');
        datosGlobales.ingredientesSesion = [];
        document.getElementById('listaIngredientes').innerHTML = '';
        document.getElementById('btnGuardarSesion').classList.add('hidden');
    }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   STOCK — CONTROL SEMANAL
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

async function cargarStockItems() {
    const datos = await obtenerDatos('listarStockItems');
    if (datos.ok && datos.items) {
        datosGlobales.stockItems = datos.items;
        const select = document.getElementById('selectStockElab');
        select.innerHTML = '<option value="">Selecciona elaboración...</option>' +
            datos.items.map(item => `<option value="${item.nombre}">${item.nombre} (${item.categoria})</option>`).join('');
    }
}

async function cambiarSemanaStock(semana) {
    if (!semana) return;
    const datos = await obtenerDatos('listarStock', { semana });
    if (datos.ok && datos.stock) {
        const container = document.getElementById('stockContainer');
        container.innerHTML = datos.stock.length > 0 ? datos.stock.map(s => `
            <div class="list-item">
                <div class="list-item-primary">
                    <div class="list-item-name">${s.elaboracion}</div>
                    <div class="list-item-meta">${s.notas || 'Sin notas'}</div>
                </div>
                <div class="list-item-value">${s.cantidad} ${s.unidad}</div>
            </div>
        `).join('') : '<p style="color:var(--muted);text-align:center">Sin registros</p>';
    }
}

async function agregarLineaStock() {
    const elab = document.getElementById('selectStockElab').value;
    const cantidad = document.getElementById('inputStockCantidad').value;
    const unidad = document.getElementById('inputStockUnidad').value;
    const notas = document.getElementById('inputStockNotas').value;

    if (!elab || !cantidad || !unidad) {
        alert('Completa elaboración, cantidad y unidad');
        return;
    }

    datosGlobales.lineasStock.push({ elab, cantidad, unidad, notas });
    document.getElementById('btnGuardarTodoStock').classList.remove('hidden');
    document.getElementById('inputStockCantidad').value = '';
    document.getElementById('inputStockUnidad').value = '';
    document.getElementById('inputStockNotas').value = '';
}

async function guardarTodoStock() {
    if (datosGlobales.lineasStock.length === 0) return;

    const semana = document.getElementById('selectorSemanasStock').value;
    for (const linea of datosGlobales.lineasStock) {
        await llamarAPI('stock', {
            semana,
            elaboracion: linea.elab,
            cantidad: linea.cantidad,
            unidad: linea.unidad,
            notas: linea.notas
        });
    }
    mostrarExito('Stock guardado');
    datosGlobales.lineasStock = [];
    document.getElementById('btnGuardarTodoStock').classList.add('hidden');
}

function toggleGestionElaboraciones() {
    document.getElementById('panelGestionElaboraciones').style.display =
        document.getElementById('panelGestionElaboraciones').style.display === 'none' ? 'block' : 'none';
}

function mostrarFormNuevoStockItem() {
    document.getElementById('formNuevoStockItem').style.display = 'flex';
}

function ocultarFormNuevoStockItem() {
    document.getElementById('formNuevoStockItem').style.display = 'none';
    document.getElementById('niNombre').value = '';
    document.getElementById('niCategoria').value = '';
}

async function guardarNuevoStockItem() {
    const nombre = document.getElementById('niNombre').value.trim();
    const categoria = document.getElementById('niCategoria').value;
    if (!nombre || !categoria) {
        alert('Completa nombre y categoría');
        return;
    }
    const resultado = await llamarAPI('añadirStockItem', { nombre, categoria });
    if (resultado.ok) {
        mostrarExito('Elaboración añadida');
        ocultarFormNuevoStockItem();
        cargarStockItems();
    }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   COMPRAS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

async function cargarProductos() {
    const datos = await obtenerDatos('listarProductos');
    if (datos.ok && datos.productos) {
        datosGlobales.productos = datos.productos;
        renderizarProductos();
    }
}

function renderizarProductos() {
    const container = document.getElementById('listaProductos');
    const busqueda = document.getElementById('busquedaProd').value.toLowerCase();
    const filtrados = datosGlobales.productos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda)
    );
    container.innerHTML = filtrados.map(p => `
        <div class="card">
            <div class="flex-between">
                <div>
                    <div class="list-item-name">${p.nombre}</div>
                    <div class="list-item-meta">${p.unidad} | ${p.proveedor || '—'}</div>
                </div>
                <div style="display:flex;gap:var(--spacing-sm)">
                    <button onclick="editarProducto('${p.nombre}')" class="btn-secondary" style="padding:6px 12px;font-size:0.8rem">✏️</button>
                    <button onclick="eliminarProducto('${p.nombre}')" class="btn-secondary" style="padding:6px 12px;font-size:0.8rem;color:var(--error)">🗑</button>
                </div>
            </div>
        </div>
    `).join('');
}

function filtrarProductos() {
    renderizarProductos();
}

function mostrarFormNuevoProducto() {
    document.getElementById('formNuevoProducto').style.display = 'flex';
}

function ocultarFormNuevoProducto() {
    document.getElementById('formNuevoProducto').style.display = 'none';
}

async function guardarNuevoProducto() {
    const nombre = document.getElementById('npNombre').value.trim();
    const unidad = document.getElementById('npUnidad').value.trim();
    const proveedor = document.getElementById('npProveedor').value;
    const codigo = document.getElementById('npCodigo').value.trim();

    if (!nombre) {
        alert('El nombre es obligatorio');
        return;
    }

    const resultado = await llamarAPI('inventario', {
        producto: nombre,
        unidad,
        proveedor,
        codigo
    });

    if (resultado.ok) {
        mostrarExito('Producto añadido');
        ocultarFormNuevoProducto();
        document.getElementById('npNombre').value = '';
        cargarProductos();
    }
}

function editarProducto(nombre) {
    document.getElementById('epNombreOriginal').value = nombre;
    document.getElementById('epNombre').value = nombre;
    const prod = datosGlobales.productos.find(p => p.nombre === nombre);
    if (prod) {
        document.getElementById('epUnidad').value = prod.unidad;
        document.getElementById('epProveedor').value = prod.proveedor || '';
        document.getElementById('epCodigo').value = prod.codigo || '';
    }
    document.getElementById('modalEditarProducto').classList.add('show');
}

async function guardarEdicionProducto() {
    const nombreOrig = document.getElementById('epNombreOriginal').value;
    const resultado = await llamarAPI('editarProducto', {
        nombreOriginal: nombreOrig,
        nombre: document.getElementById('epNombre').value,
        unidad: document.getElementById('epUnidad').value,
        proveedor: document.getElementById('epProveedor').value,
        codigo: document.getElementById('epCodigo').value
    });
    if (resultado.ok) {
        cerrarModalEditarProducto();
        cargarProductos();
        mostrarExito('Producto actualizado');
    }
}

function cerrarModalEditarProducto() {
    document.getElementById('modalEditarProducto').classList.remove('show');
}

async function eliminarProducto(nombre) {
    if (!confirm('¿Eliminar este producto?')) return;
    const resultado = await llamarAPI('eliminarProducto', { nombre });
    if (resultado.ok) {
        mostrarExito('Producto eliminado');
        cargarProductos();
    }
}

function onProveedorChange() {
    const proveedor = document.getElementById('selectProveedor').value;
    const otroContainer = document.getElementById('otroProveedorContainer');
    const formPedido = document.getElementById('formPedidoContainer');
    const resumenPedido = document.getElementById('resumenPedidoContainer');

    if (proveedor === 'Otro') {
        otroContainer.style.display = 'block';
    } else {
        otroContainer.style.display = 'none';
        if (proveedor) {
            formPedido.style.display = 'flex';
            resumenPedido.style.display = 'flex';
            datosGlobales.lineasPedido = [];
            renderizarLineasPedido();
        }
    }
}

function onOtroProveedorInput() {
    const nombre = document.getElementById('otroProveedorNombre').value.trim();
    const hint = document.getElementById('otroProveedorHint');
    const btn = document.getElementById('btnGuardarOtroProveedor');
    if (nombre.length > 2) {
        hint.style.display = 'block';
        btn.style.display = 'block';
    } else {
        hint.style.display = 'none';
        btn.style.display = 'none';
    }
}

async function guardarNuevoProveedor() {
    const nombre = document.getElementById('otroProveedorNombre').value.trim();
    if (!nombre) return;

    document.getElementById('selectProveedor').innerHTML += `<option value="${nombre}">${nombre}</option>`;
    document.getElementById('selectProveedor').value = nombre;
    document.getElementById('otroProveedorContainer').style.display = 'none';
    document.getElementById('otroProveedorNombre').value = '';

    document.getElementById('formPedidoContainer').style.display = 'flex';
    document.getElementById('resumenPedidoContainer').style.display = 'flex';
    datosGlobales.lineasPedido = [];
    renderizarLineasPedido();
}

function filtrarProductosPedido() {
    const busqueda = document.getElementById('busquedaProdPedido').value.toLowerCase();
    const sugerencias = document.getElementById('sugerenciasPedido');
    const filtrados = datosGlobales.productos.filter(p => p.nombre.toLowerCase().includes(busqueda));

    if (filtrados.length > 0 && busqueda) {
        sugerencias.innerHTML = filtrados.map(p => `
            <div style="padding:8px;border-bottom:1px solid var(--border);cursor:pointer"
                 onclick="seleccionarProductoPedido('${p.nombre}', '${p.unidad}')">
                ${p.nombre} <span style="color:var(--muted)">(${p.unidad})</span>
            </div>
        `).join('');
        sugerencias.style.display = 'block';
    } else {
        sugerencias.style.display = 'none';
    }
}

function seleccionarProductoPedido(nombre, unidad) {
    document.getElementById('inputProductoPedido').value = nombre;
    document.getElementById('inputUnidadPedido').value = unidad;
    document.getElementById('sugerenciasPedido').style.display = 'none';
    document.getElementById('busquedaProdPedido').value = '';
}

function agregarLineaPedido() {
    const producto = document.getElementById('inputProductoPedido').value.trim();
    const cantidad = document.getElementById('inputCantidadPedido').value;
    const unidad = document.getElementById('inputUnidadPedido').value.trim();

    if (!producto || !cantidad || !unidad) {
        alert('Completa todos los campos');
        return;
    }

    datosGlobales.lineasPedido.push({ producto, cantidad, unidad });
    document.getElementById('inputProductoPedido').value = '';
    document.getElementById('inputCantidadPedido').value = '';
    document.getElementById('inputUnidadPedido').value = '';
    renderizarLineasPedido();
}

function renderizarLineasPedido() {
    const lista = document.getElementById('lineasPedido');
    lista.innerHTML = datosGlobales.lineasPedido.length > 0 ? datosGlobales.lineasPedido.map((linea, i) => `
        <div class="list-item">
            <div class="list-item-primary">
                <div class="list-item-name">${linea.producto}</div>
                <div class="list-item-meta">${linea.cantidad} ${linea.unidad}</div>
            </div>
            <button onclick="eliminarLineaPedido(${i})" style="background:transparent;border:none;color:var(--error);cursor:pointer;padding:4px">✕</button>
        </div>
    `).join('') : '<p style="color:var(--muted);text-align:center">Sin líneas añadidas</p>';
}

function eliminarLineaPedido(index) {
    datosGlobales.lineasPedido.splice(index, 1);
    renderizarLineasPedido();
}

async function guardarPedido() {
    if (datosGlobales.lineasPedido.length === 0) {
        alert('Añade al menos un producto');
        return;
    }

    const proveedor = document.getElementById('selectProveedor').value;
    const resultado = await llamarAPI('compra', {
        proveedor,
        lineas: datosGlobales.lineasPedido
    });

    if (resultado.ok) {
        mostrarExito('Pedido guardado');
        limpiarPedido();
        cargarPedidosRealizados();
    }
}

function limpiarPedido() {
    datosGlobales.lineasPedido = [];
    renderizarLineasPedido();
    document.getElementById('selectProveedor').value = '';
    document.getElementById('formPedidoContainer').style.display = 'none';
    document.getElementById('resumenPedidoContainer').style.display = 'none';
}

async function cargarPedidosRealizados() {
    const datos = await obtenerDatos('pedidosHoy');
    if (datos.ok && datos.pedidos) {
        const container = document.getElementById('listaPedidosRealizados');
        container.innerHTML = datos.pedidos.length > 0 ? datos.pedidos.map(p => `
            <div class="list-item">
                <div class="list-item-primary">
                    <div class="list-item-name">${p.producto}</div>
                    <div class="list-item-meta">${p.proveedor} | ${p.fecha}</div>
                </div>
                <div class="list-item-value">${p.cantidad} ${p.unidad}</div>
            </div>
        `).join('') : '<p style="color:var(--muted);text-align:center">Sin pedidos hoy</p>';
    }
}

async function cargarAlbaranesRecibidos() {
    const fecha = document.getElementById('filtroFechaAlbaran').value;
    if (!fecha) return;
    const datos = await obtenerDatos('listarAlbaranes', { fecha });
    if (datos.ok) {
        const container = document.getElementById('listaAlbaranesRecibidos');
        container.innerHTML = (datos.albaranes || []).length > 0 ? datos.albaranes.map(a => `
            <div class="list-item">
                <div class="list-item-primary">
                    <div class="list-item-name">${a.proveedor}</div>
                    <div class="list-item-meta">${a.fecha}</div>
                </div>
            </div>
        `).join('') : '<p style="color:var(--muted);text-align:center">Sin albaranes</p>';
    }
}

function irFechaAlbaran(offset) {
    const input = document.getElementById('filtroFechaAlbaran');
    const fecha = new Date(input.value);
    fecha.setDate(fecha.getDate() + offset);
    input.value = fecha.toISOString().split('T')[0];
    cargarAlbaranesRecibidos();
}

function irFechaAlbaranHoy() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('filtroFechaAlbaran').value = today;
    cargarAlbaranesRecibidos();
}

function cambiarTabCompras(tab) {
    const botones = document.querySelectorAll('.tab-compras');
    botones.forEach(b => {
        if (b.dataset.tab === tab) {
            b.classList.add('btn-save');
            b.classList.remove('btn-secondary');
        } else {
            b.classList.remove('btn-save');
            b.classList.add('btn-secondary');
        }
    });

    document.getElementById('panelPedidosRealizados').style.display = tab === 'pedidos' ? 'block' : 'none';
    document.getElementById('panelAlbaranesRecibidos').style.display = tab === 'albaranes' ? 'block' : 'none';
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ✨ MERMAS — NUEVA PANTALLA ✨
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function filtrarProductosMermas() {
    const busqueda = document.getElementById('busquedaMermas').value.toLowerCase();
    const sugerencias = document.getElementById('sugerenciasMermas');
    const filtrados = datosGlobales.productos.filter(p => p.nombre.toLowerCase().includes(busqueda));

    if (filtrados.length > 0 && busqueda) {
        sugerencias.innerHTML = filtrados.map(p => `
            <div style="padding:8px;border-bottom:1px solid var(--border);cursor:pointer"
                 onclick="seleccionarProductoMerma('${p.nombre}', '${p.unidad}')">
                ${p.nombre} <span style="color:var(--muted)">(${p.unidad})</span>
            </div>
        `).join('');
        sugerencias.style.display = 'block';
    } else {
        sugerencias.style.display = 'none';
    }
}

function seleccionarProductoMerma(nombre, unidad) {
    document.getElementById('inputProductoMerma').value = nombre;
    document.getElementById('inputUnidadMerma').value = unidad;
    document.getElementById('sugerenciasMermas').style.display = 'none';
    document.getElementById('busquedaMermas').value = '';
}

async function agregarLineaMerma() {
    const producto = document.getElementById('inputProductoMerma').value.trim();
    const cantidad = parseFloat(document.getElementById('inputCantidadMerma').value);
    const unidad = document.getElementById('inputUnidadMerma').value.trim();
    const motivo = document.getElementById('selectMotivMerma').value;
    const notas = document.getElementById('inputNotasMerma').value.trim();

    if (!producto || !cantidad || !unidad || !motivo) {
        alert('Completa producto, cantidad, unidad y motivo');
        return;
    }

    const resultado = await llamarAPI('merma', {
        producto,
        cantidad,
        unidad,
        motivo,
        notas
    });

    if (resultado.ok) {
        mostrarExito('Merma registrada');
        document.getElementById('inputProductoMerma').value = '';
        document.getElementById('inputCantidadMerma').value = '';
        document.getElementById('inputUnidadMerma').value = '';
        document.getElementById('selectMotivMerma').value = '';
        document.getElementById('inputNotasMerma').value = '';
        cargarMermasHoy();
    }
}

async function cargarMermasHoy() {
    const datos = await obtenerDatos('listarMermas', { fecha: new Date().toISOString().split('T')[0] });
    if (datos.ok && datos.mermas) {
        datosGlobales.mermasHoy = datos.mermas;
        renderizarMermas();
        calcularTotalMermas();
    }
}

function renderizarMermas() {
    const container = document.getElementById('contenedorMermas');
    container.innerHTML = datosGlobales.mermasHoy.length > 0 ? datosGlobales.mermasHoy.map((m, i) => `
        <div class="list-item">
            <div class="list-item-primary">
                <div class="list-item-name">${m.producto}</div>
                <div class="list-item-meta">${m.motivo} | ${m.notas || '—'}</div>
            </div>
            <div style="text-align:right">
                <div class="list-item-value">${m.cantidad} ${m.unidad}</div>
                <button onclick="eliminarMerma(${i})" style="background:transparent;border:none;color:var(--error);cursor:pointer;padding:4px;margin-top:4px">🗑</button>
            </div>
        </div>
    `).join('') : '<p style="color:var(--muted);text-align:center">Sin mermas registradas hoy</p>';
}

function eliminarMerma(index) {
    datosGlobales.mermasHoy.splice(index, 1);
    renderizarMermas();
    calcularTotalMermas();
}

function calcularTotalMermas() {
    let total = 0;
    datosGlobales.mermasHoy.forEach(m => {
        const prod = datosGlobales.productos.find(p => p.nombre === m.producto);
        if (prod && datosGlobales.precios[prod.nombre]) {
            const precio = datosGlobales.precios[prod.nombre];
            total += m.cantidad * precio;
        }
    });
    document.getElementById('totalMermasEuros').textContent = '€' + total.toFixed(2);
    document.getElementById('totalMermasItems').textContent = datosGlobales.mermasHoy.length;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DASHBOARD
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

async function cargarDashboard() {
    const datos = await obtenerDatos('alertasPreciosData');
    if (datos.ok) {
        const alertas = datos.alertas || [];
        const container = document.getElementById('alertasPreciosContainer');
        container.innerHTML = alertas.length > 0 ? alertas.map(a => `
            <div class="list-item">
                <div class="list-item-primary">
                    <div class="list-item-name">${a.producto}</div>
                    <div class="list-item-meta">Anterior: €${a.precioAnterior || '—'}</div>
                </div>
                <div class="list-item-value" style="color:var(--accent-orange)">€${a.precioNuevo || '—'}</div>
            </div>
        `).join('') : '<p style="color:var(--muted);text-align:center">Sin cambios de precio</p>';
    }

    // TODO: Ingeniería de menú (Stars & Dogs)
    const menuContent = document.getElementById('ingenieriaMenuContent');
    menuContent.innerHTML = `
        <p style="color:var(--muted);text-align:center">Análisis de ventas vs margen por plato</p>
    `;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PRECIOS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

async function cargarPrecios() {
    const datos = await obtenerDatos('listarPreciosData');
    if (datos.ok && datos.precios) {
        datosGlobales.precios = {};
        datos.precios.forEach(p => {
            datosGlobales.precios[p.producto] = p.precio;
        });
        renderizarPrecios(datos.precios);
    }
}

function renderizarPrecios(precios) {
    const container = document.getElementById('listaPreciosContainer');
    const busqueda = document.getElementById('busquedaPrecios').value.toLowerCase();
    const filtrados = precios.filter(p => p.producto.toLowerCase().includes(busqueda));

    container.innerHTML = filtrados.map(p => `
        <div class="list-item">
            <div class="list-item-primary">
                <div class="list-item-name">${p.producto}</div>
                <div class="list-item-meta">Última actualización: ${p.fecha || '—'}</div>
            </div>
            <div class="list-item-value">€${p.precio.toFixed(2)}</div>
        </div>
    `).join('');
}

function filtrarPrecios() {
    cargarPrecios();
}

function mostrarPromptAlbaran() {
    const panel = document.getElementById('panelPromptAlbaran');
    const textarea = document.getElementById('textareaPrompt');
    textarea.value = `Eres un experto analizando fotos de albaranes de compra a proveedores de cocina.

Analiza esta foto del albarán y extrae:
- Nombre del proveedor
- Fecha de entrega
- Líneas de productos (nombre, cantidad, unidad, precio unitario si está visible)

Devuelve un JSON válido en este formato exacto:
{
  "proveedor": "Nombre Proveedor",
  "fechaEntrega": "dd/mm/yyyy",
  "lineas": [
    { "producto": "Nombre", "cantidad": 5, "unidad": "kg", "precioUnit": 4.20 }
  ]
}`;
    panel.style.display = 'block';
}

function copiarPrompt() {
    const textarea = document.getElementById('textareaPrompt');
    textarea.select();
    document.execCommand('copy');
    alert('Prompt copiado');
}

function procesarTextoAlbaran() {
    const texto = document.getElementById('inputTextoAlbaran').value.trim();
    try {
        const json = JSON.parse(texto);
        mostrarResultadoAlbaran(json);
    } catch (e) {
        alert('JSON inválido: ' + e.message);
    }
}

function mostrarResultadoAlbaran(json) {
    const container = document.getElementById('albaranResultContainer');
    const lineasContainer = document.getElementById('albaranLineas');

    document.getElementById('albaranProveedor').value = json.proveedor || '';

    let fechaEntrega = json.fechaEntrega;
    if (fechaEntrega) {
        const partes = fechaEntrega.split('/');
        if (partes.length === 3) {
            fechaEntrega = `${partes[2]}-${partes[1]}-${partes[0]}`;
        }
    }
    document.getElementById('albaranFechaEntrega').value = fechaEntrega || '';

    lineasContainer.innerHTML = (json.lineas || []).map((linea, i) => `
        <div style="background:var(--surface2);padding:var(--spacing-md);border-radius:var(--radius-md);margin-bottom:var(--spacing-md)">
            <div class="grid-2">
                <input type="text" id="alb_prod_${i}" value="${linea.producto}" placeholder="Producto">
                <input type="number" id="alb_cant_${i}" value="${linea.cantidad}" placeholder="Cantidad" step="0.1">
            </div>
            <div class="grid-2" style="margin-top:var(--spacing-md)">
                <input type="text" id="alb_unit_${i}" value="${linea.unidad}" placeholder="Unidad">
                <input type="number" id="alb_prec_${i}" value="${linea.precioUnit || ''}" placeholder="€/ud" step="0.01">
            </div>
        </div>
    `).join('');

    container.style.display = 'flex';
}

async function confirmarAlbaran() {
    const proveedor = document.getElementById('albaranProveedor').value;
    const fecha = document.getElementById('albaranFechaEntrega').value;

    if (!proveedor || !fecha) {
        alert('Confirma proveedor y fecha');
        return;
    }

    const lineas = [];
    document.querySelectorAll('#albaranLineas > div').forEach((div, i) => {
        const producto = document.getElementById(`alb_prod_${i}`).value;
        const cantidad = parseFloat(document.getElementById(`alb_cant_${i}`).value);
        const unidad = document.getElementById(`alb_unit_${i}`).value;
        const precio = parseFloat(document.getElementById(`alb_prec_${i}`).value) || null;

        if (producto && cantidad) {
            lineas.push({ producto, cantidad, unidad, precio });
        }
    });

    if (lineas.length === 0) {
        alert('Añade al menos una línea');
        return;
    }

    const resultado = await llamarAPI('guardarAlbaranRecibido', {
        proveedor,
        fecha,
        lineas
    });

    if (resultado.ok) {
        mostrarExito('Albarán guardado');
        descartarAlbaran();
    }
}

function descartarAlbaran() {
    document.getElementById('albaranResultContainer').style.display = 'none';
    document.getElementById('inputTextoAlbaran').value = '';
}

async function cargarGestionAlias() {
    const datos = await obtenerDatos('listarAliasData');
    if (datos.ok && datos.alias) {
        const container = document.getElementById('listaAliasGestion');
        container.innerHTML = datos.alias.length > 0 ? datos.alias.map(a => `
            <div class="list-item">
                <div class="list-item-primary">
                    <div class="list-item-name">"${a.nombre_albaranHTML}"</div>
                    <div class="list-item-meta">→ ${a.nombre_biblioteca}</div>
                </div>
            </div>
        `).join('') : '<p style="color:var(--muted);text-align:center">Sin alias</p>';
    }
}

function mostrarModalAlias() {
    document.getElementById('modalAlias').classList.add('show');
}

function cerrarModalAlias() {
    document.getElementById('modalAlias').classList.remove('show');
}

function guardarAliasModal() {
    // Implementar si es necesario
    cerrarModalAlias();
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CARTA / ESCANDALLOS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function mostrarFormNuevoPlato() {
    document.getElementById('formNuevoPlato').style.display = 'flex';
}

function ocultarFormNuevoPlato() {
    document.getElementById('formNuevoPlato').style.display = 'none';
}

async function guardarNuevoPlato() {
    const nombre = document.getElementById('npNombrePlato').value.trim();
    const categoria = document.getElementById('npCategoriaplato').value;
    const pvp = parseFloat(document.getElementById('npPVP').value) || 0;

    if (!nombre || !categoria) {
        alert('Nombre y categoría son obligatorios');
        return;
    }

    const resultado = await llamarAPI('guardarPlato', {
        nombre,
        categoria,
        pvp
    });

    if (resultado.ok) {
        mostrarExito('Plato añadido');
        ocultarFormNuevoPlato();
        cargarPlatos();
    }
}

async function cargarPlatos() {
    const datos = await obtenerDatos('listarPlatosData');
    if (datos.ok && datos.platos) {
        datosGlobales.platosTodos = datos.platos;
        filtrarPlatos();
    }
}

function filtrarPlatos() {
    const busqueda = document.getElementById('busquedaPlatos').value.toLowerCase();
    const categoria = document.getElementById('filtroCategoriaCarta').value;

    const filtrados = datosGlobales.platosTodos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda) &&
        (!categoria || p.categoria === categoria)
    );

    const container = document.getElementById('listaPlatos');
    container.innerHTML = filtrados.map(p => `
        <div class="card">
            <div class="flex-between">
                <div>
                    <div class="list-item-name">${p.nombre}</div>
                    <div class="list-item-meta">${p.categoria} | PVP: €${p.pvp.toFixed(2)}</div>
                </div>
                <button onclick="abrirEscandallo('${p.nombre}')" class="btn-secondary" style="padding:6px 12px;font-size:0.8rem">📋</button>
            </div>
        </div>
    `).join('');
}

function abrirEscandallo(platoNombre) {
    document.getElementById('modalEscNombre').textContent = platoNombre;
    document.getElementById('modalEscPlatoKey').value = platoNombre;
    document.getElementById('busqIngEsc').value = '';
    document.getElementById('lineasEscandallo').innerHTML = '';
    document.getElementById('modalEscandallo').classList.add('show');
}

function cerrarModalEscandallo() {
    document.getElementById('modalEscandallo').classList.remove('show');
}

function filtrarIngEscandallo() {
    const busqueda = document.getElementById('busqIngEsc').value.toLowerCase();
    const sugerencias = document.getElementById('sugIngEsc');

    const filtrados = [
        ...datosGlobales.productos,
        ...datosGlobales.stockItems
    ].filter(i => i.nombre.toLowerCase().includes(busqueda));

    if (filtrados.length > 0 && busqueda) {
        sugerencias.innerHTML = filtrados.map(i => `
            <div style="padding:8px;border-bottom:1px solid var(--border);cursor:pointer"
                 onclick="agregarIngEscandallo('${i.nombre}')">
                ${i.nombre}
            </div>
        `).join('');
        sugerencias.style.display = 'block';
    } else {
        sugerencias.style.display = 'none';
    }
}

function agregarIngEscandallo(ingrediente) {
    const lineas = document.getElementById('lineasEscandallo');
    const nuevoId = Date.now();
    const item = document.createElement('div');
    item.id = 'esc_' + nuevoId;
    item.style.cssText = 'background:var(--surface2);padding:var(--spacing-md);border-radius:var(--radius-md);margin-bottom:var(--spacing-md);display:grid;grid-template-columns:1fr 100px;gap:var(--spacing-md);align-items:center';
    item.innerHTML = `
        <div style="color:var(--text)">${ingrediente}</div>
        <input type="number" placeholder="Gramos" step="1" min="0" style="padding:var(--spacing-sm);border:1px solid var(--border);background:var(--surface);color:var(--text);border-radius:var(--radius-sm)">
    `;
    lineas.appendChild(item);
    document.getElementById('busqIngEsc').value = '';
    document.getElementById('sugIngEsc').style.display = 'none';
}

async function guardarEscandalloModal() {
    const platoNombre = document.getElementById('modalEscPlatoKey').value;
    const lineas = [];

    document.querySelectorAll('#lineasEscandallo > div').forEach(div => {
        const nombre = div.querySelector('div:first-child').textContent;
        const gramos = parseFloat(div.querySelector('input').value);
        if (gramos > 0) {
            lineas.push({ ingrediente: nombre, gramos });
        }
    });

    if (lineas.length === 0) {
        alert('Añade al menos un ingrediente');
        return;
    }

    const resultado = await llamarAPI('guardarEscandallo', {
        plato: platoNombre,
        lineas
    });

    if (resultado.ok) {
        mostrarExito('Escandallo guardado');
        cerrarModalEscandallo();
    }
}

function cerrarModalEditarStockItem() {
    document.getElementById('modalEditarStockItem').classList.remove('show');
}

async function guardarEdicionStockItem() {
    const nombreOrig = document.getElementById('eiNombreOriginal').value;
    const resultado = await llamarAPI('editarStockItem', {
        nombreOriginal: nombreOrig,
        nombre: document.getElementById('eiNombre').value,
        categoria: document.getElementById('eiCategoria').value
    });
    if (resultado.ok) {
        cerrarModalEditarStockItem();
        cargarStockItems();
        mostrarExito('Elaboración actualizada');
    }
}

function cerrarModalRendimiento() {
    document.getElementById('modalRendimiento').classList.remove('show');
}

async function guardarRendimiento() {
    // Implementar si es necesario
    cerrarModalRendimiento();
}

function abrirCamaraNP() {
    document.getElementById('inputFotoNP_camara').click();
}

function abrirArchivosNP() {
    document.getElementById('inputFotoNP_archivo').click();
}

function onFotoNPSeleccionada(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('previewFotoNP').style.display = 'block';
        document.getElementById('imgPreviewNP').src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function quitarFotoNP() {
    document.getElementById('previewFotoNP').style.display = 'none';
    document.getElementById('inputFotoNP_camara').value = '';
    document.getElementById('inputFotoNP_archivo').value = '';
}

function onFotoCocinaSeleccionada(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        // Guardar foto si es necesario
    };
    reader.readAsDataURL(file);
}

function añadirLineaAlbaranManual() {
    const lineasContainer = document.getElementById('albaranLineas');
    const i = lineasContainer.querySelectorAll('> div').length;
    const div = document.createElement('div');
    div.style.cssText = 'background:var(--surface2);padding:var(--spacing-md);border-radius:var(--radius-md);margin-bottom:var(--spacing-md)';
    div.innerHTML = `
        <div class="grid-2">
            <input type="text" id="alb_prod_${i}" placeholder="Producto">
            <input type="number" id="alb_cant_${i}" placeholder="Cantidad" step="0.1">
        </div>
        <div class="grid-2" style="margin-top:var(--spacing-md)">
            <input type="text" id="alb_unit_${i}" placeholder="Unidad">
            <input type="number" id="alb_prec_${i}" placeholder="€/ud" step="0.01">
        </div>
    `;
    lineasContainer.appendChild(div);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   INICIALIZACIÓN
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

document.addEventListener('DOMContentLoaded', function() {
    cargarProductos();
    cargarStockItems();
    cargarElaboraciones();
    cargarPlatos();
    cargarPrecios();

    // Selector de semanas
    const selectorSemanas = document.getElementById('selectorSemanasStock');
    if (selectorSemanas) {
        const hoy = new Date();
        const semanas = [];
        for (let i = 0; i < 52; i++) {
            const fecha = new Date(hoy);
            fecha.setDate(fecha.getDate() - i * 7);
            const year = fecha.getFullYear();
            const week = Math.ceil((fecha.getDate() - fecha.getDay()) / 7);
            const semanaISO = `${year}-W${String(week).padStart(2, '0')}`;
            if (!semanas.includes(semanaISO)) {
                semanas.push(semanaISO);
            }
        }
        selectorSemanas.innerHTML = semanas.map(s => `<option value="${s}">${s}</option>`).join('');
        if (semanas.length > 0) {
            selectorSemanas.value = semanas[0];
            cambiarSemanaStock(semanas[0]);
        }
    }

    // Date picker albaranes
    const filtroFecha = document.getElementById('filtroFechaAlbaran');
    if (filtroFecha) {
        const today = new Date().toISOString().split('T')[0];
        filtroFecha.value = today;
    }

    console.log('✨ Divina Italia Stitch v2 iniciada');
});
