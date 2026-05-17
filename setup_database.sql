-- KOnect Database Setup
-- Execute este arquivo no phpMyAdmin ou MySQL Client para criar o banco de dados

-- Limpar banco de dados existente (opcional)
DROP DATABASE IF EXISTS konnect;

-- Criar banco de dados
CREATE DATABASE konnect;
USE konnect;

-- =============================================
-- 1. TABELAS SEM DEPENDÊNCIAS (AS "BASES")
-- =============================================

CREATE TABLE Academia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20),
    endereco VARCHAR(255)
);

CREATE TABLE Usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL
);

CREATE TABLE Graduacao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    corFaixa VARCHAR(50) NOT NULL,
    hierarquia VARCHAR(50),
    tempoMinimo INT
);

-- =============================================
-- 2. TABELAS QUE DEPENDEM DE USUARIO E ACADEMIA
-- =============================================

CREATE TABLE Admin (
    id_usuario INT PRIMARY KEY,
    nivel_acesso INT,
    academia_id INT,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id),
    FOREIGN KEY (academia_id) REFERENCES Academia(id)
);

CREATE TABLE Instrutor (
    id_usuario INT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone_responsavel VARCHAR(20),
    cpf CHAR(11),
    dataNascimento DATE,
    nome_fantasia VARCHAR(255),
    razao_social VARCHAR(255),
    cnpj CHAR(14),
    horario_abertura TIME,
    horario_fechamento TIME,
    periodo_contrato VARCHAR(100),
    renovacao_automatica TINYINT(1) DEFAULT 0,
    aceitou_termos TINYINT(1) DEFAULT 0,
    academia_id INT,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id),
    FOREIGN KEY (academia_id) REFERENCES Academia(id)
);

CREATE TABLE Aluno (
    id_usuario INT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    redeSocial VARCHAR(255),
    peso DOUBLE,
    dataNascimento DATE,
    horarioPreferencial TIME,
    tagCor VARCHAR(50),
    nivelCondicionamento INT DEFAULT 5,
    mesInicio DATE,
    plano VARCHAR(100),
    aceitou_termos TINYINT(1) DEFAULT 0,
    atestadoMedico TINYINT(1) DEFAULT 0,
    graduacao_id INT,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id),
    FOREIGN KEY (graduacao_id) REFERENCES Graduacao(id)
);

-- =============================================
-- 3. TABELAS DE NEGÓCIO
-- =============================================

CREATE TABLE Produto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    precoVenda DOUBLE,
    estoqueAtual INT,
    academia_id INT,
    FOREIGN KEY (academia_id) REFERENCES Academia(id)
);

CREATE TABLE Modalidade (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    cargaHoraria INT,
    academia_id INT,
    FOREIGN KEY (academia_id) REFERENCES Academia(id)
);

-- =============================================
-- 4. TURMAS E AULAS (DEPENDEM DE MODALIDADE E INSTRUTOR)
-- =============================================

CREATE TABLE Turma (
    codigoTurma INT AUTO_INCREMENT PRIMARY KEY,
    nivelTecnico VARCHAR(100),
    limiteAlunos INT,
    modalidade_id INT,
    instrutor_id INT,
    FOREIGN KEY (modalidade_id) REFERENCES Modalidade(id),
    FOREIGN KEY (instrutor_id) REFERENCES Instrutor(id_usuario)
);

-- Tabela de ligação Aluno <-> Turma (MUITOS PARA MUITOS)
CREATE TABLE Aluno_Turma (
    turma_id INT,
    aluno_id INT,
    PRIMARY KEY (turma_id, aluno_id),
    FOREIGN KEY (turma_id) REFERENCES Turma(codigoTurma),
    FOREIGN KEY (aluno_id) REFERENCES Aluno(id_usuario)
);

CREATE TABLE Aula (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dataHora DATETIME,
    conteudoTreinado VARCHAR(255),
    duracao TIME,
    turma_id INT,
    FOREIGN KEY (turma_id) REFERENCES Turma(codigoTurma)
);

-- =============================================
-- 5. MATRÍCULAS E EXAMES (DEPENDEM DE ALUNO)
-- =============================================

CREATE TABLE Matricula (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dataInicio DATE,
    status TINYINT(1) DEFAULT 1,
    status_matricula ENUM('Ativo', 'Inativo', 'Trancado', 'Pendente'),
    dataVencimento DATE,
    aluno_id INT,
    modalidade_id INT,
    academia_id INT,
    FOREIGN KEY (aluno_id) REFERENCES Aluno(id_usuario),
    FOREIGN KEY (modalidade_id) REFERENCES Modalidade(id),
    FOREIGN KEY (academia_id) REFERENCES Academia(id)
);

