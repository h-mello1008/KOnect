# Funcionalidade de Mensalidades - KOnect

## Descrição

Esta funcionalidade permite que alunos visualizem suas mensalidades pendentes de pagamento na plataforma KOnect. O sistema exibe claramente:

- Quantos dias cada mensalidade está vencida
- O valor a pagar
- A data de vencimento
- O status (Pendente, Vencido ou Pago)
- Um resumo consolidado do total vencido e pendente

## Arquivos Implementados

### Backend (PHP)
- `php/aluno/mensalidade_get.php` - Endpoint que busca mensalidades do aluno autenticado

### Frontend (JavaScript)
- `js/aluno/mensalidade_aluno.js` - Script que exibe e formata as mensalidades

### Frontend (HTML/CSS)
- `pages/aluno/pagamentos/index.html` - Página para visualizar pagamentos
- `pages/aluno/pagamentos/style.css` - Estilos da página

## Como Usar

### Para Alunos

1. **Acessar página de pagamentos:**
   - Fazer login como aluno
   - Clicar em "Pagamentos" no menu lateral
   - Visualizar todas as mensalidades

2. **Interpretar a página:**
   - **Resumo no topo** mostra total vencido, pendente e geral
   - **Mensalidades vencidas** aparecem primeiro em vermelho
   - **Mensalidades pendentes** aparecem em azul
   - Cada card mostra:
     - Mês de referência (Ex: Maio de 2026)
     - Valor em R$
     - Data de vencimento
     - Quantos dias vencida/restantes
     - Academia e modalidade

### Exemplo de Card Vencido
```
┌─────────────────────────────────┐
│ Maio de 2026          [VENCIDO]  │
│ Karatê                           │
│                                   │
│ Valor: R$ 300,00                 │
│ Vencimento: 18 de maio de 2026   │
│ Academia: Academia KOnect        │
│                                   │
│     [ PAGAR AGORA ]              │
└─────────────────────────────────┘
```

## Estrutura do Banco de Dados

### Tabela: Mensalidade

```sql
CREATE TABLE Mensalidade (
    id INT AUTO_INCREMENT PRIMARY KEY,
    valor DECIMAL(10, 2) NOT NULL,
    dataLancamento DATE DEFAULT CURRENT_DATE,
    mes_referencia VARCHAR(7),                 -- Formato: YYYY-MM
    dataVencimento DATE NOT NULL,
    status_pagamento ENUM('Pendente', 'Pago', 'Vencido') DEFAULT 'Pendente',
    data_pagamento DATE,
    matricula_id INT,
    academia_id INT,
    UNIQUE KEY unique_matricula_mes (matricula_id, mes_referencia),
    FOREIGN KEY (matricula_id) REFERENCES Matricula(id),
    FOREIGN KEY (academia_id) REFERENCES Academia(id)
);
```

### Campos Explicados

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT | ID único da mensalidade |
| `valor` | DECIMAL | Valor em reais (ex: 300.00) |
| `dataLancamento` | DATE | Data em que foi gerada |
| `mes_referencia` | VARCHAR | Mês que se refere (ex: 2026-05) |
| `dataVencimento` | DATE | Data de vencimento |
| `status_pagamento` | ENUM | Pendente, Pago ou Vencido |
| `data_pagamento` | DATE | Quando foi pago |
| `matricula_id` | INT | Referência à matrícula do aluno |
| `academia_id` | INT | Referência à academia |

## Como Adicionar Mensalidades Manualmente

### Via MySQL/phpMyAdmin

```sql
INSERT INTO Mensalidade 
(valor, dataLancamento, mes_referencia, dataVencimento, status_pagamento, matricula_id, academia_id)
VALUES 
(300.00, '2026-05-05', '2026-05', '2026-05-10', 'Pendente', 1, 1);
```

### Valores Recomendados

- **dataVencimento**: Geralmente no dia 10 do mês
- **dataLancamento**: Data em que foi lançada (hoje ou primeiro dia útil)
- **mes_referencia**: Mês de referência no formato YYYY-MM

