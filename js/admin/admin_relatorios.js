// ============================================
// RELATÓRIOS E ESTATÍSTICAS (ADMIN)
// ============================================

let relatorios = {
  academias: [],
  instrutores: [],
  alunos: [],
  mensalidades: [],
  modalidades: [],
};

async function validarSessao() {
  try {
    const response = await fetch("../../../php/valida_sessao.php");
    const resultado = await response.json();

    if (resultado.status === "ok") {
      const usuarioData = resultado.data;
      document.getElementById("adminNome").textContent =
        usuarioData.email || "Administrador";
    } else {
      window.location.href = "../login_admin/login_admin.html";
    }
  } catch (erro) {
    window.location.href = "../login_admin/login_admin.html";
  }
}

function logout() {
  localStorage.removeItem("admin_logado");
  window.location.href = "../login_admin/login_admin.html";
}

async function carregarRelatorios() {
  try {
    // Carregar todas as fontes de dados em paralelo
    const [
      respostaAcademias,
      respostaAlunos,
      respostaMensalidades,
      respostaModalidades,
    ] = await Promise.all([
      fetch("../../../php/academia/academia_get.php"),
      fetch("../../../php/aluno/aluno_get.php"),
      fetch("../../../php/mensalidade/mensalidade_fluxo_caixa.php"),
      fetch("../../../php/modalidade/modalidade_get.php"),
    ]);

    const resultadoAcademias = await respostaAcademias.json();
    const resultadoAlunos = await respostaAlunos.json();
    const resultadoMensalidades = await respostaMensalidades.json();
    const resultadoModalidades = await respostaModalidades.json();

    if (resultadoAcademias.status === "ok")
      relatorios.academias = resultadoAcademias.data || [];
    if (resultadoAlunos.status === "ok")
      relatorios.alunos = resultadoAlunos.data || [];
    if (resultadoMensalidades.status === "ok")
      relatorios.mensalidades = resultadoMensalidades.data || [];
    if (resultadoModalidades.status === "ok")
      relatorios.modalidades = resultadoModalidades.data || [];

    renderizarRelatorios();
  } catch (erro) {
    console.error("Erro ao carregar relatórios:", erro);
  }
}

function renderizarRelatorios() {
  renderizarEstatisticasGerais();
  renderizarFluxoFinanceiro();
  renderizarDistribuicaoAcademias();
  renderizarModalidades();
}

function renderizarEstatisticasGerais() {
  const totalAcademias = relatorios.academias.filter(
    (a) => a.status_ativo,
  ).length;
  const totalAlunos = relatorios.alunos.length;

  document.getElementById("totalAcademias").textContent = totalAcademias;
  document.getElementById("totalInstrutores").textContent = "—";
  document.getElementById("totalAlunos").textContent = totalAlunos;

  // Calcular receita total esperada
  const receitaTotal =
    relatorios.mensalidades.length > 0 && relatorios.mensalidades[0].valor_total
      ? parseFloat(relatorios.mensalidades[0].valor_total || 0)
      : 0;

  document.getElementById("receitaTotal").textContent =
    receitaTotal.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
}

