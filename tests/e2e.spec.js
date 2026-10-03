import { test, expect } from '@playwright/test';

test.describe('IT Mentor Platform E2E', () => {

  // Очищаем localStorage перед каждым тестом, чтобы начать "с чистого листа"
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
  });

  test('Студент может войти и увидеть дашборд', async ({ page }) => {
    // Ввод данных
    await page.fill('#loginEmail', 'student');
    await page.fill('#loginPassword', '123');
    await page.click('button[type="submit"]');

    // Проверка перехода
    await expect(page.locator('#view-student-dashboard')).toBeVisible();
    await expect(page.locator('#studentWelcome')).toContainText('Привет, Иван Иванов!');

    // Переход к курсу
    await page.click('button:has-text("Продолжить обучение")');
    await expect(page.locator('#view-lesson')).toBeVisible();
    await expect(page.locator('#lessonTitle')).toContainText('Модуль 3. Принципы ООП и SOLID');
  });

  test('Ментор может войти и проверить ДЗ', async ({ page }) => {
    await page.fill('#loginEmail', 'mentor');
    await page.fill('#loginPassword', '123');
    await page.click('button[type="submit"]');

    await expect(page.locator('#view-mentor-dashboard')).toBeVisible();
    await expect(page.locator('.hw-list')).toContainText('ДЗ 2: Локаторы (XPATH)');
    
    // Клик "Проверить"
    const checkBtn = page.locator('#btn-101');
    await checkBtn.click();
    
    // Ждем, пока кнопка исчезнет (замокана задержка в script.js)
    await expect(checkBtn).toBeHidden({ timeout: 2000 });
    // Значок должен стать "Проверено"
    await expect(page.locator('#badge-101')).toHaveText('Проверено (5/5)');
  });

  test('Ошибка при неверном логине', async ({ page }) => {
    await page.fill('#loginEmail', 'student');
    await page.fill('#loginPassword', 'wrongpass');
    await page.click('button[type="submit"]');

    await expect(page.locator('#loginError')).toHaveText('Неверный логин или пароль!');
  });
});
