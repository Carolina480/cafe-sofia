// Función serverless de Vercel: POST /api/pedido
//
// Recibe el carrito desde la tienda, recalcula precios con la carta oficial
// (catalogo.js) y avisa la venta al backend de Google Apps Script.
// La URL del backend (APPS_SCRIPT_URL) y la contraseña compartida con él
// (APPS_SCRIPT_TOKEN) viven en variables de entorno: nunca llegan al navegador.

const CATALOGO = require('../catalogo.js');

const METODOS_VALIDOS = ['transfer', 'qr'];
const MAX_UNIDADES_POR_ITEM = 50;
const TIMEOUT_BACKEND_MS = 20000;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Método no permitido.' });
  }

  const backendUrl = process.env.APPS_SCRIPT_URL;
  const backendToken = process.env.APPS_SCRIPT_TOKEN;
  if (!backendUrl || !backendToken) {
    console.error('Falta la variable de entorno ' + (!backendUrl ? 'APPS_SCRIPT_URL' : 'APPS_SCRIPT_TOKEN') + '.');
    return res.status(500).json({ ok: false, error: 'La tienda no está configurada todavía.' });
  }

  let pedido;
  try {
    pedido = armarPedido(req.body);
  } catch (e) {
    return res.status(400).json({ ok: false, error: e.message });
  }

  try {
    const respuesta = await enviarAlBackend(backendUrl, backendToken, pedido);
    if (!respuesta.ok) {
      console.error('El backend rechazó el pedido', pedido.orderId, respuesta.error);
      return res.status(502).json({ ok: false, error: 'No pudimos registrar tu pedido. Probá de nuevo en un momento.' });
    }
    return res.status(200).json({ ok: true, orderId: pedido.orderId, total: pedido.total });
  } catch (e) {
    console.error('Error hablando con el backend', pedido.orderId, e);
    return res.status(502).json({ ok: false, error: 'No pudimos registrar tu pedido. Probá de nuevo en un momento.' });
  }
};

// Valida lo que mandó el navegador y arma el pedido con los precios oficiales.
// Del cliente solo se aceptan ids y cantidades; nombres y precios salen de la carta.
function armarPedido(body) {
  const datos = typeof body === 'string' ? JSON.parse(body || '{}') : (body || {});
  const metodo = METODOS_VALIDOS.indexOf(datos.metodo) >= 0 ? datos.metodo : null;
  if (!metodo) throw new Error('Método de pago inválido.');
  if (!Array.isArray(datos.items) || datos.items.length === 0) throw new Error('El carrito está vacío.');

  const items = datos.items.map(function (it) {
    const producto = CATALOGO.find(function (p) { return p.id === it.id; });
    if (!producto) throw new Error('Producto inexistente: ' + it.id);
    const cantidad = Number(it.qty);
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > MAX_UNIDADES_POR_ITEM) {
      throw new Error('Cantidad inválida para ' + producto.name + '.');
    }
    return { id: producto.id, nombre: producto.name, precio: producto.price, cantidad: cantidad };
  });

  const total = items.reduce(function (s, it) { return s + it.precio * it.cantidad; }, 0);
  return { accion: 'venta', orderId: nuevoOrderId(), metodo: metodo, items: items, total: total };
}

function nuevoOrderId() {
  const sufijo = Date.now().toString(36).slice(-4) + Math.floor(Math.random() * 1296).toString(36);
  return 'SOFIA-' + sufijo.toUpperCase();
}

// Manda la comanda a Apps Script. Apps Script responde con una redirección
// que fetch sigue sola; al final devuelve el JSON de doPost.
// El token viaja dentro del cuerpo porque doPost no puede leer encabezados HTTP.
async function enviarAlBackend(url, token, pedido) {
  const control = new AbortController();
  const reloj = setTimeout(function () { control.abort(); }, TIMEOUT_BACKEND_MS);
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ token: token }, pedido)),
      redirect: 'follow',
      signal: control.signal
    });
    const texto = await r.text();
    try {
      return JSON.parse(texto);
    } catch (e) {
      return { ok: false, error: 'Respuesta no válida del backend (HTTP ' + r.status + '): ' + texto.slice(0, 200) };
    }
  } finally {
    clearTimeout(reloj);
  }
}
