/**
 * comprar.js — Sistema de compra EcomendaStore
 * Lógica: modal · descuentos · Google Sheets · WhatsApp
 */

(function () {
  'use strict';

  /* =========================================================
     CONFIGURACIÓN
     ========================================================= */
  const CONFIG = {
    PRECIO_BASE:    69990,       // COP
    WA_NUMERO:      '573165695773',
    // Pega aquí la URL del Apps Script después de desplegarlo:
    SHEETS_URL:     'https://script.google.com/macros/s/AKfycbzL6tLzkrQC1DdxJINdCoh5MfcIuCWQO0DRGqnK2d-i5dX8PDcCJmHFQxPMktdeWrGN/exec',
    DESCUENTOS: [
      { desde: 3, porcentaje: 30 },
      { desde: 2, porcentaje: 20 },
      { desde: 1, porcentaje:  0 },
    ],
  };

  /* =========================================================
     UTILIDADES
     ========================================================= */
  const fmt = (n) =>
    '$' + Math.round(n).toLocaleString('es-CO');

  function getDescuento(qty) {
    for (const d of CONFIG.DESCUENTOS) {
      if (qty >= d.desde) return d.porcentaje;
    }
    return 0;
  }

  function calcular(qty) {
    const desc    = getDescuento(qty);
    const unitario = CONFIG.PRECIO_BASE * (1 - desc / 100);
    const total    = unitario * qty;
    return { descuento: desc, unitario, total };
  }

  /* =========================================================
     REFERENCIAS DOM
     ========================================================= */
  const overlay      = document.getElementById('modal-compra');
  const panel        = overlay?.querySelector('.modal-panel');
  const btnCerrar    = document.getElementById('modal-cerrar');
  const qtyInput     = document.getElementById('qty-input');
  const btnMas       = document.getElementById('qty-mas');
  const btnMenos     = document.getElementById('qty-menos');
  const pUnit        = document.getElementById('precio-unitario');
  const pTotal       = document.getElementById('precio-total');
  const pDesc        = document.getElementById('descuento-porcentaje');
  const filaDesc     = document.getElementById('fila-descuento');
  const resumenCant  = document.getElementById('resumen-cantidad');
  const form         = document.getElementById('form-pedido');
  const btnConfirmar = document.getElementById('btn-confirmar');
  const modalExito   = document.getElementById('modal-exito');
  const formWrap     = document.getElementById('modal-form-wrap');

  if (!overlay) return;

  /* =========================================================
     ACTUALIZAR PRECIO EN MODAL
     ========================================================= */
  function actualizarPrecio() {
    const qty = parseInt(qtyInput.value, 10) || 1;
    const { descuento, unitario, total } = calcular(qty);

    pUnit.textContent           = fmt(unitario);
    pTotal.textContent          = fmt(total);
    resumenCant.textContent     = qty === 1 ? '1 unidad' : `${qty} unidades`;

    if (descuento > 0) {
      filaDesc.style.display    = 'flex';
      pDesc.textContent         = `${descuento}% OFF`;
    } else {
      filaDesc.style.display    = 'none';
    }

    // Sincronizar campos hidden
    document.getElementById('f-cantidad').value     = qty;
    document.getElementById('f-precio-unit').value  = Math.round(unitario);
    document.getElementById('f-descuento').value    = descuento;
    document.getElementById('f-total').value        = Math.round(total);
  }

  /* =========================================================
     ABRIR / CERRAR MODAL
     ========================================================= */
  function abrirModal() {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Focus al primer campo
    setTimeout(() => {
      const primerCampo = form?.querySelector('input:not([type=hidden])');
      primerCampo?.focus();
    }, 350);
  }

  function cerrarModal() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Botones "Comprar" / "abrir-modal"
  document.addEventListener('click', (e) => {
    if (e.target.closest('.abrir-modal')) {
      e.preventDefault();
      formWrap.style.display = '';
      modalExito.classList.remove('is-visible');
      actualizarPrecio();
      abrirModal();
    }
  });

  btnCerrar?.addEventListener('click', cerrarModal);

  // Cerrar al hacer clic fuera del panel
  overlay.addEventListener('click', (e) => {
    if (!panel.contains(e.target)) cerrarModal();
  });

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) cerrarModal();
  });

  /* =========================================================
     CONTROLES DE CANTIDAD
     ========================================================= */
  btnMas?.addEventListener('click', () => {
    qtyInput.value = Math.min(20, (parseInt(qtyInput.value) || 1) + 1);
    actualizarPrecio();
  });

  btnMenos?.addEventListener('click', () => {
    qtyInput.value = Math.max(1, (parseInt(qtyInput.value) || 1) - 1);
    actualizarPrecio();
  });

  qtyInput?.addEventListener('input', () => {
    let v = parseInt(qtyInput.value) || 1;
    if (v < 1) v = 1;
    if (v > 20) v = 20;
    qtyInput.value = v;
    actualizarPrecio();
  });

  /* =========================================================
     SUBMIT — Google Sheets + WhatsApp
     ========================================================= */
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validación básica
    const requeridos = form.querySelectorAll('[required]');
    let valido = true;
    requeridos.forEach((campo) => {
      if (!campo.value.trim()) {
        campo.style.borderColor = '#e53e3e';
        valido = false;
      } else {
        campo.style.borderColor = '';
      }
    });
    if (!valido) {
      const primero = form.querySelector('[required]:invalid, [required][style*="e53e3e"]');
      primero?.focus();
      return;
    }

    btnConfirmar.disabled = true;
    btnConfirmar.textContent = 'Enviando…';

    // Recoger datos del formulario
    const datos = {
      producto:       document.getElementById('f-producto').value,
      cantidad:       document.getElementById('f-cantidad').value,
      precio_unitario: document.getElementById('f-precio-unit').value,
      descuento:      document.getElementById('f-descuento').value,
      total:          document.getElementById('f-total').value,
      nombre:         document.getElementById('f-nombre').value.trim(),
      telefono:       document.getElementById('f-telefono').value.trim(),
      email:          document.getElementById('f-email').value.trim(),
      ciudad:         document.getElementById('f-ciudad').value.trim(),
      departamento:   document.getElementById('f-departamento').value.trim(),
      direccion:      document.getElementById('f-direccion').value.trim(),
      fecha:          new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
    };

    // 1. Enviar a Google Sheets (no bloquea el flujo si falla)
    if (CONFIG.SHEETS_URL && CONFIG.SHEETS_URL !== 'TU_URL_APPS_SCRIPT_AQUI') {
      try {
        await fetch(CONFIG.SHEETS_URL, {
          method:  'POST',
          mode:    'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(datos),
        });
      } catch (err) {
        console.warn('Google Sheets no disponible:', err);
      }
    }

    // 2. Construir mensaje de WhatsApp
    const descLine = datos.descuento > 0
      ? `🏷️ Descuento aplicado: *${datos.descuento}%*\n`
      : '';

    const mensaje = [
      `🛒 *NUEVO PEDIDO — EcomendaStore*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `📦 Producto: *${datos.producto}*`,
      `🔢 Cantidad: *${datos.cantidad} unidad${datos.cantidad > 1 ? 'es' : ''}*`,
      `💰 Precio unitario: *${fmt(datos.precio_unitario)}*`,
      descLine,
      `💳 *TOTAL A PAGAR: ${fmt(datos.total)} COP*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `👤 Nombre: ${datos.nombre}`,
      `📱 Teléfono: ${datos.telefono}`,
      `📧 Email: ${datos.email}`,
      `🏙️ Ciudad: ${datos.ciudad}${datos.departamento ? ', ' + datos.departamento : ''}`,
      `🏠 Dirección: ${datos.direccion}`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `✅ Por favor confirma mi pedido. ¡Gracias!`,
    ].filter(Boolean).join('\n');

    const waUrl = `https://wa.me/${CONFIG.WA_NUMERO}?text=${encodeURIComponent(mensaje)}`;

    // Mostrar estado de éxito
    formWrap.style.display = 'none';
    modalExito.classList.add('is-visible');

    // Abrir WhatsApp después de 800ms
    setTimeout(() => {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }, 800);
  });

})();
