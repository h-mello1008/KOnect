let allMensalidades = [];
let allHistoricoPagamentos = [];
let currentFilter = 'todos';

document.addEventListener('DOMContentLoaded', function () {
  validarSessao();
  setupEventListeners();
});

async function validarSessao() {
  try {
    const response = await fetch('../../../php/valida_sessao.php', {
      credentials: 'include'
    });
    const resultado = await response.json();

    if (resultado.status === 'ok') {
      const usuarioData = resultado.data;
      const userNameElement = document.getElementById('userName');
      if (userNameElement) {
        userNameElement.textContent = usuarioData.email || 'Aluno';
      }
      loadMensalidades();
    } else {
      console.warn('Sessão inválida:', resultado);
      window.location.href = '../login_aluno/index.html';
    }
  } catch (erro) {
    console.error('Erro ao validar sessão:', erro);
    window.location.href = '../login_aluno/index.html';
  }
}

function setupEventListeners() {
  document
    .getElementById('viewMensalidadesBtn')
    ?.addEventListener('click', showMensalidadesView);
  document.getElementById('backBtn')?.addEventListener('click', showOptionsView);

  document
    .getElementById('viewHistoricoBtn')
    ?.addEventListener('click', showHistoricoView);
  document.getElementById('backBtn2')?.addEventListener('click', showOptionsView);

  document.getElementById('btnLogout')?.addEventListener('click', logout);

  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      const filter = this.dataset.filter;
      applyFilter(filter);
    });
  });

  document.getElementById('mensalidadesList').addEventListener('click', function (e) {
    const btn = e.target.closest('.btn-pagar');
    if (btn) pagarMensalidade(btn.dataset.id, btn);
  });
}

async function loadMensalidades() {
  try {
    const response = await fetch('../../../php/aluno/mensalidade_get.php', {
      credentials: 'include'
    });
    const resultado = await response.json();

    if (resultado.status === 'ok') {
      allMensalidades = resultado.data || [];
      renderMensalidades();
      updateSummary();
    } else {
      console.warn('Nenhuma mensalidade encontrada:', resultado.mensagem);
      allMensalidades = [];
    }
  } catch (erro) {
    console.error('Erro ao carregar mensalidades:', erro);
    showEmptyState(
      'Erro ao carregar mensalidades',
      'Tente recarregar a página'
    );
  }
}

function renderMensalidades() {
  const container = document.getElementById('mensalidadesList');

  let filtered = allMensalidades;
  if (currentFilter !== 'todos') {
    filtered = allMensalidades.filter(
      (m) => m.status_pagamento === currentFilter
    );
  }

  if (filtered.length === 0) {
    showEmptyState(
      'Nenhuma mensalidade encontrada',
      `Nenhuma mensalidade ${currentFilter !== 'todos' ? 'com status ' + currentFilter : 'cadastrada'}.`
    );
    return;
  }

  container.innerHTML = filtered
    .map((mensalidade) => createMensalidadeCard(mensalidade))
    .join('');
}

