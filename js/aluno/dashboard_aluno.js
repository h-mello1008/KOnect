document.addEventListener("DOMContentLoaded", function () {
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
        } else if (m.status_pagamento === 'Pendente') {
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
  } catch (erro) {}
}

function renderAvisoBloqueio() {
  const containerAvisos = document.getElementById('containerAvisos');
  if (!containerAvisos) return;

  containerAvisos.insertAdjacentHTML('beforeend', `
    <div class="p-3 rounded mt-3" style="background:rgba(245,158,11,0.1);border-left:4px solid #f59e0b;">
      <div class="d-flex align-items-center mb-1">
        <i class="bi bi-exclamation-triangle-fill me-2" style="color:#f59e0b"></i>
        <p class="mb-0 fw-bold" style="color:#f59e0b">Aviso Financeiro Importante</p>
      </div>
      <p class="small mb-0" style="color:#d1a3a3">
        Identificamos <strong>mensalidade(s) em atraso</strong>. Por favor, realize o pagamento para evitar o bloqueio da sua conta.
        <br>
        <a href="../mensalidades/index.html" style="color:#f59e0b;text-decoration:underline;font-weight:700" class="mt-1 d-inline-block">
          <i class="bi bi-credit-card me-1"></i> Regularizar situação
        </a>
      </p>
    </div>
  `);
}

function renderAvisoPendente(dias) {
  const containerAvisos = document.getElementById('containerAvisos');
  if (!containerAvisos) return;

  let textoDias = dias === 0 ? '<strong>hoje</strong>' : dias === 1 ? '<strong>amanhã</strong>' : `em <strong>${dias} dias</strong>`;

  containerAvisos.insertAdjacentHTML('beforeend', `
    <div class="p-3 rounded mt-3" style="background:rgba(225,29,72,0.08);border-left:4px solid #e11d48;">
      <div class="d-flex align-items-center mb-1">
        <i class="bi bi-clock-fill text-danger me-2"></i>
        <p class="mb-0 fw-bold text-danger">Lembrete de Vencimento</p>
      </div>
      <p class="small mb-0" style="color:#d1a3a3">
        Sua próxima mensalidade vence ${textoDias}. Evite correrias e realize o pagamento com antecedência!
        <br>
        <a href="../mensalidades/index.html" style="color:#e11d48;text-decoration:underline;font-weight:700" class="mt-1 d-inline-block">
          <i class="bi bi-wallet2 me-1"></i> Acessar mensalidades
        </a>
      </p>
    </div>
  `);
}

async function validarSessao() {
  try {
    const response = await fetch('../../../php/valida_sessao.php', { method: 'GET', credentials: 'include' });
    const resultado = await response.json();

    if (resultado.status === 'ok') {
      const usuarioData = resultado.data;
      document.getElementById('userName').textContent = usuarioData.email || 'Aluno';
      loadUserProgress();
    } else {
      window.location.href = '/KOnect/pages/aluno/login_aluno/index.html';
    }
  } catch (erro) {
    window.location.href = '/KOnect/pages/aluno/login_aluno/index.html';
  }
}

function loadUserProgress() {
  const userCourse = localStorage.getItem("userCourse") || "Curso";
  document.getElementById("userCourse").textContent = userCourse;
  updateProgressBar(localStorage.getItem("userProgress") || 0);
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
    logoutBtn.addEventListener("click", logout);
  }
}

function logout() {
  localStorage.removeItem("aluno_logado");
  localStorage.removeItem("userCourse");
  localStorage.removeItem("userProgress");
  window.location.href = "../../../index.html";
}
