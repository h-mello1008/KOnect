

let instrutores = [
  {
    id: 1,
    nome: 'Maria Silva',
    email: 'maria@eduplus.com',
    senha: '123456',
    tel: '(21) 99111-2222',
    esp: 'Desenvolvimento Web',
    formacao: 'Bel. Ciência da Computação',
    status: 'ativo',
    bio: 'Apaixonada por ensino e tecnologia.'
  },
  {
    id: 2,
    nome: 'Carlos Mendes',
    email: 'carlos@eduplus.com',
    tel: '(21) 98222-3333',
    esp: 'Design UX/UI',
    formacao: 'Bel. Design Gráfico',
    status: 'ativo',
    bio: 'Designer com 10 anos de experiência.'
  }
];

let alunos = [
  {
    id: 1,
    nome: 'João Costa',
    email: 'joao@email.com',
    cpf: '111.222.333-44',
    nasc: '2000-05-10',
    tel: '(21) 97333-4444',
    curso: 'Desenvolvimento Web',
    status: 'ativo',
    instrutor: 1
  },
  {
    id: 2,
    nome: 'Ana Souza',
    email: 'ana@email.com',
    cpf: '555.666.777-88',
    nasc: '1999-08-22',
    tel: '(21) 96444-5555',
    curso: 'Design UX/UI',
    status: 'ativo',
    instrutor: 2
  }
];

let nextInstrId  = 3;
let nextAlunoId  = 3;
let deleteTarget = null;
let deleteType   = null;
let deleteModal;

document.addEventListener('DOMContentLoaded', () => {
  deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

  document.getElementById('confirmDeleteBtn')
    .addEventListener('click', executarDelete);
});

function go(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  window.scrollTo(0, 0);

  if (pageId === 'pg-dash-admin') {
    adminTab('overview');
    renderTables();
  }

  if (pageId === 'pg-dash-instrutor') {
    instrTab('overview');
    updateInstrCount();
  }
}

