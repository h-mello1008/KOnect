document.addEventListener("DOMContentLoaded", function () {
  loadMensalidades();
});

async function loadMensalidades() {
  try {
    const response = await fetch('../../php/aluno/mensalidade_get.php', {
      method: 'GET'
    });

    const resultado = await response.json();

    if (resultado.status === 'ok' && resultado.data.length > 0) {
      renderMensalidades(resultado.data);
    } else {
      renderMensalidadesVazias();
    }
  } catch (erro) {
    console.error('Erro ao carregar mensalidades:', erro);
    renderErroCarregamento();
  }
}

function renderMensalidades(mensalidades) {
  const containerMensalidades = document.getElementById('containerMensalidades');

  if (!containerMensalidades) return;

  const vencidas = mensalidades.filter(m => m.dias_vencimento > 0);
  const pendentes = mensalidades.filter(m => m.dias_vencimento < 0);
  const hojePaga = mensalidades.filter(m => m.dias_vencimento === 0);

  let html = '';

  if (vencidas.length > 0) {
    html += `
      <div class="mb-4">
        <h6 class="fw-bold text-danger mb-3">
          <i class="bi bi-exclamation-circle-fill me-2"></i> Mensalidades Vencidas (${vencidas.length})
        </h6>
        <div class="row g-3">
          ${vencidas.map(m => renderCartaoMensalidade(m, 'danger')).join('')}
        </div>
      </div>
    `;
  }

  if (hojePaga.length > 0) {
    html += `
      <div class="mb-4">
        <h6 class="fw-bold text-warning mb-3">
          <i class="bi bi-clock-fill me-2"></i> Vence Hoje
        </h6>
        <div class="row g-3">
          ${hojePaga.map(m => renderCartaoMensalidade(m, 'warning')).join('')}
        </div>
      </div>
    `;
  }

  if (pendentes.length > 0) {
    html += `
      <div class="mb-4">
        <h6 class="fw-bold text-info mb-3">
          <i class="bi bi-hourglass-split me-2"></i> Mensalidades Pendentes (${pendentes.length})
        </h6>
        <div class="row g-3">
          ${pendentes.map(m => renderCartaoMensalidade(m, 'info')).join('')}
        </div>
      </div>
    `;
  }

  containerMensalidades.innerHTML = html;

  const totalVencido = vencidas.reduce((sum, m) => sum + m.valor, 0);
  const totalPendente = pendentes.reduce((sum, m) => sum + m.valor, 0);

  renderResumoMensalidades(totalVencido, totalPendente);
}

