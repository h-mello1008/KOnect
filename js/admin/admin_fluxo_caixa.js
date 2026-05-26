let fluxoCaixa = null;
let mensalidades = [];
let academiaFiltro = null;

async function carregarFluxoCaixa() {
  try {
    
    const response = await fetch(
      "../../../php/mensalidade/mensalidade_fluxo_caixa.php",
    );
    const resultado = await response.json();

    if (resultado.status === "ok") {
      fluxoCaixa = resultado.data[0];
      renderizarFluxoCaixa();
    }

    
    await carregarMensalidades();
  } catch (erro) {
    console.error("Erro ao carregar fluxo de caixa:", erro);
  }
}

async function carregarMensalidades(academiaId = null) {
  try {
    let url = "../../../php/mensalidade/mensalidade_get.php";
    if (academiaId) {
      url += `?academia_id=${academiaId}`;
    }

    const response = await fetch(url);
    const resultado = await response.json();

    if (resultado.status === "ok") {
      mensalidades = resultado.data;
      renderizarMensalidades();
    }
  } catch (erro) {
    console.error("Erro ao carregar mensalidades:", erro);
  }
}

function renderizarFluxoCaixa() {
  if (!fluxoCaixa) return;

  const container = document.getElementById("estatisticasFluxoCaixa");
  if (!container) return;

  const valorPago = parseFloat(fluxoCaixa.valor_pago || 0).toLocaleString(
    "pt-BR",
    { style: "currency", currency: "BRL" },
  );
  const valorPendente = parseFloat(
    fluxoCaixa.valor_pendente || 0,
  ).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const valorVencido = parseFloat(fluxoCaixa.valor_vencido || 0).toLocaleString(
    "pt-BR",
    { style: "currency", currency: "BRL" },
  );
  const valorTotal = parseFloat(fluxoCaixa.valor_total || 0).toLocaleString(
    "pt-BR",
    { style: "currency", currency: "BRL" },
  );

  container.innerHTML = `
        <div class="stat-card stat-card--green">
            <div class="stat-icon"><i class="bi bi-check-circle-fill"></i></div>
            <div class="stat-info">
                <span class="stat-label">Pago</span>
                <span class="stat-valor">${valorPago}</span>
                <span class="stat-qty">${fluxoCaixa.qtd_pagas || 0} mensalidades</span>
            </div>
        </div>

        <div class="stat-card stat-card--amber">
            <div class="stat-icon"><i class="bi bi-clock-fill"></i></div>
            <div class="stat-info">
                <span class="stat-label">Pendente</span>
                <span class="stat-valor">${valorPendente}</span>
                <span class="stat-qty">${fluxoCaixa.qtd_pendentes || 0} mensalidades</span>
            </div>
        </div>

        <div class="stat-card stat-card--rose">
            <div class="stat-icon"><i class="bi bi-exclamation-circle-fill"></i></div>
            <div class="stat-info">
                <span class="stat-label">Vencido</span>
                <span class="stat-valor">${valorVencido}</span>
                <span class="stat-qty">${fluxoCaixa.qtd_vencidas || 0} mensalidades</span>
            </div>
        </div>

        <div class="stat-card stat-card--blue">
            <div class="stat-icon"><i class="bi bi-cash-coin"></i></div>
            <div class="stat-info">
                <span class="stat-label">Total Esperado</span>
                <span class="stat-valor">${valorTotal}</span>
                <span class="stat-qty">${fluxoCaixa.total_mensalidades || 0} mensalidades</span>
            </div>
        </div>
    `;
}

function renderizarMensalidades() {
  const tbody = document.getElementById("corpoMensalidades");
  if (!tbody) return;

  tbody.innerHTML = "";

  mensalidades.slice(0, 20).forEach((mensalidade) => {
    const statusClass = mensalidade.status_pagamento.toLowerCase();
    const dataVencimento = new Date(
      mensalidade.dataVencimento,
    ).toLocaleDateString("pt-BR");
    const valor = parseFloat(mensalidade.valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    const row = document.createElement("tr");

    row.innerHTML = `
            <td>${mensalidade.aluno_nome}</td>
            <td>${mensalidade.modalidade_tipo}</td>
            <td>${mensalidade.mes_referencia}</td>
            <td>${valor}</td>
            <td>${dataVencimento}</td>
            <td><span class="status-badge status-${statusClass}">${mensalidade.status_pagamento}</span></td>
        `;

    tbody.appendChild(row);
  });
}

async function filtrarPorAcademia(academiaId) {
  if (academiaId) {
    
    const response = await fetch(
      `../../../php/mensalidade/mensalidade_fluxo_caixa.php?academia_id=${academiaId}`,
    );
    const resultado = await response.json();

    if (resultado.status === "ok") {
      fluxoCaixa = resultado.data[0];
      renderizarFluxoCaixa();
    }

    
    await carregarMensalidades(academiaId);
  } else {
    await carregarFluxoCaixa();
  }
}

document.addEventListener("DOMContentLoaded", carregarFluxoCaixa);

setInterval(carregarFluxoCaixa, 300000);