function createMensalidadeCard(mensalidade) {
  const status = mensalidade.status_pagamento.toLowerCase();
  const valor = parseFloat(mensalidade.valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const dataVencimento = new Date(
    mensalidade.dataVencimento
  ).toLocaleDateString('pt-BR');
  const mesReferencia = mensalidade.mes_referencia
    ? new Date(mensalidade.mes_referencia + '-01').toLocaleDateString(
        'pt-BR',
        { month: 'long', year: 'numeric' }
      )
    : 'N/A';

  let diasTexto = '';
  if (mensalidade.dias_vencimento !== undefined) {
    const dias = mensalidade.dias_vencimento;
    if (dias === 0) {
      diasTexto = 'Vence hoje!';
    } else if (dias > 0) {
      diasTexto = `${dias} ${dias === 1 ? 'dia' : 'dias'} vencido`;
    } else {
      diasTexto = `${Math.abs(dias)} ${Math.abs(dias) === 1 ? 'dia' : 'dias'} para vencer`;
    }
  }

  const statusBadgeClass = `status-badge ${status}`;
  const statusDisplay = {
    vencido: '⛔ Vencido',
    pendente: '⏰ Pendente',
    pago: '✓ Pago',
  }[status] || status;

  return `
    <div class="mensalidade-card ${status}">
      <div class="mensalidade-info">
        <div class="d-flex align-items-center gap-2 mb-2">
          <span class="${statusBadgeClass}">${statusDisplay}</span>
          <div class="mensalidade-mes">${mesReferencia}</div>
        </div>
        <div class="mensalidade-academia">
          ${mensalidade.academia_nome || 'Academia'} •
          ${mensalidade.modalidade_tipo || 'Modalidade'}
        </div>
        <div class="mensalidade-details">
          <span>📅 Vencimento: ${dataVencimento}</span>
          <span>${diasTexto}</span>
        </div>
      </div>
      <div class="d-flex align-items-center gap-2">
        <div class="mensalidade-valor">${valor}</div>
        ${
          status === 'vencido' || status === 'pendente'
            ? `<button class="btn btn-danger btn-sm btn-pagar" data-id="${mensalidade.id}"><i class="bi bi-credit-card me-1"></i>Pagar</button>`
            : ''
        }
      </div>
    </div>
  `;
}

function updateSummary() {
  const vencidas = allMensalidades
    .filter((m) => m.status_pagamento === 'Vencido')
    .reduce((sum, m) => sum + parseFloat(m.valor || 0), 0);

  const pendentes = allMensalidades
    .filter((m) => m.status_pagamento === 'Pendente')
    .reduce((sum, m) => sum + parseFloat(m.valor || 0), 0);

  const pagas = allMensalidades
    .filter((m) => m.status_pagamento === 'Pago')
    .reduce((sum, m) => sum + parseFloat(m.valor || 0), 0);

  const total = vencidas + pendentes + pagas;

  document.getElementById('totalVencidas').textContent = vencidas.toLocaleString(
    'pt-BR',
    { style: 'currency', currency: 'BRL' }
  );
  document.getElementById('totalPendentes').textContent = pendentes.toLocaleString(
    'pt-BR',
    { style: 'currency', currency: 'BRL' }
  );
  document.getElementById('totalPagas').textContent = pagas.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  document.getElementById('totalGeral').textContent = total.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function applyFilter(filter) {
  currentFilter = filter;

  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.classList.remove('active');
  });
  document
    .querySelector(`[data-filter="${filter}"]`)
    ?.classList.add('active');

  renderMensalidades();
}

