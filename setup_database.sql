DROP DATABASE IF EXISTS konnect;

CREATE DATABASE konnect;
USE konnect;

CREATE TABLE Academia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20),
    endereco VARCHAR(255),
    status_ativo TINYINT(1) DEFAULT 1,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    status VARCHAR(20) DEFAULT 'Ativo',
    instrutor_id INT,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id),
    FOREIGN KEY (graduacao_id) REFERENCES Graduacao(id),
    FOREIGN KEY (instrutor_id) REFERENCES Instrutor(id_usuario)
);

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

CREATE TABLE GraduacaoRegra (
    id INT AUTO_INCREMENT PRIMARY KEY,
    graduacao_id INT NOT NULL,
    modalidade_id INT NOT NULL,
    tempoMinimo INT DEFAULT 0,
    descricao VARCHAR(255),
    requisitos VARCHAR(500),
    pontuacaoMinima INT DEFAULT 0,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (graduacao_id) REFERENCES Graduacao(id),
    FOREIGN KEY (modalidade_id) REFERENCES Modalidade(id),
    UNIQUE KEY unique_grad_mod (graduacao_id, modalidade_id)
);

CREATE TABLE Turma (
    codigoTurma INT AUTO_INCREMENT PRIMARY KEY,
    nivelTecnico VARCHAR(100),
    limiteAlunos INT,
    modalidade_id INT,
    instrutor_id INT,
    FOREIGN KEY (modalidade_id) REFERENCES Modalidade(id),
    FOREIGN KEY (instrutor_id) REFERENCES Instrutor(id_usuario)
);

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
    valor DECIMAL(10, 2) NOT NULL,
    dataLancamento DATE DEFAULT (
        IF(DAY(CURDATE()) > 5,
            LAST_DAY(CURDATE()) + INTERVAL 5 DAY,
            LAST_DAY(CURDATE() - INTERVAL 1 MONTH) + INTERVAL 5 DAY
        )
    ),
    mes_referencia VARCHAR(7),
    dataVencimento DATE NOT NULL,
    status_pagamento ENUM('Pendente', 'Pago', 'Vencido') DEFAULT 'Pendente',
    data_pagamento DATE,
    matricula_id INT,
    academia_id INT,
    UNIQUE KEY unique_matricula_mes (matricula_id, mes_referencia),
    FOREIGN KEY (matricula_id) REFERENCES Matricula(id),
    FOREIGN KEY (academia_id) REFERENCES Academia(id)
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

CREATE TABLE IF NOT EXISTS Avisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    instrutor_id INT,
    academia_id INT NOT NULL,
    ativo TINYINT(1) DEFAULT 1,
    FOREIGN KEY (instrutor_id) REFERENCES Instrutor(id_usuario),
    FOREIGN KEY (academia_id) REFERENCES Academia(id)
);

CREATE TABLE IF NOT EXISTS Agenda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dia VARCHAR(3) NOT NULL,
    hora TIME NOT NULL,
    modalidade VARCHAR(255) NOT NULL,
    instrutor_id INT NOT NULL,
    academia_id INT NOT NULL,
    ativo TINYINT(1) DEFAULT 1,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instrutor_id) REFERENCES Instrutor(id_usuario),
    FOREIGN KEY (academia_id) REFERENCES Academia(id)
);

INSERT INTO Academia (nome, cnpj, endereco, status_ativo) VALUES
('Academia KOnect Central', '12345678901234', 'Rua Principal, 123', 1),
('Academia KOnect Norte', '98765432101234', 'Rua Norte, 456', 1),
('Academia KOnect Sul', '11111111111111', 'Avenida Sul, 789', 1),
('Academia KOnect Leste', '22222222222222', 'Rua Leste, 321', 0);

INSERT INTO Graduacao (corFaixa, hierarquia, tempoMinimo) VALUES
('Branca', '1', 0),
('Azul', '2', 6),
('Roxa', '3', 12),
('Marrom', '4', 18),
('Preta', '5', 24);

INSERT INTO Usuario (email, senha) VALUES
('admin@konect.com', 'admin123'),
('instrutor@konect.com', 'instr123'),
('aluno@konect.com', 'aluno123'),
('aluno2@konect.com', 'aluno123'),
('aluno3@konect.com', 'aluno123');

INSERT INTO Admin (id_usuario, nivel_acesso, academia_id) VALUES
(1, 1, 1);

INSERT INTO Instrutor (id_usuario, nome, telefone_responsavel, cpf, dataNascimento, academia_id) VALUES
(2, 'João Silva', '11999999999', '12345678901', '1990-01-01', 1);

