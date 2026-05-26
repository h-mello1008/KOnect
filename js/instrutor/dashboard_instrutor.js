// Arquivo: js/instrutor/dashboard.js
// Responsável pelas funções da tela de entrada (Hub) e funções globais.

document.addEventListener('DOMContentLoaded', () => {

});

function fazerLogout() {
    localStorage.removeItem('instrutor_logado');
    window.location.href = '/KOnect/index.html';
}