function renderCartaoMensalidade(mensalidade, tipo) {
  const data = new Date(mensalidade.dataVencimento);
  const dataFormatada = formatarData(data);

  let statusBadge = '';
  let statusTexto = '';
  let iconeStatus = '';
  let corBorda = '';

  if (mensalidade.dias_vencimento > 0) {
    const diasAtraso = mensalidade.dias_vencimento;
    statusTexto = `${diasAtraso} dia${diasAtraso !== 1 ? 's' : ''} vencido${diasAtraso !== 1 ? 's' : ''}`;
    iconeStatus = '<i class="bi bi-exclamation-triangle-fill text-danger"></i>';
    statusBadge = `<span class="badge bg-danger">${statusTexto}</span>`;
    corBorda = 'border-danger';
  } else if (mensalidade.dias_vencimento < 0) {
    const diasRestantes = Math.abs(mensalidade.dias_vencimento);
    statusTexto = `${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''} para vencer`;
    iconeStatus = '<i class="bi bi-hourglass-split text-info"></i>';
    statusBadge = `<span class="badge bg-info">${statusTexto}</span>`;
    corBorda = 'border-info';
  } else {
    statusTexto = 'Vence hoje!';
    iconeStatus = '<i class="bi bi-exclamation-circle-fill text-warning"></i>';
    statusBadge = `<span class="badge bg-warning text-dark">${statusTexto}</span>`;
    corBorda = 'border-warning';
  }

  const valorFormatado = `R$ ${mensalidade.valor.toFixed(2).replace('.', ',')}`;
  const mesReferencia = formatarMesReferencia(mensalidade.mes_referencia);

  return `
    <div class="col-md-6 col-lg-4">
      <div class="card h-100 border-2 ${corBorda} bg-dark text-light shadow-sm">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h6 class="card-title fw-bold mb-1">${mesReferencia}</h6>
              <small class="text-muted">${mensalidade.modalidade_tipo}</small>
            </div>
            ${statusBadge}
          </div>

          <div class="mb-3">
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted small">Valor:</span>
              <span class="fw-bold">${valorFormatado}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted small">Vencimento:</span>
              <span class="fw-bold">${dataFormatada}</span>
            </div>
            <div class="d-flex justify-content-between">
              <span class="text-muted small">Academia:</span>
              <span class="small">${mensalidade.academia_nome}</span>
            </div>
          </div>

          <div class="d-grid">
            <button class="btn btn-sm btn-danger fw-bold py-2" onclick="abrirModalPagamento(${mensalidade.id}, '${valorFormatado}', '${mesReferencia}')">
              <i class="bi bi-credit-card me-1"></i> Pagar Agora
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderResumoMensalidades(totalVencido, totalPendente) {
  const containerResumo = document.getElementById('resumoMensalidades');

  if (!containerResumo) return;

  const vencidoFormatado = `R$ ${totalVencido.toFixed(2).replace('.', ',')}`;
  const pendenteFormatado = `R$ ${totalPendente.toFixed(2).replace('.', ',')}`;
  const totalFormatado = `R$ ${(totalVencido + totalPendente).toFixed(2).replace('.', ',')}`;

  const html = `
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="stat-card bg-danger bg-opacity-10 border border-danger">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="text-muted mb-2">Vencido</h6>
              <h4 class="text-danger fw-bold mb-0">${vencidoFormatado}</h4>
            </div>
            <i class="bi bi-exclamation-circle-fill text-danger fs-1 opacity-50"></i>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="stat-card bg-info bg-opacity-10 border border-info">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="text-muted mb-2">Pendente</h6>
              <h4 class="text-info fw-bold mb-0">${pendenteFormatado}</h4>
            </div>
            <i class="bi bi-hourglass-split text-info fs-1 opacity-50"></i>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="stat-card bg-primary bg-opacity-10 border border-primary">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="text-muted mb-2">Total</h6>
              <h4 class="text-primary fw-bold mb-0">${totalFormatado}</h4>
            </div>
            <i class="bi bi-wallet2 text-primary fs-1 opacity-50"></i>
          </div>
        </div>
      </div>
    </div>
  `;

  containerResumo.innerHTML = html;
}

function renderMensalidadesVazias() {
  const containerMensalidades = document.getElementById('containerMensalidades');
  const containerResumo = document.getElementById('resumoMensalidades');

  if (containerMensalidades) {
    containerMensalidades.innerHTML = `
      <div class="text-center py-5">
        <i class="bi bi-check-circle text-success" style="font-size: 3rem;"></i>
        <h5 class="mt-3 fw-bold">Parabéns!</h5>
        <p class="text-muted">Você não possui mensalidades pendentes no momento.</p>
      </div>
    `;
  }

  if (containerResumo) {
    containerResumo.innerHTML = '';
  }
}

function renderErroCarregamento() {
  const containerMensalidades = document.getElementById('containerMensalidades');

  if (containerMensalidades) {
    containerMensalidades.innerHTML = `
      <div class="alert alert-danger" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>
        Erro ao carregar mensalidades. Por favor, recarregue a página.
      </div>
    `;
  }
}

function formatarData(data) {
  const opcoes = { year: 'numeric', month: 'long', day: 'numeric' };
  return data.toLocaleDateString('pt-BR', opcoes);
}

function formatarMesReferencia(mesReferencia) {
  if (!mesReferencia) return 'Sem data';

  const [ano, mes] = mesReferencia.split('-');
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return `${meses[parseInt(mes) - 1]} de ${ano}`;
}

function abrirModalPagamento(mensalidadeId, valor, mes) {
  alert(`Preparando pagamento de ${valor} para ${mes}\n\nEsta funcionalidade será integrada com o gateway de pagamento.`);
}