INSERT INTO Aluno (id_usuario, nome, telefone, peso, mesInicio, graduacao_id, status, instrutor_id) VALUES
(3, 'Pedro Santos', '11987654321', 75.5, '2024-01-15', 1, 'Ativo', 2),
(4, 'Maria Silva', '11987654322', 62.3, '2024-02-10', 1, 'Ativo', 2),
(5, 'Carlos Oliveira', '11987654323', 88.5, '2024-01-20', 2, 'Ativo', 2);

INSERT INTO Modalidade (tipo, descricao, cargaHoraria, academia_id) VALUES
('Karatê', 'Aulas de Karatê tradicional', 60, 1),
('Judô', 'Aulas de Judô', 90, 1),
('Taekwondo', 'Aulas de Taekwondo', 60, 1),
('Kung Fu', 'Aulas de Kung Fu', 75, 1),
('Muay Thai', 'Aulas de Muay Thai', 60, 2);

INSERT INTO GraduacaoRegra (graduacao_id, modalidade_id, tempoMinimo, descricao, requisitos, pontuacaoMinima) VALUES
(1, 1, 0, 'Iniciante em Karatê', 'Dominar postura básica e golpes fundamentais', 0),
(2, 1, 6, 'Intermediário em Karatê', 'Dominar kumites básicos e katas fundamentais', 70),
(3, 1, 12, 'Avançado em Karatê', 'Completar todos os katas e kumites intermediários', 85),
(1, 2, 0, 'Iniciante em Judô', 'Dominar os movimentos básicos de queda', 0),
(2, 2, 8, 'Intermediário em Judô', 'Dominar os técnicas de projeção e solo', 75),
(3, 2, 16, 'Avançado em Judô', 'Competição e técnicas avançadas', 85),
(1, 3, 0, 'Iniciante em Taekwondo', 'Dominar postura e chutes básicos', 0),
(2, 3, 6, 'Intermediário em Taekwondo', 'Formas básicas e sparring controlado', 70),
(3, 3, 12, 'Avançado em Taekwondo', 'Competição e formas avançadas', 85);

INSERT INTO Turma (nivelTecnico, limiteAlunos, modalidade_id, instrutor_id) VALUES
('Iniciante', 15, 1, 2),
('Intermediário', 12, 1, 2),
('Iniciante', 18, 2, 2);

INSERT INTO Aluno_Turma (turma_id, aluno_id) VALUES
(1, 3),
(1, 4),
(2, 5);

INSERT INTO Matricula (dataInicio, status_matricula, aluno_id, modalidade_id, academia_id) VALUES
('2024-01-15', 'Ativo', 3, 1, 1),
('2024-02-10', 'Ativo', 4, 1, 1),
('2024-01-20', 'Ativo', 5, 2, 1);

INSERT INTO Mensalidade (valor, dataLancamento, mes_referencia, dataVencimento, status_pagamento, data_pagamento, matricula_id, academia_id) VALUES
(300.00, DATE_SUB(CURDATE(), INTERVAL 65 DAY), DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 2 MONTH), '%Y-%m'), DATE_SUB(CURDATE(), INTERVAL 55 DAY), 'Pago', DATE_SUB(CURDATE(), INTERVAL 50 DAY), 1, 1),
(300.00, DATE_SUB(CURDATE(), INTERVAL 35 DAY), DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), DATE_SUB(CURDATE(), INTERVAL 25 DAY), 'Vencido', NULL, 1, 1),
(300.00, CURDATE(), DATE_FORMAT(CURDATE(), '%Y-%m'), DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Pendente', NULL, 1, 1),
(300.00, DATE_SUB(CURDATE(), INTERVAL 35 DAY), DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), DATE_SUB(CURDATE(), INTERVAL 25 DAY), 'Pago', DATE_SUB(CURDATE(), INTERVAL 20 DAY), 2, 1),
(300.00, CURDATE(), DATE_FORMAT(CURDATE(), '%Y-%m'), DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Pendente', NULL, 2, 1),
(350.00, DATE_SUB(CURDATE(), INTERVAL 65 DAY), DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 2 MONTH), '%Y-%m'), DATE_SUB(CURDATE(), INTERVAL 55 DAY), 'Pago', DATE_SUB(CURDATE(), INTERVAL 52 DAY), 3, 1),
(350.00, DATE_SUB(CURDATE(), INTERVAL 35 DAY), DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), DATE_SUB(CURDATE(), INTERVAL 25 DAY), 'Pago', DATE_SUB(CURDATE(), INTERVAL 22 DAY), 3, 1),
(350.00, CURDATE(), DATE_FORMAT(CURDATE(), '%Y-%m'), DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Pendente', NULL, 3, 1);

COMMIT;

SHOW TABLES;
