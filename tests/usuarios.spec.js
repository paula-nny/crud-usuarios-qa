const { test, expect } = require('@playwright/test');

test.describe('CRUD Cadastro de Usuários', () => {

  // CT-001: Cadastro com dados válidos
  test('CT-001 - Deve criar usuário com dados válidos', async ({ page }) => {
    await page.goto('/novo');
    await page.fill('[data-testid="nome"]', 'Maria Silva');
    await page.fill('[data-testid="email"]', `maria${Date.now()}@email.com`);
    await page.fill('[data-testid="senha"]', 'Senha@1234');
    await page.click('[data-testid="btn-salvar"]');
    await expect(page.locator('[data-testid="msg-sucesso"]'))
      .toContainText('criado com sucesso');
  });

  // CT-002: Cadastro sem nome
  test('CT-002 - Deve exibir erro ao omitir o nome', async ({ page }) => {
    await page.goto('/novo');
    await page.fill('[data-testid="email"]', 'teste@email.com');
    await page.fill('[data-testid="senha"]', 'Senha@1234');
    await page.click('[data-testid="btn-salvar"]');
    await expect(page.locator('[data-testid="erro-nome"]'))
      .toContainText('obrigatório');
  });

  // CT-003: E-mail inválido
  test('CT-003 - Deve exibir erro com e-mail inválido', async ({ page }) => {
    await page.goto('/novo');
    await page.fill('[data-testid="nome"]', 'João');
    await page.fill('[data-testid="email"]', 'emailsemarroba');
    await page.fill('[data-testid="senha"]', 'Senha@1234');
    await page.click('[data-testid="btn-salvar"]');
    await expect(page.locator('[data-testid="erro-email"]'))
      .toContainText('inválido');
  });

  // CT-004: E-mail duplicado
  test('CT-004 - Deve exibir erro com e-mail duplicado', async ({ page }) => {
    const email = `dup${Date.now()}@email.com`;
    // Cria o primeiro
    await page.goto('/novo');
    await page.fill('[data-testid="nome"]', 'Primeiro');
    await page.fill('[data-testid="email"]', email);
    await page.fill('[data-testid="senha"]', 'Senha@1234');
    await page.click('[data-testid="btn-salvar"]');
    // Tenta criar com o mesmo e-mail
    await page.goto('/novo');
    await page.fill('[data-testid="nome"]', 'Segundo');
    await page.fill('[data-testid="email"]', email);
    await page.fill('[data-testid="senha"]', 'Senha@1234');
    await page.click('[data-testid="btn-salvar"]');
    await expect(page.locator('[data-testid="erro-email"]'))
      .toContainText('já cadastrado');
  });

  // CT-005: Senha curta
  test('CT-005 - Deve exibir erro com senha menor que 8 caracteres', async ({ page }) => {
    await page.goto('/novo');
    await page.fill('[data-testid="nome"]', 'Teste');
    await page.fill('[data-testid="email"]', 'curta@email.com');
    await page.fill('[data-testid="senha"]', '123');
    await page.click('[data-testid="btn-salvar"]');
    await expect(page.locator('[data-testid="erro-senha"]'))
      .toContainText('mínimo 8');
  });

  // CT-006: Listar usuários
  test('CT-006 - Deve exibir lista de usuários', async ({ page }) => {
    await page.goto('/usuarios');
    const items = page.locator('[data-testid="usuario-item"]');
    await expect(items.first()).toBeVisible();
  });

  // CT-009: Editar usuário
  test('CT-009 - Deve editar nome do usuário com sucesso', async ({ page }) => {
    await page.goto('/usuarios');
    await page.locator('[data-testid="btn-editar"]').first().click();
    await page.fill('[data-testid="nome"]', 'Nome Atualizado');
    await page.click('[data-testid="btn-salvar"]');
    await expect(page.locator('[data-testid="msg-sucesso"]'))
      .toContainText('atualizado com sucesso');
  });

  // CT-011: Cancelar edição
  test('CT-011 - Deve cancelar edição e voltar para lista', async ({ page }) => {
    await page.goto('/usuarios');
    await page.locator('[data-testid="btn-editar"]').first().click();
    await page.click('[data-testid="btn-cancelar"]');
    await expect(page).toHaveURL('/usuarios');
  });

  // CT-012: Deletar com confirmação
  test('CT-012 - Deve deletar usuário após confirmação', async ({ page }) => {
    // Cria um usuário para deletar
    await page.goto('/novo');
    await page.fill('[data-testid="nome"]', 'Para Deletar');
    await page.fill('[data-testid="email"]', `delete${Date.now()}@email.com`);
    await page.fill('[data-testid="senha"]', 'Senha@1234');
    await page.click('[data-testid="btn-salvar"]');

    await page.goto('/usuarios');
    const totalAntes = await page.locator('[data-testid="usuario-item"]').count();
    await page.locator('[data-testid="btn-deletar"]').last().click();
    await page.locator('[data-testid="btn-confirmar"]').click();
    await expect(page.locator('[data-testid="usuario-item"]'))
      .toHaveCount(totalAntes - 1);
  });

  // CT-013: Cancelar deleção
  test('CT-013 - Deve cancelar deleção e manter usuário', async ({ page }) => {
    await page.goto('/usuarios');
    const totalAntes = await page.locator('[data-testid="usuario-item"]').count();
    await page.locator('[data-testid="btn-deletar"]').first().click();
    await page.locator('[data-testid="btn-cancelar"]').click();
    await expect(page.locator('[data-testid="usuario-item"]'))
      .toHaveCount(totalAntes);
  });

});
