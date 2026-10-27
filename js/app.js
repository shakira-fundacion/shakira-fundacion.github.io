/**
 * Fundación Shakira - Main App
 * Mobile-first + Supabase
 */

(function () {
  'use strict';

  // ============================================
  // CONFIGURACIÓN SUPABASE
  // Reemplaza con tus valores de Supabase → Settings → API
  // ============================================
  const SUPABASE_URL = 'https://rxhhvgvxabqcacdrywqu.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4aGh2Z3Z4YWJxY2FjZHJ5d3F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxNDA0NjEsImV4cCI6MjEwODcxNjQ2MX0.L7NF4HWndqw9NHP9Od1p2NPgSgNUFGLbkrvp6m2uK30';

  let supabaseClient = null;

  function initSupabase() {
    try {
      if (
        SUPABASE_URL &&
        !SUPABASE_URL.includes('TU_PROYECTO') &&
        SUPABASE_ANON_KEY &&
        !SUPABASE_ANON_KEY.includes('TU_ANON') &&
        window.supabase &&
        typeof window.supabase.createClient === 'function'
      ) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      } else {
        console.warn('Supabase no configurado. Modo simulación activo. Edita js/app.js');
      }
    } catch (e) {
      console.warn('Error al iniciar Supabase:', e);
    }
  }

  // ============================================
  // UI helpers
  // ============================================
  function showMessage(el, text, type) {
    if (!el) return;
    el.textContent = text;
    el.className = 'form-message ' + type;
    el.style.display = 'block';
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ============================================
  // Menú hamburguesa
  // ============================================
  function initMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    if (!menuToggle || !navMenu) return;

    function closeMenu() {
      menuToggle.classList.remove('active');
      navMenu.classList.remove('open');
      document.body.classList.remove('menu-open');
    }

    function openMenu() {
      menuToggle.classList.add('active');
      navMenu.classList.add('open');
      document.body.classList.add('menu-open');
    }

    menuToggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (navMenu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Cerrar al hacer clic en un link
    navMenu.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', function (e) {
      if (
        navMenu.classList.contains('open') &&
        !navMenu.contains(e.target) &&
        !menuToggle.contains(e.target)
      ) {
        closeMenu();
      }
    });

    // Cerrar con Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  // ============================================
  // Cambio de idioma
  // ============================================
  function initLanguage() {
    const langBtn = document.getElementById('langBtn');
    const langDropdown = document.getElementById('langDropdown');
    if (!langBtn || !langDropdown) return;

    langBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      langDropdown.classList.toggle('open');
    });

    langDropdown.querySelectorAll('.lang-option').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const lang = btn.getAttribute('data-lang');
        if (window.i18n && typeof window.i18n.setLanguage === 'function') {
          window.i18n.setLanguage(lang);
        }
        langDropdown.classList.remove('open');
      });
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', function (e) {
      if (
        langDropdown.classList.contains('open') &&
        !langDropdown.contains(e.target) &&
        !langBtn.contains(e.target)
      ) {
        langDropdown.classList.remove('open');
      }
    });

    // Aplicar idioma guardado
    if (window.i18n && typeof window.i18n.setLanguage === 'function') {
      var saved = window.i18n.currentLang ? window.i18n.currentLang() : 'es-latam';
      window.i18n.setLanguage(saved);
    }
  }

  // ============================================
  // Formulario de ayuda
  // ============================================
  function initHelpForm() {
    var helpForm = document.getElementById('helpForm');
    var cantidadSelect = document.getElementById('cantidad');
    var otraCantidadGroup = document.getElementById('otraCantidadGroup');
    var metodoPago = document.getElementById('metodo_pago');
    var datoPagoGroup = document.getElementById('datoPagoGroup');
    var datoPago = document.getElementById('dato_pago');
    var datoPagoLabel = document.getElementById('datoPagoLabel');
    var submitBtn = document.getElementById('submitBtn');
    var spinner = document.getElementById('spinner');
    var formMessage = document.getElementById('formMessage');

    if (!helpForm) return;

    if (cantidadSelect && otraCantidadGroup) {
      cantidadSelect.addEventListener('change', function () {
        if (cantidadSelect.value === 'otro') {
          otraCantidadGroup.style.display = 'block';
          var otra = document.getElementById('otra_cantidad');
          if (otra) otra.required = true;
        } else {
          otraCantidadGroup.style.display = 'none';
          var otra = document.getElementById('otra_cantidad');
          if (otra) otra.required = false;
        }
      });
    }

    // Método de recepción: PayPal / Zelle / Western Union
    function updatePaymentDetail() {
      var t = window.i18n && window.i18n.t ? window.i18n.t : function (k) { return k; };
      var method = metodoPago ? metodoPago.value : '';

      if (!method) {
        if (datoPagoGroup) datoPagoGroup.style.display = 'none';
        if (datoPago) {
          datoPago.required = false;
          datoPago.value = '';
        }
        return;
      }

      if (datoPagoGroup) datoPagoGroup.style.display = 'block';
      if (datoPago) datoPago.required = true;

      var labelKey = 'form.payment.' + method;
      var placeholderKey = 'form.payment.placeholder.' + method;

      if (datoPagoLabel) datoPagoLabel.textContent = t(labelKey);
      if (datoPago) datoPago.placeholder = t(placeholderKey);
    }

    if (metodoPago) {
      metodoPago.addEventListener('change', updatePaymentDetail);
    }

    helpForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      var nombre = (document.getElementById('nombre') || {}).value || '';
      var apellido = (document.getElementById('apellido') || {}).value || '';
      var edadVal = (document.getElementById('edad') || {}).value || '';
      var telefono = (document.getElementById('telefono') || {}).value || '';
      var cantidad = cantidadSelect ? cantidadSelect.value : '';
      var motivo = (document.getElementById('motivo') || {}).value || '';
      var metodo = metodoPago ? metodoPago.value : '';
      var dato = datoPago ? (datoPago.value || '').trim() : '';

      nombre = nombre.trim();
      apellido = apellido.trim();
      telefono = telefono.trim();
      motivo = motivo.trim();

      if (cantidad === 'otro') {
        cantidad = (document.getElementById('otra_cantidad') || {}).value || '';
      }

      var t = window.i18n && window.i18n.t ? window.i18n.t : function (k) { return k; };

      if (!nombre || !apellido || !edadVal || !telefono || !cantidad || !motivo || !metodo || !dato) {
        showMessage(formMessage, t('form.error'), 'error');
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      if (spinner) spinner.style.display = 'inline-block';
      if (formMessage) formMessage.style.display = 'none';

      var payload = {
        nombre: nombre,
        apellido: apellido,
        edad: parseInt(edadVal, 10),
        telefono: telefono,
        cantidad_ayuda: String(cantidad),
        motivo: motivo,
        metodo_pago: metodo,
        dato_pago: dato,
        idioma: window.i18n && window.i18n.currentLang ? window.i18n.currentLang() : 'es-latam',
        created_at: new Date().toISOString()
      };

      try {
        if (supabaseClient) {
          var result = await supabaseClient.from('solicitudes').insert([payload]);
          if (result.error) throw result.error;
        } else {
          console.log('Solicitud simulada:', payload);
          await new Promise(function (r) { setTimeout(r, 700); });
        }
        showMessage(formMessage, t('form.success'), 'success');
        helpForm.reset();
        if (otraCantidadGroup) otraCantidadGroup.style.display = 'none';
        if (datoPagoGroup) datoPagoGroup.style.display = 'none';
      } catch (err) {
        console.error(err);
        showMessage(formMessage, t('form.error'), 'error');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (spinner) spinner.style.display = 'none';
      }
    });
  }

  // ============================================
  // Formulario de contacto
  // ============================================
  function initContactForm() {
    var contactForm = document.getElementById('contactForm');
    var contactMessage = document.getElementById('contactMessage');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      var nombre = ((document.getElementById('contact_nombre') || {}).value || '').trim();
      var mensaje = ((document.getElementById('contact_mensaje') || {}).value || '').trim();
      var t = window.i18n && window.i18n.t ? window.i18n.t : function (k) { return k; };

      if (!nombre || !mensaje) return;

      var payload = {
        nombre: nombre,
        mensaje: mensaje,
        tipo: 'contacto_agente',
        idioma: window.i18n && window.i18n.currentLang ? window.i18n.currentLang() : 'es-latam',
        created_at: new Date().toISOString()
      };

      try {
        if (supabaseClient) {
          var result = await supabaseClient.from('mensajes').insert([payload]);
          if (result.error) throw result.error;
        } else {
          console.log('Mensaje simulado:', payload);
          await new Promise(function (r) { setTimeout(r, 600); });
        }
        showMessage(contactMessage, t('contact.success'), 'success');
        contactForm.reset();
      } catch (err) {
        console.error(err);
        showMessage(contactMessage, t('contact.error'), 'error');
      }
    });
  }

  // ============================================
  // Formulario de reseñas
  // ============================================
  function initReviewForm() {
    var reviewForm = document.getElementById('reviewForm');
    var reviewMessage = document.getElementById('reviewMessage');
    if (!reviewForm) return;

    reviewForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      var nombre = ((document.getElementById('review_nombre') || {}).value || '').trim();
      var estrellas = (document.getElementById('review_estrellas') || {}).value || '5';
      var comentario = ((document.getElementById('review_comentario') || {}).value || '').trim();
      var t = window.i18n && window.i18n.t ? window.i18n.t : function (k) { return k; };

      if (!nombre || !comentario) {
        showMessage(reviewMessage, t('reviews.form.error'), 'error');
        return;
      }

      var payload = {
        nombre: nombre,
        estrellas: parseInt(estrellas, 10),
        comentario: comentario,
        idioma: window.i18n && window.i18n.currentLang ? window.i18n.currentLang() : 'es-latam',
        created_at: new Date().toISOString()
      };

      try {
        if (supabaseClient) {
          var result = await supabaseClient.from('resenas').insert([payload]);
          if (result.error) throw result.error;
        } else {
          console.log('Reseña simulada:', payload);
          await new Promise(function (r) { setTimeout(r, 600); });
        }
        showMessage(reviewMessage, t('reviews.form.success'), 'success');
        reviewForm.reset();
      } catch (err) {
        console.error(err);
        showMessage(reviewMessage, t('reviews.form.error'), 'error');
      }
    });
  }

  // ============================================
  // Año en footer
  // ============================================
  function initYear() {
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  // ============================================
  // Inicio
  // ============================================
  function start() {
    initSupabase();
    initMenu();
    initLanguage();
    initHelpForm();
    initContactForm();
    initReviewForm();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
