(function(){
  var PRODUCTS = CATALOGO; // viene de catalogo.js

  var cart = {}; // id -> qty
  var qtyPicker = {}; // id -> qty currently selected on card, before adding

  var grid = document.getElementById('productGrid');
  var fmt = function(n){ return '$' + n.toLocaleString('es-AR'); };

  function renderProducts(){
    grid.innerHTML = '';
    PRODUCTS.forEach(function(p){
      qtyPicker[p.id] = qtyPicker[p.id] || 1;
      var low = p.stock <= 8;
      var card = document.createElement('div');
      card.className = 'card';
      card.innerHTML =
        '<h4>'+p.name+'</h4>' +
        '<div class="type-tag">'+p.type+'</div>' +
        '<div class="comp">'+p.comp+'</div>' +
        '<div class="stockline"><span class="'+(low?'stock-low':'stock-ok')+'">'+
          (low ? '¡Últimas unidades! · ' : 'Stock disponible · ') + p.stock + ' u.' +
        '</span></div>' +
        '<div class="price">'+fmt(p.price)+'</div>' +
        '<div class="card-foot">' +
          '<div class="stepper">' +
            '<button data-act="minus" data-id="'+p.id+'" aria-label="Restar">−</button>' +
            '<span class="qty" id="qty-'+p.id+'">'+qtyPicker[p.id]+'</span>' +
            '<button data-act="plus" data-id="'+p.id+'" aria-label="Sumar">+</button>' +
          '</div>' +
          '<button class="add-btn" data-add="'+p.id+'" '+(p.stock<1?'disabled':'')+'>Agregar</button>' +
        '</div>' +
        '<div class="added-flash" id="flash-'+p.id+'" hidden>Agregado al carrito ✓</div>';
      grid.appendChild(card);
    });
  }

  grid.addEventListener('click', function(e){
    var t = e.target;
    if(t.dataset.act){
      var id = t.dataset.id;
      var p = PRODUCTS.find(function(x){return x.id===id;});
      var q = qtyPicker[id] || 1;
      if(t.dataset.act === 'plus') q = Math.min(p.stock, q+1);
      if(t.dataset.act === 'minus') q = Math.max(1, q-1);
      qtyPicker[id] = q;
      document.getElementById('qty-'+id).textContent = q;
    }
    if(t.dataset.add){
      var id2 = t.dataset.add;
      var q2 = qtyPicker[id2] || 1;
      cart[id2] = (cart[id2] || 0) + q2;
      updateCartCount();
      var flash = document.getElementById('flash-'+id2);
      flash.hidden = false;
      setTimeout(function(){ flash.hidden = true; }, 1400);
    }
  });

  function cartItems(){
    return Object.keys(cart).filter(function(id){return cart[id] > 0;}).map(function(id){
      var p = PRODUCTS.find(function(x){return x.id===id;});
      return {p:p, qty:cart[id]};
    });
  }
  function cartTotal(){
    return cartItems().reduce(function(sum,it){ return sum + it.p.price*it.qty; }, 0);
  }
  function updateCartCount(){
    var n = cartItems().reduce(function(s,it){return s+it.qty;},0);
    document.getElementById('cartCount').textContent = n;
    renderDrawer();
  }

  var drawerBody = document.getElementById('drawerBody');
  var drawerFoot = document.getElementById('drawerFoot');
  var drawerTitle = document.getElementById('drawerTitle');
  var checkoutMode = false;
  var confirmedMode = false;
  var lastOrderNumber = '';
  var paymentMethod = 'transfer'; // 'transfer' | 'qr'

  function renderDrawer(){
    var items = cartItems();
    if(confirmedMode){
      renderConfirmation();
      return;
    }
    if(checkoutMode){
      renderCheckout();
      return;
    }
    drawerTitle.textContent = 'Tu carrito';
    if(items.length === 0){
      drawerBody.innerHTML = '<div class="empty-cart">Todavía no agregaste ninguna cápsula.<br>Elegí algo de la carta.</div>';
      drawerFoot.innerHTML = '';
      return;
    }
    drawerBody.innerHTML = items.map(function(it){
      return '<div class="line-item">' +
        '<div>' +
          '<div class="li-name">'+it.p.name+'</div>' +
          '<div class="li-meta">' +
            '<div class="stepper li-stepper">' +
              '<button data-cart-act="minus" data-cart-id="'+it.p.id+'" aria-label="Restar">−</button>' +
              '<span class="qty">'+it.qty+'</span>' +
              '<button data-cart-act="plus" data-cart-id="'+it.p.id+'" aria-label="Sumar" '+(it.qty>=it.p.stock?'disabled':'')+'>+</button>' +
            '</div>' +
            '<button class="li-remove" data-remove="'+it.p.id+'">quitar</button>' +
          '</div>' +
        '</div>' +
        '<div class="li-price">'+fmt(it.p.price*it.qty)+'</div>' +
      '</div>';
    }).join('');
    drawerFoot.innerHTML =
      '<button class="clear-btn" id="clearCart">Vaciar carrito</button>' +
      '<div class="total-row"><span>Subtotal</span><span class="amt">'+fmt(cartTotal())+'</span></div>' +
      '<button class="btn-primary" id="goCheckout" style="width:100%;">Continuar con la compra</button>';
  }

  function renderCheckout(){
    drawerTitle.textContent = 'Cómo querés pagar';
    var items = cartItems();
    var payBlock = paymentMethod === 'qr' ? qrPaymentBlock() : transferBlock();
    drawerBody.innerHTML =
      '<div class="checkout">' +
        '<div class="pay-tabs">' +
          '<button class="pay-tab" data-pay="transfer" '+(paymentMethod==='transfer'?'data-active':'')+'>Transferencia</button>' +
          '<button class="pay-tab" data-pay="qr" '+(paymentMethod==='qr'?'data-active':'')+'>Código QR</button>' +
        '</div>' +
        payBlock +
        '<p class="note">Este es un prototipo — acá no se procesa ningún pago real todavía.</p>' +
      '</div>';
    drawerFoot.innerHTML =
      '<button class="back-link" id="backToCart" style="align-self:flex-start;">← Volver al carrito</button>' +
      '<button class="btn-primary" id="confirmOrder" style="width:100%;">'+(paymentMethod==='qr'?'Ya pagué':'Ya transferí')+'</button>';

    drawerBody.querySelectorAll('.pay-tab').forEach(function(btn){
      btn.addEventListener('click', function(){
        paymentMethod = btn.dataset.pay;
        renderCheckout();
      });
    });

    drawerBody.querySelectorAll('.copy-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        var val = btn.dataset.copy;
        var done = function(){
          btn.textContent = 'Copiado ✓';
          btn.classList.add('copied');
          setTimeout(function(){ btn.textContent='Copiar'; btn.classList.remove('copied'); }, 1300);
        };
        if(navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(val).then(done).catch(function(){
            selectText(btn);
          });
        } else {
          selectText(btn);
        }
      });
    });
  }

  function transferBlock(){
    return '<p class="note">Guardamos tu pedido. Para confirmarlo, transferí el monto total a esta cuenta y mandanos el comprobante.</p>' +
      '<div class="bank-card">' +
        bankRow('Titular','Café SofIA S.R.L.') +
        bankRow('Alias', 'CAFE.SOFIA.IA') +
        bankRow('CBU', '0000003100012345678901') +
        bankRow('Banco', 'Banco del Jazz') +
        bankRow('Monto a transferir', fmt(cartTotal())) +
        '<span class="stamp">pendiente de pago</span>' +
      '</div>';
  }

  function qrPaymentBlock(){
    return '<p class="note">Escaneá este código desde tu app de pagos para transferir el monto total.</p>' +
      '<div class="qr-card">' +
        '<div class="qr-box">'+qrPattern()+'</div>' +
        '<div class="qr-amt">'+fmt(cartTotal())+'</div>' +
        '<span class="stamp">pendiente de pago</span>' +
      '</div>';
  }

  function qrPattern(){
    var size = 11, cell = 8, seed = 42;
    function rand(){ seed = (seed*9301+49297) % 233280; return seed/233280; }
    var cells = '';
    for(var y=0;y<size;y++){
      for(var x=0;x<size;x++){
        var inFinder = (x<3&&y<3)||(x>size-4&&y<3)||(x<3&&y>size-4);
        if(inFinder) continue;
        if(rand() > 0.52){
          cells += '<rect x="'+(x*cell)+'" y="'+(y*cell)+'" width="'+cell+'" height="'+cell+'"/>';
        }
      }
    }
    function finder(fx,fy){
      return '<rect x="'+(fx*cell)+'" y="'+(fy*cell)+'" width="'+(3*cell)+'" height="'+(3*cell)+'" fill="none" stroke="currentColor" stroke-width="'+(cell*0.9)+'"/>' +
             '<rect x="'+((fx+1)*cell)+'" y="'+((fy+1)*cell)+'" width="'+cell+'" height="'+cell+'"/>';
    }
    return '<svg viewBox="0 0 '+(size*cell)+' '+(size*cell)+'" width="148" height="148" role="img" aria-label="Código QR de ejemplo">' +
      '<g fill="currentColor">' + cells + finder(0,0) + finder(size-3,0) + finder(0,size-3) + '</g>' +
    '</svg>';
  }

  function renderConfirmation(){
    drawerTitle.textContent = 'Pedido registrado';
    drawerBody.innerHTML =
      '<div class="confirm">' +
        confettiMarkup() +
        '<span class="lograste">¡Lo lograste!</span>' +
        '<div class="check">✓</div>' +
        '<h4>¡Gracias!</h4>' +
        '<p>Tu pedido quedó registrado. Sof<span class="ia-mark">IA</span> avisa al equipo y, apenas se confirme la transferencia, un barista prepara tus cápsulas.</p>' +
        '<div class="order-num">Pedido N.º '+lastOrderNumber+'</div>' +
      '</div>';
    drawerFoot.innerHTML = '<button class="btn-primary" id="newOrder" style="width:100%;">Seguir comprando</button>';
  }

  function confettiMarkup(){
    var colors = ['var(--glow)','var(--brass)','var(--wine)','var(--brass-deep)'];
    var pieces = '';
    for(var i=0;i<14;i++){
      var tx = Math.round((Math.random()*220 - 110));
      var ty = Math.round(60 + Math.random()*90);
      var rot = Math.round(Math.random()*360);
      var delay = (Math.random()*0.15).toFixed(2);
      var color = colors[i % colors.length];
      pieces += '<span class="confetti-piece" style="' +
        '--tx:'+tx+'px; --ty:'+ty+'px; --rot:'+rot+'deg; ' +
        'background:'+color+'; left:'+(50 + (Math.random()*20-10))+'%; animation-delay:'+delay+'s;' +
      '"></span>';
    }
    return '<div class="confetti-wrap">'+pieces+'</div>';
  }

  function playChime(){
    try{
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if(!Ctx) return;
      var ctx = new Ctx();
      var notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach(function(freq, i){
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        var start = ctx.currentTime + i*0.09;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.16, start+0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start+0.4);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start+0.45);
      });
    }catch(e){ /* sonido opcional: si falla, no interrumpe el flujo */ }
  }

  function selectText(btn){
    var row = btn.closest('.bank-row');
    var valEl = row.querySelector('.val');
    var range = document.createRange();
    range.selectNodeContents(valEl);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function bankRow(label, value){
    return '<div class="bank-row"><span class="lbl">'+label+'</span>' +
      '<span style="display:flex; align-items:center; gap:8px;">' +
        '<span class="val">'+value+'</span>' +
        '<button class="copy-btn" data-copy="'+value+'">Copiar</button>' +
      '</span></div>';
  }

  drawerBody.addEventListener('click', function(e){
    var id = e.target.dataset.remove;
    if(id){ delete cart[id]; updateCartCount(); return; }

    var actId = e.target.dataset.cartId;
    if(actId){
      var p = PRODUCTS.find(function(x){return x.id===actId;});
      var q = cart[actId] || 0;
      if(e.target.dataset.cartAct === 'plus') q = Math.min(p.stock, q+1);
      if(e.target.dataset.cartAct === 'minus') q = q-1;
      if(q <= 0){ delete cart[actId]; } else { cart[actId] = q; }
      updateCartCount();
    }
  });
  drawerFoot.addEventListener('click', function(e){
    if(e.target.id === 'goCheckout'){ checkoutMode = true; renderDrawer(); }
    if(e.target.id === 'backToCart'){ checkoutMode = false; renderDrawer(); }
    if(e.target.id === 'clearCart'){ cart = {}; updateCartCount(); }
    if(e.target.id === 'confirmOrder'){
      confirmarPedido(e.target);
    }
    if(e.target.id === 'newOrder'){
      confirmedMode = false;
      renderDrawer();
    }
  });

  // Registra el pedido en el backend a través de la función serverless /api/pedido.
  // Solo viajan ids y cantidades: los precios los recalcula el servidor.
  function confirmarPedido(btn){
    var textoOriginal = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Registrando tu pedido…';
    mostrarErrorPedido('');

    var items = cartItems().map(function(it){ return {id:it.p.id, qty:it.qty}; });
    fetch('/api/pedido', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({items:items, metodo:paymentMethod})
    })
    .then(function(r){
      return r.json().catch(function(){ return {ok:false}; });
    })
    .then(function(data){
      if(!data.ok) throw new Error(data.error || 'No pudimos registrar tu pedido.');
      lastOrderNumber = data.orderId;
      cart = {};
      checkoutMode = false;
      confirmedMode = true;
      updateCartCount();
      playChime();
    })
    .catch(function(err){
      btn.disabled = false;
      btn.textContent = textoOriginal;
      mostrarErrorPedido(err && err.message && err.message !== 'Failed to fetch'
        ? err.message
        : 'No pudimos conectarnos. Revisá tu conexión y probá de nuevo.');
    });
  }

  function mostrarErrorPedido(msg){
    var box = document.getElementById('orderError');
    if(!box){
      box = document.createElement('p');
      box.id = 'orderError';
      box.className = 'note order-error';
      box.setAttribute('role', 'alert');
      drawerFoot.insertBefore(box, drawerFoot.firstChild);
    }
    box.textContent = msg;
    box.hidden = !msg;
  }

  // drawer open/close
  var drawer = document.getElementById('drawer');
  var scrim = document.getElementById('scrim');
  function openDrawer(){ checkoutMode=false; confirmedMode=false; renderDrawer(); drawer.classList.add('open'); scrim.classList.add('open'); }
  function closeDrawer(){ drawer.classList.remove('open'); scrim.classList.remove('open'); }
  document.getElementById('openCart').addEventListener('click', openDrawer);
  document.getElementById('closeCart').addEventListener('click', closeDrawer);
  scrim.addEventListener('click', closeDrawer);

  // landing <-> shop
  var landing = document.getElementById('landing');
  var shop = document.getElementById('shop');
  var topbar = document.getElementById('topbar');
  document.getElementById('enterShop').addEventListener('click', function(){
    landing.hidden = true; shop.hidden = false; topbar.hidden = false;
    window.scrollTo({top:0, behavior:'instant'});
  });
  document.getElementById('backToLanding').addEventListener('click', function(){
    shop.hidden = true; landing.hidden = false; topbar.hidden = true;
    window.scrollTo({top:0, behavior:'instant'});
  });

  // ambient AI readout ticker
  var lines = [
    'IA revisando stock de insumos…',
    'IA sugiriendo reposición de Cápsula Holiday…',
    'IA registrando el último pedido…',
    'IA comparando ventas de la semana…',
    'Todo listo. Un humano prepara tu taza.'
  ];
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var readout = document.getElementById('readout');
  if(!reduce){
    var i = 0;
    setInterval(function(){
      i = (i+1) % lines.length;
      readout.style.opacity = 0;
      setTimeout(function(){ readout.textContent = lines[i]; readout.style.opacity = 1; }, 220);
    }, 2600);
    readout.style.transition = 'opacity .2s ease';
  }

  renderProducts();
  updateCartCount();
})();