CREATE TABLE Mensalidade (
    id INT AUTO_INCREMENT PRIMARY KEY,
    valor INT,
    dataVencimento DATE,
    status TINYINT(1) DEFAULT 0,
    matricula_id INT UNIQUE,
    FOREIGN KEY (matricula_id) REFERENCES Matricula(id)
);

CREATE TABLE ExameFaixa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dataExame DATETIME,
    resultado TINYINT(1),
    notaFinal DOUBLE,
    aluno_id INT,
    graduacao_id INT,
    FOREIGN KEY (aluno_id) REFERENCES Aluno(id_usuario),
    FOREIGN KEY (graduacao_id) REFERENCES Graduacao(id)
);

-- =============================================
-- 6. FREQUÊNCIA (DEPENDE DE AULA E ALUNO)
-- =============================================

CREATE TABLE Frequencia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dataPresenca DATE,
    justificativa VARCHAR(255),
    presenca TINYINT(1) DEFAULT 0,
    aula_id INT,
    aluno_id INT,
    FOREIGN KEY (aula_id) REFERENCES Aula(id),
    FOREIGN KEY (aluno_id) REFERENCES Aluno(id_usuario)
);

ALTER TABLE Aluno ADD COLUMN status VARCHAR(20) DEFAULT 'Ativo';

-- =============================================
-- DADOS DE TESTE (Opcional)
-- =============================================

-- Inserir academias de teste
INSERT INTO Academia (nome, cnpj, endereco) VALUES
('Academia KOnect Central', '12345678901234', 'Rua Principal, 123'),
('Academia KOnect Norte', '98765432101234', 'Rua Norte, 456');

-- Inserir graduações
INSERT INTO Graduacao (corFaixa, hierarquia, tempoMinimo) VALUES
('Branca', '1', 0),
('Azul', '2', 6),
('Roxa', '3', 12),
('Marrom', '4', 18),
('Preta', '5', 24);

-- Inserir usuários de teste
INSERT INTO Usuario (email, senha) VALUES
('admin@konect.com', 'admin123'),
('instrutor@konect.com', 'instr123'),
('aluno@konect.com', 'aluno123');

-- Inserir admin de teste
INSERT INTO Admin (id_usuario, nivel_acesso, academia_id) VALUES
(1, 1, 1);

-- Inserir instrutor de teste
INSERT INTO Instrutor (id_usuario, nome, telefone_responsavel, cpf, dataNascimento, academia_id) VALUES
(2, 'João Silva', '11999999999', '12345678901', '1990-01-01', 1);

-- Inserir aluno de teste
INSERT INTO Aluno (id_usuario, nome, telefone, peso, mesInicio, graduacao_id, status) VALUES
(3, 'Pedro Santos', '11987654321', 75.5, '2024-01-15', 1, 'Ativo');

-- Inserir modalidade de teste
INSERT INTO Modalidade (tipo, descricao, cargaHoraria, academia_id) VALUES
('Karatê', 'Aulas de Karatê tradicional', 60, 1),
('Judô', 'Aulas de Judô', 90, 1),
('Taekwondo', 'Aulas de Taekwondo', 60, 1);

-- Inserir turma de teste
INSERT INTO Turma (nivelTecnico, limiteAlunos, modalidade_id, instrutor_id) VALUES
('Iniciante', 15, 1, 2);

-- Inserir aluno na turma
INSERT INTO Aluno_Turma (turma_id, aluno_id) VALUES
(1, 3);

-- Inserir matrícula de teste
INSERT INTO Matricula (dataInicio, status_matricula, aluno_id, modalidade_id, academia_id) VALUES
('2024-01-15', 'Ativo', 3, 1, 1);

-- Inserir mensalidade de teste
INSERT INTO Mensalidade (valor, dataVencimento, status, matricula_id) VALUES
(300, '2024-02-15', 0, 1);

COMMIT;

-- =============================================
-- VERIFICAÇÃO
-- =============================================

-- Verificar se as tabelas foram criadas
SHOW TABLES;

-- Verificar dados de teste
SELECT 'Academias:' as info;
SELECT * FROM Academia;

SELECT 'Usuários:' as info;
SELECT * FROM Usuario;

SELECT 'Admins:' as info;
SELECT * FROM Admin;

SELECT 'Instrutores:' as info;
SELECT * FROM Instrutor;

SELECT 'Alunos:' as info;
SELECT * FROM Aluno;

SELECT 'Modalidades:' as info;
SELECT * FROM Modalidade;

SELECT 'Turmas:' as info;
SELECT * FROM Turma;

SELECT 'Matrículas:' as info;
SELECT * FROM Matricula;
