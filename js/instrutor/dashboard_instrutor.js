document.addEventListener('DOMContentLoaded', () => {

});

function fazerLogout() {
    localStorage.removeItem('instrutor_logado');
    window.location.href = '/KOnect/index.html';
}