function showEmptyState(title, message) {
  const container = document.getElementById('mensalidadesList');
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">📭</div>
      <h5>${title}</h5>
      <p>${message}</p>
    </div>
  `;
}

function showMensalidadesView() {
  document.getElementById('optionsView').classList.add('d-none');
  document.getElementById('mensalidadesView').classList.remove('d-none');
  document.getElementById('historicoView').classList.add('d-none');
}

function showHistoricoView() {
  document.getElementById('optionsView').classList.add('d-none');
  document.getElementById('mensalidadesView').classList.add('d-none');
  document.getElementById('historicoView').classList.remove('d-none');
  loadHistoricoPagamentos();
}

function showOptionsView() {
  document.getElementById('optionsView').classList.remove('d-none');
  document.getElementById('mensalidadesView').classList.add('d-none');
  document.getElementById('historicoView').classList.add('d-none');
  currentFilter = 'todos';
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.classList.remove('active');
  });
  document.querySelector('[data-filter="todos"]')?.classList.add('active');
}

async function loadHistoricoPagamentos() {
  try {
    const response = await fetch(
      '../../../php/aluno/mensalidade_historico_pago.php',
      {
        credentials: 'include'
      }
    );
    const resultado = await response.json();

    if (resultado.status === 'ok') {
      allHistoricoPagamentos = resultado.data || [];
      renderHistoricoPagamentos();
      updateHistoricoSummary();
    } else {
      console.warn('Nenhum pagamento encontrado:', resultado.mensagem);
      allHistoricoPagamentos = [];
      renderHistoricoPagamentos();
    }
  } catch (erro) {
    console.error('Erro ao carregar histórico de pagamentos:', erro);
    showEmptyStateHistorico(
      'Erro ao carregar histórico',
      'Tente recarregar a página'
    );
  }
}

function renderHistoricoPagamentos() {
  const container = document.getElementById('historicoList');

  if (allHistoricoPagamentos.length === 0) {
    showEmptyStateHistorico(
      'Nenhum pagamento realizado',
      'Você ainda não realizou nenhum pagamento.'
    );
    return;
  }

  container.innerHTML = allHistoricoPagamentos
    .map((pagamento) => createPagamentoCard(pagamento))
    .join('');
}

function createPagamentoCard(pagamento) {
  const valor = parseFloat(pagamento.valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const dataVencimento = new Date(
    pagamento.dataVencimento
  ).toLocaleDateString('pt-BR');
  const dataPagamento = new Date(pagamento.data_pagamento).toLocaleDateString(
    'pt-BR'
  );
  const mesReferencia = pagamento.mes_referencia
    ? new Date(pagamento.mes_referencia + '-01').toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      })
    : 'N/A';

  const diasInfo = pagamento.dias_antecipacao_display || '-';
  const statusColor =
    pagamento.dias_antecipacao < 0
      ? 'text-success'
      : pagamento.dias_antecipacao > 0
        ? 'text-warning'
        : 'text-info';

  return `
    <div class="mensalidade-card pago">
      <div class="mensalidade-info">
        <div class="d-flex align-items-center gap-2 mb-2">
          <span class="status-badge pago">✓ Pago</span>
          <div class="mensalidade-mes">${mesReferencia}</div>
        </div>
        <div class="mensalidade-academia">
          ${pagamento.academia_nome || 'Academia'} •
          ${pagamento.modalidade_tipo || 'Modalidade'}
        </div>
        <div class="mensalidade-details">
          <span>📅 Vencimento: ${dataVencimento}</span>
          <span class="${statusColor}">💳 Pagamento: ${dataPagamento}</span>
          <span>${diasInfo}</span>
        </div>
      </div>
      <div class="mensalidade-valor">${valor}</div>
    </div>
  `;
}

function updateHistoricoSummary() {
  const totalPago = allHistoricoPagamentos.reduce(
    (sum, p) => sum + parseFloat(p.valor || 0),
    0
  );

  const ultimoPagamento =
    allHistoricoPagamentos.length > 0
      ? new Date(allHistoricoPagamentos[0].data_pagamento).toLocaleDateString(
          'pt-BR'
        )
      : '-';

  document.getElementById('totalPagoGeral').textContent = totalPago.toLocaleString(
    'pt-BR',
    { style: 'currency', currency: 'BRL' }
  );
  document.getElementById('ultimoPagamento').textContent = ultimoPagamento;
  document.getElementById('totalPagamentos').textContent =
    allHistoricoPagamentos.length;
}

function showEmptyStateHistorico(title, message) {
  const container = document.getElementById('historicoList');
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">📭</div>
      <h5>${title}</h5>
      <p>${message}</p>
    </div>
  `;
}

async function pagarMensalidade(id, btn) {
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Processando...';

  try {
    const formData = new FormData();
    formData.append('id', id);

    const response = await fetch('../../../php/aluno/mensalidade_pagar.php', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    const resultado = await response.json();

    if (resultado.status === 'ok') {
      await loadMensalidades();
    } else {
      alert('Erro: ' + resultado.mensagem);
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-credit-card me-1"></i>Pagar';
    }
  } catch (erro) {
    alert('Erro de conexão ao processar pagamento.');
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-credit-card me-1"></i>Pagar';
  }
}

function logout() {
  localStorage.removeItem('aluno_logado');
  localStorage.removeItem('userCourse');
  localStorage.removeItem('userProgress');
  window.location.href = '../../../index.html';
}
