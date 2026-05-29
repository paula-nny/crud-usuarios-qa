# CRUD de Usuários — Teste Técnico QA Coude

Sistema simples de cadastro de usuários com Flask + SQLite.  
Inclui testes automatizados com Playwright.

---

## Como rodar a aplicação

### 1. Instalar dependências Python
```bash
pip install -r requirements.txt
```

### 2. Iniciar o servidor
```bash
python app.py
```

Acesse: http://localhost:3000

---

## Como rodar os testes automatizados

### 1. Instalar dependências Node.js
```bash
npm install
npx playwright install chromium
```

### 2. Executar os testes (com o servidor rodando)
```bash
npm test
```

### 3. Ver relatório HTML
```bash
npm run test:report
```

---

## Estrutura do projeto

```
crud-usuarios/
  app.py                  # Aplicação Flask (CRUD)
  requirements.txt        # Dependências Python
  usuarios.db             # Banco SQLite (gerado automaticamente)
  templates/
    base.html             # Layout base
    lista.html            # Listagem de usuários
    form.html             # Formulário criar/editar
  tests/
    usuarios.spec.js      # Casos de teste Playwright
  playwright.config.js    # Configuração do Playwright
  package.json            # Dependências Node.js
```

---

## Operações disponíveis

| Rota | Método | Descrição |
|------|--------|-----------|
| `/usuarios` | GET | Lista todos os usuários |
| `/novo` | GET/POST | Cria novo usuário |
| `/editar/<id>` | GET/POST | Edita usuário |
| `/deletar/<id>` | POST | Deleta usuário |
