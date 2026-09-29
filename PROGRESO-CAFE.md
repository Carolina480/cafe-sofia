# Mi progreso — Café SofIA

## Clase 5 · De un prompt a una app publicada en Internet (tramo final)
- [x] Etapa 0 · Punto de partida: llegaste a Claude Code
- [x] Etapa 1 · GitHub — código en github.com/Carolina480/cafe-sofia
- [x] Etapa 2 · Vercel — URL pública — https://cafe-sofia-beta.vercel.app

## Clase 6 · Conectar con el mundo real
- [x] Etapa 3 · La arquitectura, como un restaurante — entendió frontend vs backend
- [x] Etapa 4 · Conectar el frontend con el backend — primera venta real registrada (SOFIA-F052P9)
- [x] Etapa 5 · Variables de entorno — entiende el cajón en la caja fuerte (Vercel)
- [x] Etapa 6 · El token entre servidores — HITO 2 🏆 (la cocina rechaza intrusos y acepta a Vercel)
- [ ] Etapa 7 · Los métodos de pago
- [ ] Etapa 8 · El panel de administración: la trastienda
- [ ] Etapa 9 · Usar el panel: carta, insumos, stock y transferencias
- [ ] Etapa 10 · SofIA en modo real

## Notas de contexto
_(Lo importante para retomar. Sin claves ni contraseñas.)_
- Usa Windows.
- Usuario de GitHub: Carolina480. Git configurado con nombre "Carolina Rios".
- Repositorio: https://github.com/Carolina480/cafe-sofia (público, rama main).
- Vercel: proyecto importado desde GitHub (preset Other). URL pública: https://cafe-sofia-beta.vercel.app
- Tiene su backend de Apps Script publicado (URL /exec; no se anota aquí porque el repo es público: va en Vercel).
- Espejo del backend: apps-script/Codigo.gs (= "Sin título.gs" en Apps Script) e apps-script/Index.html (tablero). Ignorados por .gitignore. No tiene Pedidos.gs todavía.
- Variable en Vercel: APPS_SCRIPT_URL (Production, Preview, Development).
- Token entre servidores: en Vercel se llama APPS_SCRIPT_TOKEN (3 entornos, marcado Sensitive); en Apps Script es la Script Property API_TOKEN. Si se cambia, cambiarlo en los dos lados.
- Backend: el código de apps-script/Ventas.gs está en Apps Script como "Sin título 2.gs" (doPost). Implementación: Ejecutar como Yo, acceso "Cualquiera". Siempre publicar con lápiz → Nueva versión.
- Ojo: los ids de la tienda (armstrong, fitzgerald, holiday, coltrane, monk) no están en la hoja 'carta'/'recetas' de la planilla: la venta se anota pero no descuenta stock hasta cargarlos (Etapa 8/9).
- El proyecto es HTML/CSS/JS simple (index.html, style.css, script.js), no React + Vite.
- La guía está instalada en C:\Users\Usuario\.claude\skills\guia-cafe-sofia (con etapas.md).
