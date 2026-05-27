document.addEventListener("DOMContentLoaded", function () {
  verificarInadimplencia();
  carregarAvisosAcademia();
  validarSessao();
  setupEventListeners();
});

async function validarSessao() {
  try {
    const response = await fetch('../../../php/valida_sessao.php', { method: 'GET', credentials: 'include' });
    const resultado = await response.json();

    if (resultado.status === 'ok') {
      const usuarioData = resultado.data;
      document.getElementById('userName').textContent = usuarioData.email || 'Aluno';
    } else {
      window.location.href = '/KOnect/pages/aluno/login_aluno/index.html';
    }
  } catch (erro) {
    window.location.href = '/KOnect/pages/aluno/login_aluno/index.html';
  }
}

async function realizarCheckIn() {
  const btnCheckIn = document.getElementById('btnCheckIn');
  
  btnCheckIn.disabled = true;
  btnCheckIn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registrando...';

  try {
    const response = await fetch('../../../php/aluno/aluno_checkin.php', {
        method: 'POST',
        credentials: 'include'
    });
    
    const resultado = await response.json();

    if (resultado.status === 'ok') {
        btnCheckIn.innerHTML = '<i class="bi bi-check-circle-fill"></i> Presença Confirmada';
        btnCheckIn.style.backgroundColor = '#10b981'; 
        alert("OSS! Sua presença foi registrada com sucesso.");
        window.location.reload(); 
    } else {
        alert('Aviso: ' + resultado.mensagem);
        btnCheckIn.innerHTML = 'Confirmar Presença';
        btnCheckIn.disabled = false;
    }
  } catch (erro) {
    console.error("Erro ao fazer check-in:", erro);
    alert("Ocorreu um erro ao comunicar com o servidor.");
    btnCheckIn.innerHTML = 'Confirmar Presença';
    btnCheckIn.disabled = false;
  }
}

async function verificarInadimplencia() {
  try {
    const response = await fetch('../../../php/aluno/mensalidade_get.php', { credentials: 'include' });
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
  } catch (erro) {
     console.error("Erro ao checar mensalidades:", erro);
  }
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

function setupEventListeners() {
  const logoutBtn = document.getElementById("btnLogout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  const btnCheckIn = document.getElementById("btnCheckIn");
  if (btnCheckIn) {
    btnCheckIn.addEventListener("click", realizarCheckIn);
  }
}

async function carregarAvisosAcademia() {
  const container = document.getElementById('containerAvisos');
  if (!container) return;

  try {
    const response = await fetch('../../../php/aluno/avisos_get.php', { credentials: 'include' });
    const resultado = await response.json();

    if (resultado.status === 'ok' && resultado.data.length > 0) {
      container.innerHTML = '';
      resultado.data.forEach(aviso => {
        const dataFormatada = new Date(aviso.data_criacao).toLocaleString('pt-BR', {
          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        container.insertAdjacentHTML('beforeend', `
          <div class="p-3 rounded mb-2" style="background:rgba(255,255,255,0.04);border-left:4px solid var(--accent);">
            <div class="d-flex justify-content-between align-items-start mb-1">
              <p class="mb-0 fw-bold">${aviso.titulo}</p>
              <span class="small text-muted">${dataFormatada}</span>
            </div>
            <p class="small text-muted mb-0">${aviso.mensagem}</p>
          </div>
        `);
      });
    } else {
      container.innerHTML = '<p class="text-muted small mb-0">Nenhum aviso publicado pela academia.</p>';
    }
  } catch (erro) {
    if (container) container.innerHTML = '<p class="text-muted small mb-0">Não foi possível carregar os avisos.</p>';
  }
}

function logout() {
  localStorage.removeItem("aluno_logado");

  window.location.href = "../../../index.html";
}
