let regras = [];
let modalidades = [];
let graduacoes = [];
let regraEmEdicao = null;

async function carregarDadosGraduacao() {
  try {
    
    const resGrad = await fetch("../../../php/graduacao/graduacao_get.php");
    const resGradJSON = await resGrad.json();
    if (resGradJSON.status === "ok") {
      graduacoes = resGradJSON.data;
    }

    
    const resMod = await fetch("../../../php/modalidade/modalidade_get.php");
    const resModJSON = await resMod.json();
    if (resModJSON.status === "ok") {
      modalidades = resModJSON.data;
    }

    
    await carregarRegras();
    preencherSelectsGraduacao();
  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
  }
}

async function carregarRegras() {
  try {
    const response = await fetch(
      "../../../php/graduacao/graduacao_regra_get.php",
    );
    const resultado = await response.json();

    if (resultado.status === "ok") {
      regras = resultado.data;
      renderizarRegras();
    }
  } catch (erro) {
    console.error("Erro ao carregar regras:", erro);
  }
}

function preencherSelectsGraduacao() {
  const selectGrad = document.getElementById("novaRegraGraduacao");
  const selectMod = document.getElementById("novaRegraModalidade");

  if (selectGrad) {
    selectGrad.innerHTML = '<option value="">Selecione a Graduação</option>';
    graduacoes.forEach((g) => {
      selectGrad.innerHTML += `<option value="${g.id}">${g.corFaixa} (${g.hierarquia})</option>`;
    });
  }

  if (selectMod) {
    selectMod.innerHTML = '<option value="">Selecione a Modalidade</option>';
    modalidades.forEach((m) => {
      selectMod.innerHTML += `<option value="${m.id}">${m.tipo}</option>`;
    });
  }
}

function renderizarRegras() {
  const tbody = document.getElementById("corpoRegras");
  if (!tbody) return;

  tbody.innerHTML = "";

  regras.forEach((regra) => {
    const row = document.createElement("tr");

    row.innerHTML = `
            <td>${regra.modalidade_tipo}</td>
            <td>${regra.corFaixa} (${regra.hierarquia})</td>
            <td>${regra.tempoMinimo} meses</td>
            <td>${regra.pontuacaoMinima} pts</td>
            <td>${regra.descricao || "—"}</td>
            <td>
                <button class="btn-acao btn-editar" onclick="abrirModalEditarRegra(${regra.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn-acao btn-deletar" onclick="confirmarExcluirRegra(${regra.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;

    tbody.appendChild(row);
  });
}

async function criarNovaRegra() {
  const graduacao_id = document.getElementById("novaRegraGraduacao").value;
  const modalidade_id = document.getElementById("novaRegraModalidade").value;
  const tempoMinimo = document.getElementById("novaRegraTempo").value || 0;
  const descricao = document.getElementById("novaRegraDescricao").value;
  const requisitos = document.getElementById("novaRegraRequisitos").value;
  const pontuacaoMinima =
    document.getElementById("novaRegraPontuacao").value || 0;

  if (!graduacao_id || !modalidade_id) {
    alert("Selecione uma graduação e uma modalidade");
    return;
  }

  const formData = new FormData();
  formData.append("graduacao_id", graduacao_id);
  formData.append("modalidade_id", modalidade_id);
  formData.append("tempoMinimo", tempoMinimo);
  formData.append("descricao", descricao);
  formData.append("requisitos", requisitos);
  formData.append("pontuacaoMinima", pontuacaoMinima);

  try {
    const response = await fetch(
      `../../../php/graduacao/graduacao_regra_novo.php`,
      {
        method: "POST",
        body: formData,
      },
    );

    const resultado = await response.json();

    if (resultado.status === "ok") {
      alert("Regra criada com sucesso!");
      document.getElementById("formNovaRegra").reset();
      await carregarRegras();
    } else {
      alert("Erro ao criar: " + resultado.mensagem);
    }
  } catch (erro) {
    console.error("Erro:", erro);
    alert("Erro ao conectar com o servidor.");
  }
}

function abrirModalEditarRegra(regraId) {
  const regra = regras.find((r) => r.id === regraId);
  if (!regra) return;

  regraEmEdicao = regra;

  document.getElementById("editRegraTempoMinimo").value = regra.tempoMinimo;
  document.getElementById("editRegraDescricao").value = regra.descricao || "";
  document.getElementById("editRegraRequisitos").value = regra.requisitos || "";
  document.getElementById("editRegraPontuacaoMinima").value =
    regra.pontuacaoMinima || 0;

  document.getElementById("modalEditarRegra").style.display = "flex";
}

function fecharModalRegra() {
  document.getElementById("modalEditarRegra").style.display = "none";
  regraEmEdicao = null;
}

async function salvarAlteracoesRegra() {
  if (!regraEmEdicao) return;

  const formData = new FormData();
  formData.append(
    "tempoMinimo",
    document.getElementById("editRegraTempoMinimo").value,
  );
  formData.append(
    "descricao",
    document.getElementById("editRegraDescricao").value,
  );
  formData.append(
    "requisitos",
    document.getElementById("editRegraRequisitos").value,
  );
  formData.append(
    "pontuacaoMinima",
    document.getElementById("editRegraPontuacaoMinima").value,
  );

  try {
    const response = await fetch(
      `../../../php/graduacao/graduacao_regra_alterar.php?id=${regraEmEdicao.id}`,
      {
        method: "POST",
        body: formData,
      },
    );

    const resultado = await response.json();

    if (resultado.status === "ok") {
      alert("Regra atualizada com sucesso!");
      fecharModalRegra();
      await carregarRegras();
    } else {
      alert("Erro ao atualizar: " + resultado.mensagem);
    }
  } catch (erro) {
    console.error("Erro:", erro);
    alert("Erro ao conectar com o servidor.");
  }
}

async function confirmarExcluirRegra(regraId) {
  if (confirm("Tem certeza que deseja excluir esta regra?")) {
    try {
      const response = await fetch(
        `../../../php/graduacao/graduacao_regra_excluir.php?id=${regraId}`,
      );
      const resultado = await response.json();

      if (resultado.status === "ok") {
        alert("Regra excluída com sucesso!");
        await carregarRegras();
      } else {
        alert("Erro ao excluir: " + resultado.mensagem);
      }
    } catch (erro) {
      console.error("Erro:", erro);
    }
  }
}

document.addEventListener("DOMContentLoaded", carregarDadosGraduacao);

window.addEventListener("click", function (event) {
  const modal = document.getElementById("modalEditarRegra");
  if (event.target === modal) {
    fecharModalRegra();
  }
});
