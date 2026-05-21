// ============================================
// GERENCIAMENTO DE ACADEMIAS
// ============================================

let academias = [];
let academiaEmEdicao = null;

async function carregarAcademias() {
  try {
    const response = await fetch("../../../php/academia/academia_get.php");
    const resultado = await response.json();

    if (resultado.status === "ok") {
      academias = resultado.data;
      renderizarAcademias();
    }
  } catch (erro) {
    console.error("Erro ao carregar academias:", erro);
  }
}

function renderizarAcademias() {
  const tbody = document.getElementById("corpoAcademias");
  if (!tbody) return;

  tbody.innerHTML = "";

  academias.forEach((academia) => {
    const statusClass = academia.status_ativo ? "ativo" : "inativo";
    const statusTexto = academia.status_ativo ? "Ativa" : "Inativa";
    const row = document.createElement("tr");

    row.innerHTML = `
            <td>${academia.nome}</td>
            <td>${academia.cnpj || "—"}</td>
            <td>${academia.endereco || "—"}</td>
            <td><span class="status-badge status-${statusClass}">${statusTexto}</span></td>
            <td>
                <button class="btn-acao btn-editar" onclick="abrirModalEditarAcademia(${academia.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn-acao btn-deletar" onclick="confirmarExcluirAcademia(${academia.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;

    tbody.appendChild(row);
  });
}

function abrirModalEditarAcademia(academiaId) {
  const academia = academias.find((a) => a.id === academiaId);
  if (!academia) return;

  academiaEmEdicao = academia;

  document.getElementById("editAcademiaNome").value = academia.nome;
  document.getElementById("editAcademiaEndereco").value =
    academia.endereco || "";
  document.getElementById("editAcademiaCNPJ").value = academia.cnpj || "";
  document.getElementById("editAcademiaCNPJ").disabled = true;
  document.getElementById("editAcademiaStatus").checked = academia.status_ativo;

  document.getElementById("modalEditarAcademia").style.display = "flex";
}

function fecharModalAcademia() {
  document.getElementById("modalEditarAcademia").style.display = "none";
  academiaEmEdicao = null;
}

async function salvarAlteracoesAcademia() {
  if (!academiaEmEdicao) return;

  const formData = new FormData();
  formData.append("nome", document.getElementById("editAcademiaNome").value);
  formData.append(
    "endereco",
    document.getElementById("editAcademiaEndereco").value,
  );
  formData.append(
    "status_ativo",
    document.getElementById("editAcademiaStatus").checked ? 1 : 0,
  );

  try {
    const response = await fetch(
      `../../../php/academia/academia_alterar.php?id=${academiaEmEdicao.id}`,
      {
        method: "POST",
        body: formData,
      },
    );

    const resultado = await response.json();

    if (resultado.status === "ok") {
      alert("Academia atualizada com sucesso!");
      fecharModalAcademia();
      await carregarAcademias();
    } else {
      alert("Erro ao atualizar: " + resultado.mensagem);
    }
  } catch (erro) {
    console.error("Erro:", erro);
    alert("Erro ao conectar com o servidor.");
  }
}

async function confirmarExcluirAcademia(academiaId) {
  if (confirm("Tem certeza que deseja excluir esta academia?")) {
    try {
      const response = await fetch(
        `../../../php/academia/academia_excluir.php?id=${academiaId}`,
      );
      const resultado = await response.json();

      if (resultado.status === "ok") {
        alert("Academia excluída com sucesso!");
        await carregarAcademias();
      } else {
        alert("Erro ao excluir: " + resultado.mensagem);
      }
    } catch (erro) {
      console.error("Erro:", erro);
    }
  }
}

// Carregar academias ao abrir a página
document.addEventListener("DOMContentLoaded", carregarAcademias);

// Fechar modal ao clicar fora
window.addEventListener("click", function (event) {
  const modal = document.getElementById("modalEditarAcademia");
  if (event.target === modal) {
    fecharModalAcademia();
  }
});
