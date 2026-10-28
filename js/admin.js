/**
 * Panel Admin - Fundación Shakira
 */
(function () {
  'use strict';

  var ADMIN_PASSWORD = 'shakira2026';
  var SUPABASE_URL = 'https://rxhhvgvxabqcacdrywqu.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4aGh2Z3Z4YWJxY2FjZHJ5d3F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxNDA0NjEsImV4cCI6MjEwODcxNjQ2MX0.L7NF4HWndqw9NHP9Od1p2NPgSgNUFGLbkrvp6m2uK30';

  var supabaseClient = null;
  var allSolicitudes = [];
  var allResenas = [];
  var allMensajes = [];

  function initSupabase() {
    try {
      if (window.supabase && window.supabase.createClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return true;
      }
    } catch (e) { console.warn(e); }
    return false;
  }

  function formatDate(iso) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) { return iso; }
  }

  function metodoLabel(m) {
    return ({ fedex: 'Fedex', personal: 'Personal', paypal: 'Fedex', western_union: 'Personal' })[m] || m || '—';
  }

  function stars(n) {
    var s = '', num = parseInt(n, 10) || 0;
    for (var i = 1; i <= 5; i++) s += i <= num ? '★' : '☆';
    return s;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function initLogin() {
    var form = document.getElementById('loginForm');
    var passInput = document.getElementById('adminPass');
    var err = document.getElementById('loginError');
    if (sessionStorage.getItem('fs_admin') === '1') { showDashboard(); return; }
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

  function initTabs() {
    document.querySelectorAll('.admin-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.admin-tab').forEach(function (b) { b.classList.remove('active'); });
        document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
        btn.classList.add('active');
        var panel = document.getElementById('tab-' + btn.getAttribute('data-tab'));
        if (panel) panel.classList.add('active');
      });
    });
  }

  async function loadAll() {
    if (!initSupabase()) {
      allSolicitudes = []; allResenas = []; allMensajes = [];
      renderSolicitudes([]); renderResenas([]); renderMensajes([]);
      updateBadges();
      return;
    }
    try {
      var s = await supabaseClient.from('solicitudes').select('*').order('created_at', { ascending: false });
      var r = await supabaseClient.from('resenas').select('*').order('created_at', { ascending: false });
      var m = await supabaseClient.from('mensajes').select('*').order('created_at', { ascending: false });
      allSolicitudes = s.data || [];
      allResenas = r.data || [];
      allMensajes = m.data || [];
      if (s.error) console.warn(s.error);
      if (r.error) console.warn(r.error);
      if (m.error) console.warn(m.error);
    } catch (e) {
      console.error(e);
      allSolicitudes = []; allResenas = []; allMensajes = [];
    }
    renderSolicitudes(allSolicitudes);
    renderResenas(allResenas);
    renderMensajes(allMensajes);
    updateBadges();
  }

  function updateBadges() {
    var bs = document.getElementById('badgeSolicitudes');
    var br = document.getElementById('badgeResenas');
    var bm = document.getElementById('badgeMensajes');
    if (bs) bs.textContent = allSolicitudes.length;
    if (br) br.textContent = allResenas.length;
    if (bm) bm.textContent = allMensajes.length;
  }

  async function deleteRow(table, id) {
    if (!confirm('¿Seguro que quieres borrar esto?')) return;
    if (!supabaseClient) return;
    var result = await supabaseClient.from(table).delete().eq('id', id);
    if (result.error) {
      alert('Error al borrar: ' + result.error.message + '\n\nEn Supabase SQL ejecuta:\nCREATE POLICY "delete_'+table+'" ON '+table+' FOR DELETE TO anon USING (true);');
      return;
    }
    await loadAll();
  }

  async function approveReview(id) {
    if (!supabaseClient) return;
    var result = await supabaseClient.from('resenas').update({ aprobada: true }).eq('id', id);
    if (result.error) {
      alert('Error al aprobar: ' + result.error.message + '\n\nEjecuta en SQL Editor:\nALTER TABLE resenas ADD COLUMN IF NOT EXISTS aprobada BOOLEAN DEFAULT false;\nCREATE POLICY "update_resenas" ON resenas FOR UPDATE TO anon USING (true) WITH CHECK (true);');
      return;
    }
    await loadAll();
  }

  function bindActionButtons(container) {
    container.querySelectorAll('.btn-delete').forEach(function (btn) {
      btn.addEventListener('click', function () {
        deleteRow(btn.getAttribute('data-table'), parseInt(btn.getAttribute('data-id'), 10));
      });
    });
    container.querySelectorAll('.btn-approve').forEach(function (btn) {
      btn.addEventListener('click', function () {
        approveReview(parseInt(btn.getAttribute('data-id'), 10));
      });
    });
  }

  function renderSolicitudes(list) {
    var el = document.getElementById('solicitudesList');
    if (!el) return;
    if (!list.length) { el.innerHTML = '<div class="empty-state">No hay solicitudes todavía</div>'; return; }
    el.innerHTML = list.map(function (item) {
      return '<article class="admin-card">' +
        '<div class="admin-card-header"><strong>' + escapeHtml(item.nombre) + ' ' + escapeHtml(item.apellido) + '</strong>' +
        '<span class="admin-card-date">' + formatDate(item.created_at) + '</span></div>' +
        '<div class="admin-card-row"><span><b>Edad:</b> ' + escapeHtml(String(item.edad)) + '</span>' +
        '<span><b>Tel:</b> ' + escapeHtml(item.telefono) + '</span>' +
        '<span><b>Monto:</b> $' + escapeHtml(String(item.cantidad_ayuda)) + ' USD</span></div>' +
        '<div class="admin-card-pago">' + metodoLabel(item.metodo_pago) + '</div>' +
        '<div class="admin-card-motivo">' + escapeHtml(item.motivo || '') + '</div>' +
        '<div class="admin-card-actions"><button type="button" class="btn-delete" data-table="solicitudes" data-id="' + item.id + '">Borrar</button></div>' +
        '</article>';
    }).join('');
    bindActionButtons(el);
  }

  function renderResenas(list) {
    var el = document.getElementById('resenasList');
    if (!el) return;
    if (!list.length) { el.innerHTML = '<div class="empty-state">No hay reseñas todavía</div>'; return; }
    el.innerHTML = list.map(function (item) {
      var pending = item.aprobada !== true;
      var status = pending ? '<span class="status-pending">Pendiente de aprobación</span>' : '<span class="status-ok">Publicada</span>';
      var approveBtn = pending ? '<button type="button" class="btn-approve" data-id="' + item.id + '">Aprobar y publicar</button>' : '';
      return '<article class="admin-card' + (pending ? ' admin-card-pending' : '') + '">' +
        '<div class="admin-card-header"><strong>' + escapeHtml(item.nombre) + '</strong>' +
        '<span class="admin-card-date">' + formatDate(item.created_at) + '</span></div>' +
        status +
        '<div class="admin-card-stars">' + stars(item.estrellas) + '</div>' +
        '<div class="admin-card-motivo">' + escapeHtml(item.comentario || '') + '</div>' +
        '<div class="admin-card-actions">' + approveBtn +
        '<button type="button" class="btn-delete" data-table="resenas" data-id="' + item.id + '">Borrar</button></div>' +
        '</article>';
    }).join('');
    bindActionButtons(el);
  }

  function renderMensajes(list) {
    var el = document.getElementById('mensajesList');
    if (!el) return;
    if (!list.length) { el.innerHTML = '<div class="empty-state">No hay mensajes todavía</div>'; return; }
    el.innerHTML = list.map(function (item) {
      return '<article class="admin-card">' +
        '<div class="admin-card-header"><strong>' + escapeHtml(item.nombre) + '</strong>' +
        '<span class="admin-card-date">' + formatDate(item.created_at) + '</span></div>' +
        '<div class="admin-card-motivo">' + escapeHtml(item.mensaje || '') + '</div>' +
        '<div class="admin-card-actions"><button type="button" class="btn-delete" data-table="mensajes" data-id="' + item.id + '">Borrar</button></div>' +
        '</article>';
    }).join('');
    bindActionButtons(el);
  }

  function initSearch() {
    var input = document.getElementById('searchSolicitudes');
    if (!input) return;
    input.addEventListener('input', function () {
      var q = input.value.toLowerCase().trim();
      if (!q) { renderSolicitudes(allSolicitudes); return; }
      renderSolicitudes(allSolicitudes.filter(function (item) {
        return ((item.nombre||'')+' '+(item.apellido||'')+' '+(item.telefono||'')+' '+(item.motivo||'')+' '+(item.dato_pago||'')).toLowerCase().indexOf(q) !== -1;
      }));
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initLogin();
    initTabs();
    initSearch();
    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    var refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) refreshBtn.addEventListener('click', loadAll);
  });
})();
