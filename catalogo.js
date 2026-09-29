// Carta de Café SofIA: la única fuente de productos y precios.
// La usan dos lados:
//   - la tienda (index.html la carga antes que script.js)
//   - la función serverless api/pedido.js, que recalcula los precios del lado
//     del servidor para que nadie pueda cambiarlos desde el navegador.
var CATALOGO = [
  {id:'armstrong', name:'Blend Armstrong', type:'Espresso', comp:'Espresso intenso, cardamomo y chocolate amargo.', price:3200, stock:18},
  {id:'fitzgerald', name:'Cápsula Fitzgerald', type:'Capuchino', comp:'Espresso suave, leche de avena y vainilla.', price:2900, stock:24},
  {id:'holiday', name:'Cápsula Holiday', type:'Macchiato', comp:'Espresso robusto con caramelo salado.', price:3400, stock:6},
  {id:'coltrane', name:'Cápsula Coltrane', type:'Americano doble', comp:'Espresso doble, canela y ralladura de naranja.', price:3600, stock:15},
  {id:'monk', name:'Cápsula Monk (descafeinado)', type:'Descafeinado', comp:'Descafeinado suave con notas a nuez tostada.', price:2800, stock:30}
];

if (typeof module !== 'undefined' && module.exports) module.exports = CATALOGO;
