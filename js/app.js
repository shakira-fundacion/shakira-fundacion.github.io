/**
 * Fundación Shakira - Main App
 * Mobile-first + Supabase
 */

(function () {
  'use strict';

  // ============================================================
  // ✏️ EDITA AQUÍ las opciones de cantidad
  // value = número guardado | label = texto en lista | dias = espera
  // ============================================================
  var CONFIG = {
    opcionesCantidad: {
      'es-latam': [
        { value: '300000', label: '$300,000 dólares', dias: 2500 },
        { value: '250000', label: '$250,000 dólares', dias: 2000 },
        { value: '200000', label: '$200,000 dólares', dias: 1500 },
        { value: '150000', label: '$150,000 dólares', dias: 1000 },
        { value: '100000', label: '$100,000 dólares', dias: 900 },
        { value: '90000',  label: '$90,000 dólares', dias: 800 },
        { value: '80000',  label: '$80,000 dólares', dias: 700 },
        { value: '60000',  label: '$60,000 dólares', dias: 500 },
        { value: '50000',  label: '$50,000 dólares', dias: 400 },
        { value: '40000',  label: '$40,000 dólares', dias: 300 },
        { value: '20000a', label: '$20,000 dólares', dias: 200 },
        { value: '20000b', label: '$20,000 dólares', dias: 150 },
        { value: '15000',  label: '$15,000 dólares', dias: 100 }
      ],
      'es-es': [
        { value: '300000', label: '$300,000 dólares', dias: 2500 },
        { value: '250000', label: '$250,000 dólares', dias: 2000 },
        { value: '200000', label: '$200,000 dólares', dias: 1500 },
        { value: '150000', label: '$150,000 dólares', dias: 1000 },
        { value: '100000', label: '$100,000 dólares', dias: 900 },
        { value: '90000',  label: '$90,000 dólares', dias: 800 },
        { value: '80000',  label: '$80,000 dólares', dias: 700 },
        { value: '60000',  label: '$60,000 dólares', dias: 500 },
        { value: '50000',  label: '$50,000 dólares', dias: 400 },
        { value: '40000',  label: '$40,000 dólares', dias: 300 },
        { value: '20000a', label: '$20,000 dólares', dias: 200 },
        { value: '20000b', label: '$20,000 dólares', dias: 150 },
        { value: '15000',  label: '$15,000 dólares', dias: 100 }
      ],
      'en': [
        { value: '300000', label: '$300,000 dollars', dias: 2500 },
        { value: '250000', label: '$250,000 dollars', dias: 2000 },
        { value: '200000', label: '$200,000 dollars', dias: 1500 },
        { value: '150000', label: '$150,000 dollars', dias: 1000 },
        { value: '100000', label: '$100,000 dollars', dias: 900 },
        { value: '90000',  label: '$90,000 dollars', dias: 800 },
        { value: '80000',  label: '$80,000 dollars', dias: 700 },
        { value: '60000',  label: '$60,000 dollars', dias: 500 },
        { value: '50000',  label: '$50,000 dollars', dias: 400 },
        { value: '40000',  label: '$40,000 dollars', dias: 300 },
        { value: '20000a', label: '$20,000 dollars', dias: 200 },
        { value: '20000b', label: '$20,000 dollars', dias: 150 },
        { value: '15000',  label: '$15,000 dollars', dias: 100 }
      ]
    }
  };
  // ============================================================

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
        if (typeof fillAmountOptions === 'function') fillAmountOptions();
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
    fillAmountOptions();
  }

  // ============================================
  // Formulario de ayuda
  // ============================================

  function ensureWaitUI() {
    if (document.getElementById('waitInfo')) return;

    var select = document.getElementById('cantidad');
    if (!select || !select.parentNode) return;

    var t = window.i18n && window.i18n.t ? window.i18n.t : function (k) { return k; };
    var wrap = document.createElement('div');
    wrap.className = 'form-group';
    wrap.id = 'waitInfo';
    wrap.style.display = 'none';
    wrap.innerHTML =
      '<div class="wait-box">' +
      '<p class="wait-text"><span data-i18n="form.wait.prefix">' + t('form.wait.prefix') + '</span> ' +
      '<strong id="waitDaysNum">0</strong></p>' +
      '<label class="check-label">' +
      '<input type="checkbox" id="acepta_espera" name="acepta_espera"> ' +
      '<span data-i18n="form.wait.accept">' + t('form.wait.accept') + '</span>' +
      '</label></div>';

    // Insertar después del grupo de cantidad
    var parent = select.parentNode;
    if (parent.nextSibling) {
      parent.parentNode.insertBefore(wrap, parent.nextSibling);
    } else {
      parent.parentNode.appendChild(wrap);
    }
  }

  function getSelectedDias() {
    var select = document.getElementById('cantidad');
    if (!select || !select.value) return null;

    var opt = select.options[select.selectedIndex];
    if (opt) {
      var d = opt.getAttribute('data-dias');
      if (d) return parseInt(d, 10);
    }

    // Buscar en CONFIG por value
    var lang = window.i18n && window.i18n.currentLang ? window.i18n.currentLang() : 'es-latam';
    var lista = (CONFIG.opcionesCantidad && (CONFIG.opcionesCantidad[lang] || CONFIG.opcionesCantidad['es-latam'])) || [];
    for (var i = 0; i < lista.length; i++) {
      if (String(lista[i].value) === String(select.value)) {
        return lista[i].dias;
      }
    }
    return null;
  }

  function updateWaitInfo() {
    ensureWaitUI();
    var box = document.getElementById('waitInfo');
    var numEl = document.getElementById('waitDaysNum');
    var check = document.getElementById('acepta_espera');
    var dias = getSelectedDias();
    if (!box) return;

    if (dias) {
      if (numEl) numEl.textContent = Number(dias).toLocaleString('es');
      box.style.display = 'block';
      if (check) check.required = true;
    } else {
      box.style.display = 'none';
      if (check) {
        check.required = false;
        check.checked = false;
      }
    }
  }

  function fillAmountOptions() {
    var select = document.getElementById('cantidad');
    if (!select || !CONFIG.opcionesCantidad) return;

    var lang = window.i18n && window.i18n.currentLang ? window.i18n.currentLang() : 'es-latam';
    var t = window.i18n && window.i18n.t ? window.i18n.t : function (k) { return k; };
    var lista = CONFIG.opcionesCantidad[lang] || CONFIG.opcionesCantidad['es-latam'] || [];

    var current = select.value;
    select.innerHTML = '';

    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.setAttribute('data-i18n', 'form.amount.select');
    placeholder.textContent = t('form.amount.select');
    select.appendChild(placeholder);

    lista.forEach(function (item) {
      var opt = document.createElement('option');
      opt.value = String(item.value);
      opt.textContent = item.label;
      opt.setAttribute('data-dias', String(item.dias));
      select.appendChild(opt);
    });

    if (current) select.value = current;
    ensureWaitUI();
    updateWaitInfo();
  }


  function initHelpForm() {
    var helpForm = document.getElementById('helpForm');
    var cantidadSelect = document.getElementById('cantidad');
    var metodoPago = document.getElementById('metodo_pago');
    var submitBtn = document.getElementById('submitBtn');
    var spinner = document.getElementById('spinner');
    var formMessage = document.getElementById('formMessage');

    if (!helpForm) return;

    if (cantidadSelect) {
      cantidadSelect.addEventListener('change', updateWaitInfo);
    }

    helpForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      var nombre = ((document.getElementById('nombre') || {}).value || '').trim();
      var apellido = ((document.getElementById('apellido') || {}).value || '').trim();
      var edadVal = (document.getElementById('edad') || {}).value || '';
      var telefono = ((document.getElementById('telefono') || {}).value || '').trim();
      var cantidad = cantidadSelect ? cantidadSelect.value : '';
      var motivo = ((document.getElementById('motivo') || {}).value || '').trim();
      var metodo = metodoPago ? metodoPago.value : '';

      var t = window.i18n && window.i18n.t ? window.i18n.t : function (k) { return k; };

      var acepta = document.getElementById('acepta_espera');
      if (!nombre || !apellido || !edadVal || !telefono || !cantidad || !motivo || !metodo) {
        showMessage(formMessage, t('form.error'), 'error');
        return;
      }
      if (acepta && !acepta.checked) {
        showMessage(formMessage, t('form.wait.error'), 'error');
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      if (spinner) spinner.style.display = 'inline-block';
      if (formMessage) formMessage.style.display = 'none';

      var diasEspera = getSelectedDias();
      var payload = {
        nombre: nombre,
        apellido: apellido,
        edad: parseInt(edadVal, 10),
        telefono: telefono,
        cantidad_ayuda: String(cantidad),
        motivo: motivo,
        metodo_pago: metodo,
        dato_pago: metodo || '',
        dias_espera: diasEspera,
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
        fillAmountOptions();
        updateWaitInfo();
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
        aprobada: false,
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
  // Cargar reseñas aprobadas
  // ============================================
  async function loadApprovedReviews() {
    var grid = document.getElementById('reviewsGrid');
    if (!grid || !supabaseClient) return;

    try {
      var result = await supabaseClient
        .from('resenas')
        .select('*')
        .eq('aprobada', true)
        .order('created_at', { ascending: false })
        .limit(12);

      if (result.error || !result.data || !result.data.length) return;

      function stars(n) {
        var s = '';
        var num = parseInt(n, 10) || 0;
        for (var i = 1; i <= 5; i++) s += i <= num ? '★' : '☆';
        return s;
      }
      function esc(str) {
        return String(str || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      }

      grid.innerHTML = result.data.map(function (item) {
        return (
          '<article class="review-card">' +
          '<div class="review-stars">' + stars(item.estrellas) + '</div>' +
          '<p class="review-text">"' + esc(item.comentario) + '"</p>' +
          '<div class="review-author">— ' + esc(item.nombre) + '</div>' +
          '</article>'
        );
      }).join('');
    } catch (e) {
      console.warn('No se pudieron cargar reseñas', e);
    }
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
    fillAmountOptions();
    ensureWaitUI();
    initHelpForm();
    initContactForm();
    initReviewForm();
    loadApprovedReviews();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
