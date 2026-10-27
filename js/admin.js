/**
 * Panel Admin - Fundación Shakira
 *
 * 1. Cambia ADMIN_PASSWORD por tu contraseña
 * 2. Configura SUPABASE_URL y SUPABASE_ANON_KEY (igual que en app.js)
 * 3. En Supabase, permite SELECT a las tablas para anon o usa service role con cuidado
 */
(function () {
  'use strict';

  // ========== CONFIGURA AQUÍ ==========
  var ADMIN_PASSWORD = 'shakira2026'; // ← Cambia esta contraseña

  var SUPABASE_URL = 'https://rxhhvgvxabqcacdrywqu.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4aGh2Z3Z4YWJxY2FjZHJ5d3F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxNDA0NjEsImV4cCI6MjEwODcxNjQ2MX0.L7NF4HWndqw9NHP9Od1p2NPgSgNUFGLbkrvp6m2uK30';
  // ====================================

  var supabaseClient = null;
  var allSolicitudes = [];
  var allResenas = [];
  var allMensajes = [];

  function initSupabase() {
    try {
      if (
        SUPABASE_URL &&
        !SUPABASE_URL.includes('TU_PROYECTO') &&
        SUPABASE_ANON_KEY &&
        !SUPABASE_ANON_KEY.includes('TU_ANON') &&
        window.supabase &&
        window.supabase.createClient
      ) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return true;
      }
    } catch (e) {
      console.warn(e);
    }
    return false;
  }

  function formatDate(iso) {
    if (!iso) return '';
    try {
      var d = new Date(iso);
      return d.toLocaleDateString('es', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return iso;
    }
  }

  function metodoLabel(m) {
    var map = {
      paypal: 'PayPal',
      zelle: 'Zelle',
      western_union: 'Western Union'
    };
    return map[m] || m || '—';
  }

  function stars(n) {
    var s = '';
    var num = parseInt(n, 10) || 0;
    for (var i = 1; i <= 5; i++) {
      s += i <= num ? '★' : '☆';
    }
    return s;
  }

  // ----- Login -----
  function initLogin() {
    var form = document.getElementById('loginForm');
    var passInput = document.getElementById('adminPass');
    var err = document.getElementById('loginError');

    // Auto-login si ya estaba logueado en esta sesión
    if (sessionStorage.getItem('fs_admin') === '1') {
      showDashboard();
      return;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (passInput.value === ADMIN_PASSWORD) {
        sessionStorage.setItem('fs_admin', '1');
        err.style.display = 'none';
        showDashboard();
      } else {
        err.style.display = 'block';
        passInput.value = '';
        passInput.focus();
      }
    });
  }

  function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    loadAll();
  }

  function logout() {
    sessionStorage.removeItem('fs_admin');
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminPass').value = '';
  }

  // ----- Tabs -----
  function initTabs() {
    document.querySelectorAll('.admin-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.admin-tab').forEach(function (b) {
          b.classList.remove('active');
        });
        document.querySelectorAll('.tab-panel').forEach(function (p) {
          p.classList.remove('active');
        });
        btn.classList.add('active');
        var tab = btn.getAttribute('data-tab');
        var panel = document.getElementById('tab-' + tab);
        if (panel) panel.classList.add('active');
      });
    });
  }

  // ----- Load data -----
  async function loadAll() {
    var hasSupabase = initSupabase();

    if (!hasSupabase) {
      // Datos de demostración si no hay Supabase
      renderDemoBanner();
      allSolicitudes = getDemoSolicitudes();
      allResenas = getDemoResenas();
      allMensajes = getDemoMensajes();
      renderSolicitudes(allSolicitudes);
      renderResenas(allResenas);
      renderMensajes(allMensajes);
      updateBadges();
      return;
    }

    try {
      var s = await supabaseClient
        .from('solicitudes')
        .select('*')
        .order('created_at', { ascending: false });

      var r = await supabaseClient
        .from('resenas')
        .select('*')
        .order('created_at', { ascending: false });

      var m = await supabaseClient
        .from('mensajes')
        .select('*')
        .order('created_at', { ascending: false });

      allSolicitudes = s.data || [];
      allResenas = r.data || [];
      allMensajes = m.data || [];

      if (s.error) console.warn('solicitudes:', s.error);
      if (r.error) console.warn('resenas:', r.error);
      if (m.error) console.warn('mensajes:', m.error);
    } catch (e) {
      console.error(e);
      allSolicitudes = [];
      allResenas = [];
      allMensajes = [];
    }

    renderSolicitudes(allSolicitudes);
    renderResenas(allResenas);
    renderMensajes(allMensajes);
    updateBadges();
  }

  function renderDemoBanner() {
    var panels = document.querySelectorAll('.tab-panel');
    panels.forEach(function (p) {
      if (p.querySelector('.demo-banner')) return;
      var b = document.createElement('div');
      b.className = 'demo-banner';
      b.innerHTML =
        '<strong>Modo demo:</strong> Configura Supabase en <code>js/admin.js</code> para ver datos reales. Ahora se muestran ejemplos.';
      var header = p.querySelector('.panel-header');
      if (header && header.nextSibling) {
        p.insertBefore(b, header.nextSibling);
      } else {
        p.appendChild(b);
      }
    });
  }

  function getDemoSolicitudes() {
    return [
      {
        id: 1,
        nombre: 'María',
        apellido: 'García',
        edad: 34,
        telefono: '+57 300 111 2222',
        cantidad_ayuda: '100',
        motivo: 'Necesito ayuda para medicamentos de mi hijo.',
        metodo_pago: 'paypal',
        dato_pago: 'maria@email.com',
        idioma: 'es-latam',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        nombre: 'Carlos',
        apellido: 'López',
        edad: 45,
        telefono: '+1 555 987 6543',
        cantidad_ayuda: '200',
        motivo: 'Perdí el trabajo y necesito apoyo para el alquiler este mes.',
        metodo_pago: 'zelle',
        dato_pago: '+15559876543',
        idioma: 'es-latam',
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];
  }

  function getDemoResenas() {
    return [
      {
        id: 1,
        nombre: 'Ana R.',
        estrellas: 5,
        comentario: 'Me ayudaron cuando más lo necesitaba. Muy agradecida.',
        created_at: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: 2,
        nombre: 'Pedro M.',
        estrellas: 4,
        comentario: 'Proceso sencillo y gente muy amable. Gracias.',
        created_at: new Date(Date.now() - 432000000).toISOString()
      }
    ];
  }

  function getDemoMensajes() {
    return [
      {
        id: 1,
        nombre: 'Lucía',
        mensaje: 'Quisiera saber si pueden ayudarme con alimentos.',
        created_at: new Date(Date.now() - 3600000).toISOString()
      }
    ];
  }

  function updateBadges() {
    var bs = document.getElementById('badgeSolicitudes');
    var br = document.getElementById('badgeResenas');
    var bm = document.getElementById('badgeMensajes');
    if (bs) bs.textContent = allSolicitudes.length;
    if (br) br.textContent = allResenas.length;
    if (bm) bm.textContent = allMensajes.length;
  }

  function renderSolicitudes(list) {
    var el = document.getElementById('solicitudesList');
    if (!el) return;

    if (!list.length) {
      el.innerHTML = '<div class="empty-state">No hay solicitudes todavía</div>';
      return;
    }

    el.innerHTML = list
      .map(function (item) {
        return (
          '<article class="admin-card">' +
          '<div class="admin-card-header">' +
          '<strong>' +
          escapeHtml(item.nombre) +
          ' ' +
          escapeHtml(item.apellido) +
          '</strong>' +
          '<span class="admin-card-date">' +
          formatDate(item.created_at) +
          '</span>' +
          '</div>' +
          '<div class="admin-card-row">' +
          '<span><b>Edad:</b> ' +
          escapeHtml(String(item.edad)) +
          '</span>' +
          '<span><b>Tel:</b> ' +
          escapeHtml(item.telefono) +
          '</span>' +
          '<span><b>Monto:</b> $' +
          escapeHtml(String(item.cantidad_ayuda)) +
          ' USD</span>' +
          '</div>' +
          '<div class="admin-card-pago">' +
          metodoLabel(item.metodo_pago) +
          ': ' +
          escapeHtml(item.dato_pago || '—') +
          '</div>' +
          '<div class="admin-card-motivo">' +
          escapeHtml(item.motivo || '') +
          '</div>' +
          '</article>'
        );
      })
      .join('');
  }

  function renderResenas(list) {
    var el = document.getElementById('resenasList');
    if (!el) return;

    if (!list.length) {
      el.innerHTML = '<div class="empty-state">No hay reseñas todavía</div>';
      return;
    }

    el.innerHTML = list
      .map(function (item) {
        return (
          '<article class="admin-card">' +
          '<div class="admin-card-header">' +
          '<strong>' +
          escapeHtml(item.nombre) +
          '</strong>' +
          '<span class="admin-card-date">' +
          formatDate(item.created_at) +
          '</span>' +
          '</div>' +
          '<div class="admin-card-stars">' +
          stars(item.estrellas) +
          '</div>' +
          '<div class="admin-card-motivo">' +
          escapeHtml(item.comentario || '') +
          '</div>' +
          '</article>'
        );
      })
      .join('');
  }

  function renderMensajes(list) {
    var el = document.getElementById('mensajesList');
    if (!el) return;

    if (!list.length) {
      el.innerHTML = '<div class="empty-state">No hay mensajes todavía</div>';
      return;
    }

    el.innerHTML = list
      .map(function (item) {
        return (
          '<article class="admin-card">' +
          '<div class="admin-card-header">' +
          '<strong>' +
          escapeHtml(item.nombre) +
          '</strong>' +
          '<span class="admin-card-date">' +
          formatDate(item.created_at) +
          '</span>' +
          '</div>' +
          '<div class="admin-card-motivo">' +
          escapeHtml(item.mensaje || '') +
          '</div>' +
          '</article>'
        );
      })
      .join('');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Search
  function initSearch() {
    var input = document.getElementById('searchSolicitudes');
    if (!input) return;
    input.addEventListener('input', function () {
      var q = input.value.toLowerCase().trim();
      if (!q) {
        renderSolicitudes(allSolicitudes);
        return;
      }
      var filtered = allSolicitudes.filter(function (item) {
        var text = (
          (item.nombre || '') +
          ' ' +
          (item.apellido || '') +
          ' ' +
          (item.telefono || '') +
          ' ' +
          (item.motivo || '') +
          ' ' +
          (item.dato_pago || '')
        ).toLowerCase();
        return text.indexOf(q) !== -1;
      });
      renderSolicitudes(filtered);
    });
  }

  // Start
  document.addEventListener('DOMContentLoaded', function () {
    initLogin();
    initTabs();
    initSearch();

    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    var refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function () {
        loadAll();
      });
    }
  });
})();
