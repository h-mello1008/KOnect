document
  .getElementById("formLoginInstrutor")
  .addEventListener("submit", (e) => {
    e.preventDefault();

    let email = document.getElementById("emailLoginInstrutor").value;
    let senha = document.getElementById("senhaLoginInstrutor").value;

    const instrutorTeste = {
      nome: "Instrutor Teste",
      email: "instrutor@konect.com",
      senha: "instrutor123",
      telefone_responsavel: "41988888888",
      cpf: "12345678900",
      dataNascimento: "1990-03-20",
      nome_fantasia: "Academia Teste",
      razao_social: "Academia Teste LTDA",
      cnpj: "12.345.678/0001-90",
      horario_abertura: "06:00",
      horario_fechamento: "22:00",
      telefone_academia: "41987654321",
      periodo_contrato: "anual",
      renovacao_automatica: "sim",
      aceitou_termos: true,
    };

    const listaInstrutores = JSON.parse(
      localStorage.getItem("instrutor_academia"),
    ) || [instrutorTeste];

    const instrutorEncontrado = listaInstrutores.find(
      (instrutor) => instrutor.email === email && instrutor.senha === senha,
    );

    if (instrutorEncontrado) {
      localStorage.setItem(
        "instrutor_logado",
        JSON.stringify(instrutorEncontrado),
      );
      window.location.href = "../cadastro_aluno/index.html";
    } else {
      alert("E-mail e/ou senha incorretos.");
    }
  });
