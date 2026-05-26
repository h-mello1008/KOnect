// Dashboard Aluno - KOnect Platform
// Script for student dashboard functionality

document.addEventListener("DOMContentLoaded", function () {
  // Initialize dashboard
  verificarInadimplencia();
  validarSessao();
  setupEventListeners();
});

async function verificarInadimplencia() {
  try {
    const response = await fetch('/KOnect/php/aluno/mensalidade_get.php', { credentials: 'include' });
    const resultado = await response.json();

    if (resultado.status === 'ok' && resultado.data.length > 0) {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      let temVencida = false;
      let diasMaisProximoVencimento = Infinity;

      resultado.data.forEach(m => {
        if (m.status_pagamento === 'Vencido') {
          temVencida = true;
        } 
        else if (m.status_pagamento === 'Pendente') {
          const dataVenc = new Date(m.dataVencimento);
          const dataVencimentoLoc = new Date(dataVenc.getTime() + dataVenc.getTimezoneOffset() * 60000);
          dataVencimentoLoc.setHours(0, 0, 0, 0);

          const difTempo = dataVencimentoLoc.getTime() - hoje.getTime();
          const diasRestantes = Math.ceil(difTempo / (1000 * 3600 * 24));

          if (diasRestantes >= 0 && diasRestantes < diasMaisProximoVencimento) {
            diasMaisProximoVencimento = diasRestantes;
          }
        }
      });

      if (temVencida) {
        renderAvisoBloqueio();
      } else if (diasMaisProximoVencimento <= 7) {
        renderAvisoPendente(diasMaisProximoVencimento);
      }
    }
  } catch (erro) { 
    console.error('Erro ao verificar situação financeira do aluno: ', erro);
  }
}

function renderAvisoBloqueio(){
  const containerAvisos = document.getElementById('containerAvisos');

  if (!containerAvisos) return;

  const avisoHTML = `
    <div class="p-3 border-start border-warning border-4 bg-dark rounded mt-3 shadow-sm">
      <div class="d-flex align-items-center mb-1">
        <i class="bi bi-exclamation-triangle-fill text-warning me-2 fs-5"></i>
        <p class="mb-0 fw-bold text-warning">Aviso Financeiro Importante</p>
      </div>
      <p class="small text-muted mb-0">
        Identificamos <strong>mensalidade(s) em atraso</strong>. Por favor, realize o pagamento para evitar o <strong>bloqueio da sua conta</strong>.
        <br>
        <a href="../mensalidades/index.html" class="text-warning text-decoration-underline fw-bold mt-1 d-inline-block">
          <i class="bi bi-credit-card me-1"></i> Regularizar situação
        </a>
      </p>
    </div>
  `;

  containerAvisos.insertAdjacentHTML('beforeend', avisoHTML);
}

function renderAvisoPendente(dias) {
  const containerAvisos = document.getElementById('containerAvisos');
  if (!containerAvisos) return;

  let textoDias = '';
  if (dias === 0) {
    textoDias = '<strong>hoje</strong>';
  } else if (dias === 1) {
    textoDias = '<strong>amanhã</strong>';
  } else {
    textoDias = `em <strong>${dias} dias</strong>`;
  }

  const avisoHTML = `
    <div class="p-3 border-start border-danger border-4 bg-dark rounded mt-3 shadow-sm">
      <div class="d-flex align-items-center mb-1">
        <i class="bi bi-clock-fill text-danger me-2 fs-5"></i>
        <p class="mb-0 fw-bold text-danger>Lembrete de Vencimento</p>
      </div>
      <p class="small text-muted mb-0">
        Sua próxima mensalidade vence ${textoDias}. Evite correrias e realize o pagamento com antecedência!
        <br>
        <a href="../mensalidades/index.html" class="text-info text-decoration-underline fw-bold mt-1 d-inline-block">
          <i class="bi bi-wallet2 me-1"></i> Acessar mensalidades
        </a>
      </p>
    </div>
  `;
  containerAvisos.insertAdjacentHTML('beforeend', avisoHTML);
}

async function validarSessao() {
  try {
    const response = await fetch('../../../php/valida_sessao.php',{
      method: 'GET',
      credentials: 'include'
  });
    const resultado = await response.json();

    console.log("DADOS DAS MENSALIDADES:", resultado);

    if (resultado.status === 'ok') {
      const usuarioData = resultado.data;
      document.getElementById('userName').textContent = usuarioData.email || 'Aluno';
      loadUserProgress();
    } else {
      window.location.href = '/KOnect/pages/aluno/login_aluno/index.html';
    }
  } catch (erro) {
    console.error('Erro ao validar sessão:', erro);
    window.location.href = '/KOnect/pages/aluno/login_aluno/index.html';
  }
}

function loadUserProgress() {
  // Load student progress data
  const userCourse = localStorage.getItem("userCourse") || "Curso";
  document.getElementById("userCourse").textContent = userCourse;

  // Update progress bar
  const progress = localStorage.getItem("userProgress") || 0;
  updateProgressBar(progress);
}

function updateProgressBar(percentage) {
  const progressFill = document.getElementById("progressBar");
  if (progressFill) {
    progressFill.style.width = percentage + "%";
  }
}

function setupEventListeners() {
  const logoutBtn = document.getElementById("btnLogout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      logout();
    });
  }
}

function logout() {
  localStorage.removeItem("aluno_logado");
  localStorage.removeItem("userCourse");
  localStorage.removeItem("userProgress");

  window.location.href = "../../../index.html";
}
