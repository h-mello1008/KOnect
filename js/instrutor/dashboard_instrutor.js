document.addEventListener('DOMContentLoaded', () => {
    const instrutor = JSON.parse(localStorage.getItem('instrutor_logado') || '{}');
    const el = document.getElementById('instrutorEmail');
    if (el) el.textContent = instrutor.email || '';
});

function fazerLogout() {
    localStorage.removeItem('instrutor_logado');
    window.location.href = '/KOnect/index.html';
}

function abrirTab(evt, tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('tab-content--active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('tab-btn--active'));
    document.getElementById(tabName).classList.add('tab-content--active');
    evt.currentTarget.classList.add('tab-btn--active');
}
