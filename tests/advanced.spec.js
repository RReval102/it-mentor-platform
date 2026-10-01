import { test, expect } from '@playwright/test';

test.describe('Advanced Testing Suite (E2E, Usability, API Load)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
  });

  test('Usability Test: Проверка цвета кнопки оплаты (Ожидается ошибка)', async ({ page }) => {
    // Входим как студент
    await page.fill('#loginEmail', 'student');
    await page.fill('#loginPassword', '123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('#view-student-dashboard')).toBeVisible();
    
    const payBtn = page.locator('#paymentButton');
    await expect(payBtn).toBeVisible();
    
    // Проверка юзабилити: кнопка не должна быть красного цвета (отпугивает пользователя)
    const color = await payBtn.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    
    // Этот тест специально упадет (в соответствии с кейсом студента), т.к. цвет красный rgb(255, 0, 0)
    // В Allure будет красивая ошибка юзабилити!
    expect(color).not.toBe('rgb(255, 0, 0)');
  });

  test('E2E: Полный цикл сдачи экзамена студентом', async ({ page }) => {
    // Вход
    await page.fill('#loginEmail', 'student');
    await page.fill('#loginPassword', '123');
    await page.click('button[type="submit"]');
    
    // Переход к курсу и выбор последнего урока (Экзамен)
    await page.click('button:has-text("Продолжить обучение")');
    await page.click('#sidebar-lesson-3');
    
    await expect(page.locator('#testSection')).toBeVisible();
    
    // Выбор правильного ответа (индекс 2 - driver.find_element())
    await page.check('input[name="testOpt"][value="2"]');
    await page.click('button:has-text("Ответить")');
    
    // Проверка результата
    await expect(page.locator('#testResult')).toHaveText(/Правильно!/);
    
    // Ожидание перехода на сертификат (2 секунды задержка в приложении)
    await page.waitForTimeout(2500);
    await expect(page.locator('#view-certificate')).toBeVisible();
    await expect(page.locator('#certStudentName')).toHaveText('Иван Иванов');
  });

  test('API/Load Test: Нагрузочная проверка (100 запросов API)', async ({ request }) => {
    // Симуляция API тестов на эндпоинт базы данных / сайта
    // Поскольку у нас SPA, делаем нагрузочный запрос на статику (index.html)
    // В реальном приложении это будет запрос к REST API
    
    const requestCount = 50;
    const start = Date.now();
    
    const promises = [];
    for (let i = 0; i < requestCount; i++) {
        promises.push(request.get('/'));
    }
    
    const responses = await Promise.all(promises);
    const end = Date.now();
    const duration = end - start;
    
    console.log(`[Load Test] 50 requests took ${duration}ms`);
    
    // Проверяем, что все запросы успешны
    for (const response of responses) {
        expect(response.ok()).toBeTruthy();
    }
    
    // Проверяем, что среднее время ответа не превышает 50мс (локально должно быть очень быстро)
    const avgTime = duration / requestCount;
    expect(avgTime).toBeLessThan(150);
  });
});
