# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: advanced.spec.js >> Advanced Testing Suite (E2E, Usability, API Load) >> Usability Test: Проверка цвета кнопки оплаты (Ожидается ошибка)
- Location: tests/advanced.spec.js:11:7

# Error details

```
Error: expect(received).not.toBe(expected) // Object.is equality

Expected: not "rgb(255, 0, 0)"
```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - navigation [ref=f1e2]:
    - generic [ref=f1e3]:
      - generic [ref=f1e4]: "{'}'}"
      - text: IT Mentor
    - generic [ref=f1e5]:
      - generic [ref=f1e6]: Студент
      - generic [ref=f1e7]: Иван Иванов
      - button "Выйти" [ref=f1e8] [cursor=pointer]
  - main [ref=f1e9]:
    - generic [ref=f1e10]:
      - generic [ref=f1e11]:
        - heading "Привет, Иван Иванов! 👋" [level=1] [ref=f1e12]
        - paragraph [ref=f1e13]: Продолжите свое обучение с того места, где остановились.
      - generic [ref=f1e14]:
        - generic [ref=f1e15]:
          - heading "Пройдено уроков" [level=3] [ref=f1e16]
          - generic [ref=f1e17]: 2 / 3
        - generic [ref=f1e18]:
          - heading "Средний балл" [level=3] [ref=f1e19]
          - generic [ref=f1e20]: 95%
        - generic [ref=f1e21]:
          - heading "Сертификаты" [level=3] [ref=f1e22]
          - generic [ref=f1e23]: "0"
      - generic [ref=f1e24]:
        - heading "Мои курсы" [level=2] [ref=f1e25]
        - generic [ref=f1e27]:
          - generic [ref=f1e28]:
            - generic [ref=f1e29]: Тестирование
            - heading "QA Automation Bootcamp" [level=3] [ref=f1e30]
            - paragraph [ref=f1e31]: Полный практический курс по автоматизации тестирования на Python и Selenium.
            - text: 67% завершено
          - generic [ref=f1e34]:
            - button "Продолжить обучение" [ref=f1e35] [cursor=pointer]
            - button "Оплатить следующий модуль" [ref=f1e36] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Advanced Testing Suite (E2E, Usability, API Load)', () => {
  4  | 
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await page.goto('/');
  7  |     await page.evaluate(() => window.localStorage.clear());
  8  |     await page.reload();
  9  |   });
  10 | 
  11 |   test('Usability Test: Проверка цвета кнопки оплаты (Ожидается ошибка)', async ({ page }) => {
  12 |     // Входим как студент
  13 |     await page.fill('#loginEmail', 'student');
  14 |     await page.fill('#loginPassword', '123');
  15 |     await page.click('button[type="submit"]');
  16 |     
  17 |     await expect(page.locator('#view-student-dashboard')).toBeVisible();
  18 |     
  19 |     const payBtn = page.locator('#paymentButton');
  20 |     await expect(payBtn).toBeVisible();
  21 |     
  22 |     // Проверка юзабилити: кнопка не должна быть красного цвета (отпугивает пользователя)
  23 |     const color = await payBtn.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  24 |     
  25 |     // Этот тест специально упадет (в соответствии с кейсом студента), т.к. цвет красный rgb(255, 0, 0)
  26 |     // В Allure будет красивая ошибка юзабилити!
> 27 |     expect(color).not.toBe('rgb(255, 0, 0)');
     |                       ^ Error: expect(received).not.toBe(expected) // Object.is equality
  28 |   });
  29 | 
  30 |   test('E2E: Полный цикл сдачи экзамена студентом', async ({ page }) => {
  31 |     // Вход
  32 |     await page.fill('#loginEmail', 'student');
  33 |     await page.fill('#loginPassword', '123');
  34 |     await page.click('button[type="submit"]');
  35 |     
  36 |     // Переход к курсу и выбор последнего урока (Экзамен)
  37 |     await page.click('button:has-text("Продолжить обучение")');
  38 |     await page.click('#sidebar-lesson-3');
  39 |     
  40 |     await expect(page.locator('#testSection')).toBeVisible();
  41 |     
  42 |     // Выбор правильного ответа (индекс 2 - driver.find_element())
  43 |     await page.check('input[name="testOpt"][value="2"]');
  44 |     await page.click('button:has-text("Ответить")');
  45 |     
  46 |     // Проверка результата
  47 |     await expect(page.locator('#testResult')).toHaveText(/Правильно!/);
  48 |     
  49 |     // Ожидание перехода на сертификат (2 секунды задержка в приложении)
  50 |     await page.waitForTimeout(2500);
  51 |     await expect(page.locator('#view-certificate')).toBeVisible();
  52 |     await expect(page.locator('#certStudentName')).toHaveText('Иван Иванов');
  53 |   });
  54 | 
  55 |   test('API/Load Test: Нагрузочная проверка (100 запросов API)', async ({ request }) => {
  56 |     // Симуляция API тестов на эндпоинт базы данных / сайта
  57 |     // Поскольку у нас SPA, делаем нагрузочный запрос на статику (index.html)
  58 |     // В реальном приложении это будет запрос к REST API
  59 |     
  60 |     const requestCount = 50;
  61 |     const start = Date.now();
  62 |     
  63 |     const promises = [];
  64 |     for (let i = 0; i < requestCount; i++) {
  65 |         promises.push(request.get('/'));
  66 |     }
  67 |     
  68 |     const responses = await Promise.all(promises);
  69 |     const end = Date.now();
  70 |     const duration = end - start;
  71 |     
  72 |     console.log(`[Load Test] 50 requests took ${duration}ms`);
  73 |     
  74 |     // Проверяем, что все запросы успешны
  75 |     for (const response of responses) {
  76 |         expect(response.ok()).toBeTruthy();
  77 |     }
  78 |     
  79 |     // Проверяем, что среднее время ответа не превышает 50мс (локально должно быть очень быстро)
  80 |     const avgTime = duration / requestCount;
  81 |     expect(avgTime).toBeLessThan(150);
  82 |   });
  83 | });
  84 | 
```