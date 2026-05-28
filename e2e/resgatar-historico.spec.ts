import { test, expect } from '@playwright/test';

// F1 — Eye no histórico abre /ficha/pf|pj/:id, não modal interno
// F2 — Fichas arquivadas são read-only

// Smoke sem auth: rotas da expanded ficha redirecionam para login
test('F1-smoke — /ficha/pf/:id sem sessão → redireciona para login', async ({ page }) => {
  await page.goto('/ficha/pf/00000000-0000-0000-0000-000000000000');
  await page.waitForURL(/\/login/, { timeout: 8_000 });
  await expect(page.url()).toContain('/login');
});

test('F1-smoke — /ficha/pj/:id sem sessão → redireciona para login', async ({ page }) => {
  await page.goto('/ficha/pj/00000000-0000-0000-0000-000000000000');
  await page.waitForURL(/\/login/, { timeout: 8_000 });
  await expect(page.url()).toContain('/login');
});

test('F1-smoke — /historico sem sessão → redireciona para login', async ({ page }) => {
  await page.goto('/historico');
  await page.waitForURL(/\/login/, { timeout: 8_000 });
  await expect(page.url()).toContain('/login');
});

// Garante que o ?card= query param é aceito sem 404
test('F1-smoke — /ficha/pf/:id?card=:cardId sem sessão → redireciona para login (não 404)', async ({ page }) => {
  const res = await page.goto(
    '/ficha/pf/00000000-0000-0000-0000-000000000000?card=11111111-1111-1111-1111-111111111111',
  );
  // Deve redirecionar para login, não retornar 404
  await page.waitForURL(/\/login/, { timeout: 8_000 });
  expect(page.url()).toContain('/login');
  // Garante que não foi uma página de erro 404
  await expect(page.locator('input[type="email"]')).toBeVisible();
});