function renderizarFluxoFinanceiro() {
  const fluxo =
    relatorios.mensalidades.length > 0 ? relatorios.mensalidades[0] : null;

  const valorPago = fluxo ? parseFloat(fluxo.valor_pago || 0) : 0;
  const valorPendente = fluxo ? parseFloat(fluxo.valor_pendente || 0) : 0;
  const valorVencido = fluxo ? parseFloat(fluxo.valor_vencido || 0) : 0;
  const valorTotal = fluxo ? parseFloat(fluxo.valor_total || 0) : 0;
  const qtdPagas = fluxo ? parseInt(fluxo.qtd_pagas || 0) : 0;
  const qtdPendentes = fluxo ? parseInt(fluxo.qtd_pendentes || 0) : 0;
  const qtdVencidas = fluxo ? parseInt(fluxo.qtd_vencidas || 0) : 0;
  const totalMensalidades = fluxo ? parseInt(fluxo.total_mensalidades || 0) : 0;

  document.getElementById("valorPago").textContent = valorPago.toLocaleString(
    "pt-BR",
    { style: "currency", currency: "BRL" },
  );
  document.getElementById("qtdPagas").textContent = qtdPagas + " mensalidades";

  document.getElementById("valorPendente").textContent =
    valorPendente.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  document.getElementById("qtdPendentes").textContent =
    qtdPendentes + " mensalidades";

  document.getElementById("valorVencido").textContent =
    valorVencido.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  document.getElementById("qtdVencidas").textContent =
    qtdVencidas + " mensalidades";

  document.getElementById("valorTotal").textContent = valorTotal.toLocaleString(
    "pt-BR",
    { style: "currency", currency: "BRL" },
  );
  document.getElementById("qtdTotal").textContent =
    totalMensalidades + " mensalidades";

  // Renderizar tabela de alunos
  const tbody = document.getElementById("corpoMensalidades");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (relatorios.alunos.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" class="text-center text-muted">Nenhum aluno encontrado</td></tr>';
    return;
  }

  // Mostrar resumo de alunos
  relatorios.alunos.slice(0, 50).forEach((aluno) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${aluno.nome || "—"}</td>
      <td>${aluno.academia_nome || "—"}</td>
      <td>${aluno.modalidade_tipo || "—"}</td>
      <td>${aluno.dataNascimento ? new Date(aluno.dataNascimento).toLocaleDateString("pt-BR") : "—"}</td>
      <td>${aluno.email || "—"}</td>
      <td><span class="status-badge status-${aluno.status_ativo ? "ativo" : "inativo"}">${aluno.status_ativo ? "Ativo" : "Inativo"}</span></td>
      <td>${aluno.telefone || "—"}</td>
    `;

    tbody.appendChild(row);
  });
}

function renderizarDistribuicaoAcademias() {
  const tbody = document.getElementById("corpoAcademias");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (relatorios.academias.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="text-center text-muted">Nenhuma academia encontrada</td></tr>';
    return;
  }

  relatorios.academias.forEach((academia) => {
    const alunosAcademia = relatorios.alunos.filter(
      (a) => a.academia_id === academia.id,
    ).length;
    const statusClass = academia.status_ativo ? "ativo" : "inativo";
    const statusTexto = academia.status_ativo ? "Ativa" : "Inativa";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${academia.nome}</strong></td>
      <td>—</td>
      <td>${alunosAcademia}</td>
      <td>—</td>
      <td><span class="status-badge status-${statusClass}">${statusTexto}</span></td>
    `;

    tbody.appendChild(row);
  });
}

function renderizarModalidades() {
  const tbody = document.getElementById("corpoModalidades");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (relatorios.modalidades.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" class="text-center text-muted">Nenhuma modalidade encontrada</td></tr>';
    return;
  }

  const totalAlunosGeral = relatorios.alunos.length;

  relatorios.modalidades.forEach((modalidade) => {
    const alunosModalidade = relatorios.alunos.filter(
      (a) => a.modalidade_id === modalidade.id,
    ).length;
    const porcentagem =
      totalAlunosGeral > 0
        ? ((alunosModalidade / totalAlunosGeral) * 100).toFixed(1)
        : 0;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${modalidade.tipo}</strong></td>
      <td>${alunosModalidade}</td>
      <td>—</td>
      <td>${porcentagem}%</td>
    `;

    tbody.appendChild(row);
  });
}

function abrirTab(evt, tabName) {
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("tab-content--active");
  });
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("tab-btn--active");
  });
  const tabElement = document.getElementById(tabName);
  if (tabElement) {
    tabElement.classList.add("tab-content--active");
  }
  if (evt && evt.currentTarget) {
    evt.currentTarget.classList.add("tab-btn--active");
  }
}

// Inicializar
validarSessao();
carregarRelatorios();

// Atualizar a cada 10 minutos
setInterval(carregarRelatorios, 600000);
