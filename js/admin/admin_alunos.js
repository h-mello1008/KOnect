// ============================================
// GERENCIAMENTO DE ALUNOS (ADMIN)
// ============================================

let alunos = [];
let alunoEmEdicao = null;
let academias = [];
let modalidades = [];

async function validarSessao() {
  try {
    const response = await fetch("../../../php/valida_sessao.php");
    const resultado = await response.json();

    if (resultado.status === "ok") {
      const usuarioData = resultado.data;
      document.getElementById("adminNome").textContent = usuarioData.email || "Administrador";
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

async function carregarAlunos() {
  try {
    const response = await fetch("../../../php/aluno/aluno_get.php");
    const resultado = await response.json();

    if (resultado.status === "ok") {
      alunos = resultado.data;
      renderizarAlunos(alunos);
    }
  } catch (erro) {
    console.error("Erro ao carregar alunos:", erro);
  }
}

async function carregarAcademias() {
  try {
    const response = await fetch("../../../php/academia/academia_get.php");
    const resultado = await response.json();

    if (resultado.status === "ok") {
      academias = resultado.data;
      preencherSelectAcademias();
    }
  } catch (erro) {
    console.error("Erro ao carregar academias:", erro);
  }
}

async function carregarModalidades() {
  try {
    const response = await fetch("../../../php/modalidade/modalidade_get.php");
    const resultado = await response.json();

    if (resultado.status === "ok") {
      modalidades = resultado.data;
      preencherSelectModalidades();
    }
  } catch (erro) {
    console.error("Erro ao carregar modalidades:", erro);
  }
}

function preencherSelectAcademias() {
  const selects = [
    document.getElementById("filtroAcademia"),
    document.getElementById("novoAlunoAcademia")
  ];

  selects.forEach((select) => {
    if (!select) return;
    const opcoes = select.innerHTML;
    const novasOpcoes = academias.map((a) => `<option value="${a.id}">${a.nome}</option>`).join("");
    select.innerHTML = opcoes + novasOpcoes;
  });
}

function preencherSelectModalidades() {
  const select = document.getElementById("novoAlunoModalidade");
  if (!select) return;

  const novasOpcoes = modalidades.map((m) => `<option value="${m.id}">${m.tipo}</option>`).join("");
  select.innerHTML = novasOpcoes;
}

function renderizarAlunos(alunosParaRenderizar) {
  const tbody = document.getElementById("corpoAlunos");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (alunosParaRenderizar.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Nenhum aluno encontrado</td></tr>';
    return;
  }

  alunosParaRenderizar.forEach((aluno) => {
    const statusClass = aluno.status_ativo ? "ativo" : "inativo";
    const statusTexto = aluno.status_ativo ? "Ativo" : "Inativo";
    const row = document.createElement("tr");

    row.innerHTML = `
      <td><strong>${aluno.nome}</strong></td>
      <td>${aluno.email || "—"}</td>
      <td>${aluno.telefone || "—"}</td>
      <td>${aluno.academia_nome || "—"}</td>
      <td>${aluno.modalidade_tipo || "—"}</td>
      <td><span class="status-badge status-${statusClass}">${statusTexto}</span></td>
      <td>
        <button class="btn-acao btn-editar" onclick="abrirModalEditarAluno(${aluno.id})" title="Editar">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn-acao btn-deletar" onclick="confirmarExcluirAluno(${aluno.id})" title="Deletar">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

function aplicarFiltros() {
  const nome = document.getElementById("filtroNome").value.toLowerCase();
  const academia = document.getElementById("filtroAcademia").value;
  const status = document.getElementById("filtroStatus").value;

  const alunosFiltrados = alunos.filter((aluno) => {
    const nomeMatch = aluno.nome.toLowerCase().includes(nome);
    const academiaMatch = !academia || aluno.academia_id == academia;
    const statusMatch = !status || (status === "Ativo" && aluno.status_ativo) || (status === "Inativo" && !aluno.status_ativo);

    return nomeMatch && academiaMatch && statusMatch;
  });

  renderizarAlunos(alunosFiltrados);
}

function abrirModalNovoAluno() {
  document.getElementById("modalNovoAluno").style.display = "flex";
}

function fecharModalAluno() {
  document.getElementById("modalNovoAluno").style.display = "none";
  document.getElementById("novoAlunoNome").value = "";
  document.getElementById("novoAlunoEmail").value = "";
  document.getElementById("novoAlunoTelefone").value = "";
  document.getElementById("novoAlunoCPF").value = "";
  document.getElementById("novoAlunoDataNascimento").value = "";
}

async function criarNovoAluno() {
  const nome = document.getElementById("novoAlunoNome").value;
  const email = document.getElementById("novoAlunoEmail").value;
  const telefone = document.getElementById("novoAlunoTelefone").value;
  const academia_id = document.getElementById("novoAlunoAcademia").value;
  const modalidade_id = document.getElementById("novoAlunoModalidade").value;
  const cpf = document.getElementById("novoAlunoCPF").value;
  const dataNascimento = document.getElementById("novoAlunoDataNascimento").value;

  if (!nome || !email || !telefone || !academia_id || !modalidade_id || !cpf) {
    alert("Por favor, preencha todos os campos obrigatórios!");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("email", email);
    formData.append("telefone", telefone);
    formData.append("academia_id", academia_id);
    formData.append("modalidade_id", modalidade_id);
    formData.append("cpf", cpf);
    formData.append("data_nascimento", dataNascimento);
    formData.append("status_ativo", true);

    const response = await fetch("../../../php/aluno/aluno_novo.php", {
      method: "POST",
      body: formData
    });

    const resultado = await response.json();

    if (resultado.status === "ok") {
      alert("Aluno criado com sucesso!");
      fecharModalAluno();
      await carregarAlunos();
    } else {
      alert("Erro: " + resultado.mensagem);
    }
  } catch (erro) {
    console.error("Erro ao criar aluno:", erro);
    alert("Erro ao criar aluno!");
  }
}

function abrirModalEditarAluno(alunoId) {
  const aluno = alunos.find((a) => a.id === alunoId);
  if (!aluno) return;

  alunoEmEdicao = aluno;

  document.getElementById("editAlunoNome").value = aluno.nome;
  document.getElementById("editAlunoEmail").value = aluno.email || "";
  document.getElementById("editAlunoTelefone").value = aluno.telefone || "";
  document.getElementById("editAlunoStatus").value = aluno.status_ativo ? "Ativo" : "Inativo";

  document.getElementById("modalEditarAluno").style.display = "flex";
}

function fecharModalEditarAluno() {
  document.getElementById("modalEditarAluno").style.display = "none";
  alunoEmEdicao = null;
}

async function salvarAlteracoesAluno() {
  if (!alunoEmEdicao) return;

  const nome = document.getElementById("editAlunoNome").value;
  const email = document.getElementById("editAlunoEmail").value;
  const telefone = document.getElementById("editAlunoTelefone").value;
  const status = document.getElementById("editAlunoStatus").value === "Ativo";

  try {
    const formData = new FormData();
    formData.append("id", alunoEmEdicao.id);
    formData.append("nome", nome);
    formData.append("email", email);
    formData.append("telefone", telefone);
    formData.append("status_ativo", status ? 1 : 0);

    const response = await fetch("../../../php/aluno/aluno_alterar.php", {
      method: "POST",
      body: formData
    });

    const resultado = await response.json();

    if (resultado.status === "ok") {
      alert("Aluno atualizado com sucesso!");
      fecharModalEditarAluno();
      await carregarAlunos();
    } else {
      alert("Erro: " + resultado.mensagem);
    }
  } catch (erro) {
    console.error("Erro ao atualizar aluno:", erro);
    alert("Erro ao atualizar aluno!");
  }
}

async function confirmarExcluirAluno(alunoId) {
  if (!confirm("Tem certeza que deseja excluir este aluno?")) return;

  try {
    const formData = new FormData();
    formData.append("id", alunoId);

    const response = await fetch("../../../php/aluno/aluno_excluir.php", {
      method: "POST",
      body: formData
    });

    const resultado = await response.json();

    if (resultado.status === "ok") {
      alert("Aluno excluído com sucesso!");
      await carregarAlunos();
    } else {
      alert("Erro: " + resultado.mensagem);
    }
  } catch (erro) {
    console.error("Erro ao excluir aluno:", erro);
    alert("Erro ao excluir aluno!");
  }
}

// Inicializar
validarSessao();
carregarAlunos();
carregarAcademias();
carregarModalidades();