function showToast(msg, color = 'var(--green)') {
  const t = document.getElementById('toast');
  t.textContent     = msg;
  t.style.background = color;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

function adminTab(tab) {
  const abas = ['overview', 'instrutores', 'alunos', 'cad-instrutor', 'cad-aluno'];

  abas.forEach(t => {
    document.getElementById('tab-' + t).style.display = (t === tab) ? 'block' : 'none';
  });

  
  document.querySelectorAll('#pg-dash-admin .sidebar-item')
    .forEach(b => b.classList.remove('active'));

  const map  = { overview: 0, instrutores: 1, alunos: 2, 'cad-instrutor': 3, 'cad-aluno': 4 };
  const btns = document.querySelectorAll('#pg-dash-admin .sidebar-item');
  if (map[tab] !== undefined) btns[map[tab]].classList.add('active');

  
  if (tab === 'instrutores')   renderInstrutores();
  if (tab === 'alunos')        renderAlunosAdmin();
  if (tab === 'cad-aluno')     preencherSeletorInstrutores();
}

function instrTab(tab) {
  const abas = ['overview', 'meus-alunos', 'cad-aluno-instr'];

  abas.forEach(t => {
    document.getElementById('itab-' + t).style.display = (t === tab) ? 'block' : 'none';
  });

  document.querySelectorAll('#pg-dash-instrutor .sidebar-item')
    .forEach(b => b.classList.remove('active'));

  const map  = { overview: 0, 'meus-alunos': 1, 'cad-aluno-instr': 2 };
  const btns = document.querySelectorAll('#pg-dash-instrutor .sidebar-item');
  if (map[tab] !== undefined) btns[map[tab]].classList.add('active');

  if (tab === 'meus-alunos') renderAlunosInstr();
}

function statusBadge(s) {
  const map = {
    ativo:    '<span class="badge-role badge-aluno">Ativo</span>',
    inativo:  '<span class="badge-role badge-admin">Inativo</span>',
    concluido:'<span class="badge-role badge-instr">Concluído</span>'
  };
  return map[s] || '';
}

function avatarColor(nome) {
  const cores = ['#3b82f6', '#22c55e', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4'];
  return cores[nome.charCodeAt(0) % cores.length];
}

function iniciais(nome) {
  return nome.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function renderInstrutores() {
  const tb = document.getElementById('tbody-instrutores');
  tb.innerHTML = instrutores.map(i => `
    <tr>
      <td>
        <div class="d-flex align-items-center gap-2">
          <div class="avatar" style="background:${avatarColor(i.nome)}">${iniciais(i.nome)}</div>
          <span>${i.nome}</span>
        </div>
      </td>
      <td>${i.esp}</td>
      <td>${i.email}</td>
      <td>${statusBadge(i.status)}</td>
      <td>
        <button class="btn btn-sm btn-outline-secondary me-1" onclick="editInstrutor(${i.id})">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete(${i.id},'instrutor')">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>`).join('');
}

function renderAlunosAdmin() {
  const tb = document.getElementById('tbody-alunos-admin');
  tb.innerHTML = alunos.map(a => `
    <tr>
      <td>
        <div class="d-flex align-items-center gap-2">
          <div class="avatar" style="background:${avatarColor(a.nome)}">${iniciais(a.nome)}</div>
          <span>${a.nome}</span>
        </div>
      </td>
      <td>${a.curso || '—'}</td>
      <td>${a.email}</td>
      <td>${statusBadge(a.status)}</td>
      <td>
        <button class="btn btn-sm btn-outline-secondary me-1" onclick="editAluno(${a.id})">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete(${a.id},'aluno')">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>`).join('');
}

function renderAlunosInstr() {
  const tb = document.getElementById('tbody-alunos-instr');
  tb.innerHTML = alunos.map(a => `
    <tr>
      <td>
        <div class="d-flex align-items-center gap-2">
          <div class="avatar" style="background:${avatarColor(a.nome)}">${iniciais(a.nome)}</div>
          <span>${a.nome}</span>
        </div>
      </td>
      <td>${a.curso || '—'}</td>
      <td>${a.email}</td>
      <td>${statusBadge(a.status)}</td>
      <td>
        <button class="btn btn-sm btn-outline-secondary me-1" onclick="editAlunoInstr(${a.id})">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete(${a.id},'aluno')">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>`).join('');
}

function renderTables() {
  renderInstrutores();
  renderAlunosAdmin();
}

function updateInstrCount() {
  document.getElementById('instr-count-alunos').textContent = alunos.length;
}

function preencherSeletorInstrutores() {
  const sel = document.getElementById('aluno-instrutor');
  if (!sel) return;
  sel.innerHTML =
    '<option value="">Selecionar instrutor...</option>' +
    instrutores.map(i => `<option value="${i.id}">${i.nome}</option>`).join('');
}

function salvarInstrutor() {
  const id    = document.getElementById('instr-edit-id').value;
  const nome  = document.getElementById('instr-nome').value.trim();
  const email = document.getElementById('instr-email').value.trim();
  const esp   = document.getElementById('instr-esp').value.trim();

  if (!nome || !email || !esp) {
    showToast('Preencha os campos obrigatórios (*)', 'var(--rose)');
    return;
  }

  const obj = {
    nome,
    email,
    tel:      document.getElementById('instr-tel').value,
    esp,
    formacao: document.getElementById('instr-formacao').value,
    status:   document.getElementById('instr-status').value,
    bio:      document.getElementById('instr-bio').value
  };

  if (id) {
    const idx = instrutores.findIndex(i => i.id == id);
    instrutores[idx] = { ...instrutores[idx], ...obj };
    showToast('Instrutor atualizado com sucesso!');
  } else {
    obj.id = nextInstrId++;
    instrutores.push(obj);
    showToast('Instrutor cadastrado com sucesso!');
  }

  limparFormInstr();
  adminTab('instrutores');
}

function editInstrutor(id) {
  const i = instrutores.find(x => x.id === id);
  document.getElementById('instr-edit-id').value  = id;
  document.getElementById('instr-nome').value      = i.nome;
  document.getElementById('instr-email').value     = i.email;
  document.getElementById('instr-tel').value       = i.tel;
  document.getElementById('instr-esp').value       = i.esp;
  document.getElementById('instr-formacao').value  = i.formacao;
  document.getElementById('instr-status').value    = i.status;
  document.getElementById('instr-bio').value       = i.bio;
  document.getElementById('form-instr-title').textContent = 'Editar Instrutor';
  adminTab('cad-instrutor');
}

function limparFormInstr() {
  document.getElementById('instr-edit-id').value = '';
  ['instr-nome', 'instr-email', 'instr-tel', 'instr-esp', 'instr-formacao', 'instr-bio']
    .forEach(id => document.getElementById(id).value = '');
  document.getElementById('instr-status').value = 'ativo';
  document.getElementById('form-instr-title').textContent = 'Cadastrar Instrutor';
}

function salvarAluno() {
  const id    = document.getElementById('aluno-edit-id').value;
  const nome  = document.getElementById('aluno-nome').value.trim();
  const email = document.getElementById('aluno-email').value.trim();

  if (!nome || !email) {
    showToast('Preencha os campos obrigatórios (*)', 'var(--rose)');
    return;
  }

  const obj = {
    nome,
    email,
    cpf:      document.getElementById('aluno-cpf').value,
    nasc:     document.getElementById('aluno-nasc').value,
    tel:      document.getElementById('aluno-tel').value,
    curso:    document.getElementById('aluno-curso').value,
    status:   document.getElementById('aluno-status').value,
    instrutor: document.getElementById('aluno-instrutor').value
  };

  if (id) {
    const idx = alunos.findIndex(a => a.id == id);
    alunos[idx] = { ...alunos[idx], ...obj };
    showToast('Aluno atualizado com sucesso!');
  } else {
    obj.id = nextAlunoId++;
    alunos.push(obj);
    showToast('Aluno cadastrado com sucesso!');
  }

  limparFormAluno();
  adminTab('alunos');
}

function editAluno(id) {
  const a = alunos.find(x => x.id === id);
  preencherSeletorInstrutores();
  document.getElementById('aluno-edit-id').value   = id;
  document.getElementById('aluno-nome').value       = a.nome;
  document.getElementById('aluno-email').value      = a.email;
  document.getElementById('aluno-cpf').value        = a.cpf  || '';
  document.getElementById('aluno-nasc').value       = a.nasc || '';
  document.getElementById('aluno-tel').value        = a.tel  || '';
  document.getElementById('aluno-curso').value      = a.curso || '';
  document.getElementById('aluno-status').value     = a.status;
  document.getElementById('aluno-instrutor').value  = a.instrutor || '';
  document.getElementById('form-aluno-title').textContent = 'Editar Aluno';
  adminTab('cad-aluno');
}

function limparFormAluno() {
  document.getElementById('aluno-edit-id').value = '';
  ['aluno-nome', 'aluno-email', 'aluno-cpf', 'aluno-nasc', 'aluno-tel']
    .forEach(id => document.getElementById(id).value = '');
  document.getElementById('aluno-curso').value  = '';
  document.getElementById('aluno-status').value = 'ativo';
  document.getElementById('form-aluno-title').textContent = 'Cadastrar Aluno';
}

function salvarAlunoInstr() {
  const id    = document.getElementById('aluno-instr-edit-id').value;
  const nome  = document.getElementById('aluno-instr-nome').value.trim();
  const email = document.getElementById('aluno-instr-email').value.trim();

  if (!nome || !email) {
    showToast('Preencha os campos obrigatórios (*)', 'var(--rose)');
    return;
  }

  const obj = {
    nome,
    email,
    cpf:       document.getElementById('aluno-instr-cpf').value,
    tel:       document.getElementById('aluno-instr-tel').value,
    curso:     document.getElementById('aluno-instr-curso').value,
    status:    document.getElementById('aluno-instr-status').value,
    instrutor: 1   
  };

  if (id) {
    const idx = alunos.findIndex(a => a.id == id);
    alunos[idx] = { ...alunos[idx], ...obj };
    showToast('Aluno atualizado com sucesso!');
  } else {
    obj.id = nextAlunoId++;
    alunos.push(obj);
    showToast('Aluno cadastrado com sucesso!');
  }

  limparFormAlunoInstr();
  instrTab('meus-alunos');
  updateInstrCount();
}

function editAlunoInstr(id) {
  const a = alunos.find(x => x.id === id);
  document.getElementById('aluno-instr-edit-id').value  = id;
  document.getElementById('aluno-instr-nome').value      = a.nome;
  document.getElementById('aluno-instr-email').value     = a.email;
  document.getElementById('aluno-instr-cpf').value       = a.cpf || '';
  document.getElementById('aluno-instr-tel').value       = a.tel || '';
  document.getElementById('aluno-instr-curso').value     = a.curso || '';
  document.getElementById('aluno-instr-status').value    = a.status;
  document.getElementById('form-aluno-instr-title').textContent = 'Editar Aluno';
  instrTab('cad-aluno-instr');
}

function limparFormAlunoInstr() {
  document.getElementById('aluno-instr-edit-id').value = '';
  ['aluno-instr-nome', 'aluno-instr-email', 'aluno-instr-cpf', 'aluno-instr-tel']
    .forEach(id => document.getElementById(id).value = '');
  document.getElementById('aluno-instr-curso').value  = '';
  document.getElementById('aluno-instr-status').value = 'ativo';
  document.getElementById('form-aluno-instr-title').textContent = 'Cadastrar Aluno';
}

function confirmDelete(id, tipo) {
  deleteTarget = id;
  deleteType   = tipo;
  deleteModal.show();
}

function executarDelete() {
  if (deleteType === 'instrutor') {
    instrutores = instrutores.filter(i => i.id !== deleteTarget);
    showToast('Instrutor excluído com sucesso.');
    renderInstrutores();
  } else {
    alunos = alunos.filter(a => a.id !== deleteTarget);
    showToast('Aluno excluído com sucesso.');
    renderAlunosAdmin();
    renderAlunosInstr();
    updateInstrCount();
  }
  deleteModal.hide();
}
