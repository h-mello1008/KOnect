document.addEventListener('DOMContentLoaded', () => {
    carregarAcademias();
    document.getElementById('formCadastroInstrutor').addEventListener('submit', salvarInstrutor);
});

async function carregarAcademias() {
    const select = document.getElementById('selectAcademia');
    const valorAtual = select.value;
    select.disabled = true;
    try {
        const response = await fetch(`../../../php/academia/academia_get.php?_=${Date.now()}`);
        const resultado = await response.json();

        if (resultado.status === 'ok') {
            const ativas = resultado.data.filter(ac => ac.status_ativo == 1);
            select.innerHTML = '<option value="">Selecione uma academia...</option>';
            ativas.forEach(ac => {
                const opt = document.createElement('option');
                opt.value = ac.id;
                opt.textContent = ac.nome;
                select.appendChild(opt);
            });

            if (ativas.length === 0) {
                select.innerHTML = '<option value="">Nenhuma academia ativa cadastrada</option>';
            } else if (valorAtual) {
                select.value = valorAtual;
            }
        } else {
            select.innerHTML = '<option value="">Nenhuma academia cadastrada</option>';
        }
    } catch (e) {
        select.innerHTML = '<option value="">Erro ao carregar academias</option>';
    } finally {
        select.disabled = false;
    }
}

async function salvarInstrutor(e) {
    e.preventDefault();

    const form    = e.target;
    const btnSalvar = document.getElementById('btnSalvar');
    const erroBox   = document.getElementById('formErro');
    const erroMsg   = document.getElementById('formErroMsg');

    erroBox.classList.add('d-none');
    btnSalvar.disabled = true;
    btnSalvar.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Salvando...';

    const instrutorData = {
        nome:                 form.querySelector('[name="nome"]').value,
        telefone:             form.querySelector('[name="telefone_responsavel"]').value,
        cpf:                  form.querySelector('[name="cpf"]').value,
        dataNascimento:       form.querySelector('[name="data_nascimento"]').value,
        nome_fantasia:        form.querySelector('[name="nome_fantasia"]').value,
        razao_social:         form.querySelector('[name="razao_social"]').value,
        cnpj:                 form.querySelector('[name="cnpj"]').value,
        horario_abertura:     form.querySelector('[name="horario_abertura"]').value,
        horario_fechamento:   form.querySelector('[name="horario_fechamento"]').value,
        periodo_contrato:     form.querySelector('[name="periodo_contrato"]:checked').value,
        renovacao_automatica: form.querySelector('[name="renovacao_automatica"]').value === 'sim' ? 1 : 0,
        aceitou_termos:       form.querySelector('[name="aceite_termos"]').checked ? 1 : 0,
        email:                form.querySelector('[name="email"]').value,
        senha:                form.querySelector('[name="senha"]').value,
        academia_id:          form.querySelector('[name="academia_id"]').value || null,
    };

    const formData = new FormData();
    Object.keys(instrutorData).forEach(key => formData.append(key, instrutorData[key]));

    try {
        const response = await fetch('../../../php/instrutor/instrutor_novo.php', {
            method: 'POST',
            body: formData,
        });

        const resultado = await response.json();

        if (resultado.status === 'ok') {
            window.location.href = '../../../pages/admin/home_admin/index.html';
        } else {
            erroMsg.textContent = resultado.mensagem;
            erroBox.classList.remove('d-none');
            erroBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } catch (erro) {
        erroMsg.textContent = 'Erro ao comunicar com o servidor.';
        erroBox.classList.remove('d-none');
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.innerHTML = '<i class="bi bi-check-lg me-1"></i> Salvar';
    }
}
