document.addEventListener('DOMContentLoaded', function () {
  validarSessao();
  setupHistorico();
});

async function setupHistorico() {
  const filterStatus = document.getElementById('filterStatus');
  const searchInput = document.getElementById('searchInput');
  const btnReset = document.getElementById('btnReset');

  filterStatus.addEventListener('change', renderWithFilters);
  searchInput.addEventListener('input', debounce(renderWithFilters, 300));
  btnReset.addEventListener('click', function () {
    filterStatus.value = 'all';
    searchInput.value = '';
    renderWithFilters();
  });

  
  window._mensalidadesHistorico = await fetchMensalidades();
  renderWithFilters();
}

async function fetchMensalidades() {
  try {
    const res = await fetch('../../../php/aluno/mensalidade_get.php');
    const json = await res.json();
    if (json.status === 'ok') {
      return json.data;
    }
    return [];
  } catch (e) {
    console.error('Erro ao buscar mensalidades', e);
    return [];
  }
}

function renderWithFilters() {
  const status = document.getElementById('filterStatus').value;
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const all = window._mensalidadesHistorico || [];

  let itens = all.slice();

  if (status !== 'all') {
    itens = itens.filter(i => (i.status_pagamento === status) || (i.status_display === status));
  }

  if (q) {
    itens = itens.filter(i => {
      const acad = (i.academia_nome || '').toLowerCase();
      const mod = (i.modalidade_tipo || '').toLowerCase();
      const mes = (i.mes_referencia || '').toLowerCase();
      return acad.includes(q) || mod.includes(q) || mes.includes(q);
    });
  }

  renderTabela(itens);
}

function renderTabela(itens) {
  const body = document.getElementById('historicoBody');
  if (!body) return;

  if (itens.length === 0) {
    body.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Nenhuma mensalidade encontrada</td></tr>';
    return;
  }

  const rows = itens.map(m => {
    const valor = `R$ ${Number(m.valor).toFixed(2).replace('.', ',')}`;
    const venc = formatDateNice(m.dataVencimento);
    const mes = formatarMesReferencia(m.mes_referencia);
    const dias = m.dias_vencimento > 0 ? `${m.dias_vencimento} dia${m.dias_vencimento>1?'s':''}` : (m.dias_vencimento===0? 'Vence hoje' : `${Math.abs(m.dias_vencimento)} dias`);
    const status = m.status_display || m.status_pagamento;
    const btn = `<button class="btn btn-sm btn-outline-primary" onclick="detalhar(${m.id})">Detalhes</button>`;

    return `
      <tr>
        <td>${mes}</td>
        <td>${valor}</td>
        <td>${venc}</td>
        <td>${status}</td>
        <td>${m.dias_vencimento>0 ? m.dias_vencimento : (m.dias_vencimento===0 ? '0' : ('-' + Math.abs(m.dias_vencimento)))}</td>
        <td>${escapeHtml(m.academia_nome || '')}</td>
        <td>${escapeHtml(m.modalidade_tipo || '')}</td>
        <td>${btn}</td>
      </tr>
    `;
  }).join('');

  body.innerHTML = rows;
}

function detalhar(id) {
  alert('Detalhes da mensalidade ID: ' + id + '\n(Implementar modal se desejar)');
}

function formatDateNice(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatarMesReferencia(mesReferencia) {
  if (!mesReferencia) return '';
  const parts = mesReferencia.split('-');
  if (parts.length !==2) return mesReferencia;
  const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  return `${meses[parseInt(parts[1],10)-1]} de ${parts[0]}`;
}

function debounce(fn, ms){
  let t;
  return function(...args){
    clearTimeout(t);
    t = setTimeout(()=>fn.apply(this,args), ms);
  }
}

function escapeHtml(str){
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
