document.addEventListener('DOMContentLoaded', () => {
    carregarAcademias();
});

async function carregarAcademias() {
    const select = document.getElementById('selectAcademiasAtivas');
    if (!select) return;

    try {
        const response = await fetch('/KOnect/php/instrutor/academia_get.php');
        const json = await response.json();

        select.innerHTML = '';

        if (json.status === 'ok' && json.data.length > 0) {
            json.data.forEach(academia => {
                const option = document.createElement('option');
                option.value = academia.id;
                option.textContent = academia.nome;
                select.appendChild(option);
            });
        } else {
            select.innerHTML = '<option value="">Nenhuma academia ativa</option>';
        }
    } catch (erro) {
        console.error('Erro ao carregar lista de academias:', erro);
        select.innerHTML = '<option value="">Erro ao carregar</option>';
    }
}

function fazerLogout() {
    localStorage.removeItem('instrutor_logado');
    window.location.href = '/KOnect/index.html';
}