### Exemplo Completo

```sql
-- Adicionar mensalidade de maio de 2026 para o aluno ID 3
INSERT INTO Mensalidade 
(valor, dataLancamento, mes_referencia, dataVencimento, status_pagamento, matricula_id, academia_id)
VALUES 
(300.00, '2026-05-05', '2026-05', '2026-05-10', 'Pendente', 1, 1);

-- Adicionar mensalidade vencida (de abril)
INSERT INTO Mensalidade 
(valor, dataLancamento, mes_referencia, dataVencimento, status_pagamento, matricula_id, academia_id)
VALUES 
(300.00, '2026-04-05', '2026-04', '2026-04-10', 'Vencido', 1, 1);

-- Adicionar mensalidade já paga
INSERT INTO Mensalidade 
(valor, dataLancamento, mes_referencia, dataVencimento, status_pagamento, data_pagamento, matricula_id, academia_id)
VALUES 
(300.00, '2026-03-05', '2026-03', '2026-03-10', 'Pago', '2026-03-08', 1, 1);
```

## Cálculo de Dias Vencida

O sistema calcula automaticamente quantos dias cada mensalidade está vencida ou quanto tempo falta:

```
dias_vencimento = HOJE - DATA_VENCIMENTO

- Se dias_vencimento > 0 → "X dias vencido"
- Se dias_vencimento < 0 → "X dias para vencer"
- Se dias_vencimento = 0 → "Vence hoje!"
```

### Exemplos

- Vencimento: 10/05/2026 → Hoje: 18/05/2026 → **8 dias vencido**
- Vencimento: 25/05/2026 → Hoje: 18/05/2026 → **7 dias para vencer**
- Vencimento: 18/05/2026 → Hoje: 18/05/2026 → **Vence hoje!**

## Fluxo de Dados

```
Aluno login → Dashboard
         ↓
Clica em "Pagamentos"
         ↓
Acessa /pages/aluno/pagamentos/index.html
         ↓
Javascript valida sessão via dashboard_aluno.js
         ↓
GET request para /php/aluno/mensalidade_get.php
         ↓
PHP valida sessão e busca mensalidades do BD
         ↓
Retorna JSON com dados das mensalidades
         ↓
Javascript agrupa por status
         ↓
Renderiza cards visuais
```

### Resposta da API

```json
{
  "status": "ok",
  "mensagem": "Mensalidades encontradas",
  "data": [
    {
      "id": 1,
      "valor": 300.00,
      "dataLancamento": "2026-05-05",
      "mes_referencia": "2026-05",
      "dataVencimento": "2026-05-10",
      "status_pagamento": "Vencido",
      "academia_nome": "Academia KOnect Central",
      "modalidade_tipo": "Karatê",
      "dias_vencimento": 8,
      "dias_atraso": 8,
      "status_display": "Vencido"
    }
  ]
}
```

## Status das Mensalidades

### Pendente
- Não venceu ainda
- Mostrado em azul
- Exibe "X dias para vencer"

### Vencido
- Passou da data de vencimento
- Mostrado em vermelho
- Exibe "X dias vencido"

### Pago
- Já foi pago
- Não aparece na lista de pendentes
- Status pode ser atualizado manualmente no BD

## Atualizar Status de Pagamento

Quando o aluno pagar a mensalidade, atualize o registro:

```sql
UPDATE Mensalidade 
SET status_pagamento = 'Pago', 
    data_pagamento = CURDATE() 
WHERE id = 1;
```

## Recursos Futuros

- [ ] Integração com gateway de pagamento
- [ ] Gerar boleto/PIX automaticamente
- [ ] Notificações por email de vencimento
- [ ] Relatório de pagamentos
- [ ] Desconto para pagamento adiantado
- [ ] Planos de parcelamento

## Notas Técnicas

- Utiliza `session_start()` para validar autenticação
- Todas as datas em formato YYYY-MM-DD
- Valores monetários em DECIMAL(10,2) para precisão
- Interface responsiva com Bootstrap 5.3.3
- Formatação de datas em português no frontend
