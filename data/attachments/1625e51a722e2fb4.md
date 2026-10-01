# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.js >> IT Mentor Platform E2E >> Ментор может войти и проверить ДЗ
- Location: tests\e2e.spec.js:28:7

# Error details

```
Error: expect(locator).toBeHidden() failed

Locator:  locator('button:has-text("Проверить")').first()
Expected: hidden
Received: visible
Timeout:  2000ms

Call log:
  - Expect "toBeHidden" locator('button:has-text("Проверить")').first() with timeout 2000ms
  - waiting for locator('button:has-text("Проверить")').first()
    20 × locator resolved to <button id="btn-102" class="btn primary" onclick="app.checkHw(102)">Проверить</button>
       - unexpected value "visible"

```

```yaml
- button "Проверить"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('IT Mentor Platform E2E', () => {
  4  | 
  5  |   // Очищаем localStorage перед каждым тестом, чтобы начать "с чистого листа"
  6  |   test.beforeEach(async ({ page }) => {
  7  |     await page.goto('/');
  8  |     await page.evaluate(() => window.localStorage.clear());
  9  |     await page.reload();
  10 |   });
  11 | 
  12 |   test('Студент может войти и увидеть дашборд', async ({ page }) => {
  13 |     // Ввод данных
  14 |     await page.fill('#loginEmail', 'student');
  15 |     await page.fill('#loginPassword', '123');
  16 |     await page.click('button[type="submit"]');
  17 | 
  18 |     // Проверка перехода
  19 |     await expect(page.locator('#view-student-dashboard')).toBeVisible();
  20 |     await expect(page.locator('#studentWelcome')).toContainText('Привет, Иван Иванов!');
  21 | 
  22 |     // Переход к курсу
  23 |     await page.click('button:has-text("Продолжить обучение")');
  24 |     await expect(page.locator('#view-lesson')).toBeVisible();
  25 |     await expect(page.locator('#lessonTitle')).toContainText('Введение в QA');
  26 |   });
  27 | 
  28 |   test('Ментор может войти и проверить ДЗ', async ({ page }) => {
  29 |     await page.fill('#loginEmail', 'mentor');
  30 |     await page.fill('#loginPassword', '123');
  31 |     await page.click('button[type="submit"]');
  32 | 
  33 |     await expect(page.locator('#view-mentor-dashboard')).toBeVisible();
  34 |     await expect(page.locator('.hw-list')).toContainText('ДЗ 2: Локаторы (XPATH)');
  35 |     
  36 |     // Клик "Проверить"
  37 |     const checkBtn = page.locator('button:has-text("Проверить")').first();
  38 |     await checkBtn.click();
  39 |     
  40 |     // Ждем, пока кнопка исчезнет (замокана задержка в script.js)
> 41 |     await expect(checkBtn).toBeHidden({ timeout: 2000 });
     |                            ^ Error: expect(locator).toBeHidden() failed
  42 |     // Значок должен стать "Проверено"
  43 |     await expect(page.locator('.badge.success').first()).toHaveText('Проверено (5/5)');
  44 |   });
  45 | 
  46 |   test('Ошибка при неверном логине', async ({ page }) => {
  47 |     await page.fill('#loginEmail', 'student');
  48 |     await page.fill('#loginPassword', 'wrongpass');
  49 |     await page.click('button[type="submit"]');
  50 | 
  51 |     await expect(page.locator('#loginError')).toHaveText('Неверный логин или пароль!');
  52 |   });
  53 | });
  54 | 
```