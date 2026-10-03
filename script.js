// Mock Database representing Backend State
const DB = {
    users: [
        { login: 'student', password: '123', role: 'student', name: 'Иван Иванов' },
        { login: 'mentor', password: '123', role: 'mentor', name: 'Анна Смирнова' }
    ],
    course: {
        id: 1,
        title: 'AQA',
        description: 'Полный практический курс по автоматизации тестирования на Python и Selenium.',
        lessons: [
            { id: 1, title: 'Модуль 1. Введение в автотесты 1', text: 'На этом уроке мы разберем основные понятия обеспечения качества, чем отличается QA от QC и тестирования.', completed: true, isTest: false },
            { id: 2, title: 'Модуль 2. Основы языка Python', text: 'Основа языка Python. Фундаментальные концепции, типы данных, структуры данных и базовые алгоритмы.', completed: true, isTest: false },
            { id: 3, title: 'Модуль 3. Принципы ООП и SOLID', text: 'Изучаем объектно-ориентированное программирование, классы, наследование, инкапсуляцию, полиморфизм и принципы SOLID.', completed: false, isTest: false },
            { id: 4, title: 'Модуль 4. Инструменты для работы с backend', text: 'Раздел в разработке (без содержания)', completed: false, isTest: false },
            { id: 5, title: 'Модуль 5. Автотесты на backend', text: 'Раздел в разработке (без содержания)', completed: false, isTest: false },
            { id: 6, title: 'Модуль 6. Автотесты на frontend', text: 'Раздел в разработке (без содержания)', completed: false, isTest: false },
            { id: 7, title: 'Модуль 7', text: 'Раздел в разработке (без содержания)', completed: false, isTest: false },
            { id: 8, title: 'Модуль 8. Мобилки', text: 'Раздел в разработке (без содержания)', completed: false, isTest: false },
            { id: 9, title: 'Модуль 9. Что такое CICD, инфраструктура', text: 'Раздел в разработке (без содержания)', completed: false, isTest: false },
            { id: 10, title: 'Модуль 10. Основные вопросы по автотестам', text: 'Раздел в разработке (без содержания)', completed: false, isTest: false },
            { id: 11, title: 'Модуль 11. Технические вопросы по языку', text: 'Раздел в разработке (без содержания)', completed: false, isTest: false },
            { id: 12, title: 'Модуль 12. Подготовка к выходу на рынок', text: 'Финальный тест. Поздравляем с прохождением всех материалов!', completed: false, isTest: true,
                test: {
                    question: 'Какой метод используется в Selenium WebDriver (Python) для поиска первого элемента, соответствующего локатору?',
                    options: [
                        'driver.search_element()', 
                        'driver.find_elements()', 
                        'driver.find_element()', 
                        'driver.get_element_by_locator()'
                    ],
                    correct: 2
                }
            }
        ]
    },
    mentorTasks: [
        { id: 101, student: 'Алексей Петров', task: 'ДЗ 2: Локаторы (XPATH)', status: 'pending' },
        { id: 102, student: 'Мария Волкова', task: 'ДЗ 1: Теория тестирования', status: 'pending' },
        { id: 103, student: 'Евгений С.', task: 'Проектная работа (API)', status: 'pending' }
    ]
};

// Main App Logic
const app = {
    currentUser: null,
    currentTestLessonId: null,
    
    init() {
        // Event Listeners
        document.getElementById('loginForm').addEventListener('submit', this.handleLogin.bind(this));
        
        const addCourseForm = document.getElementById('addCourseForm');
        if (addCourseForm) {
            addCourseForm.addEventListener('submit', this.handleAddCourse.bind(this));
        }
        
        // Auto-login from local storage (mock session)
        const savedSession = localStorage.getItem('itmentor_user');
        if (savedSession) {
            this.currentUser = JSON.parse(savedSession);
            this.updateNav();
            this.navigate(this.currentUser.role === 'student' ? 'student-dashboard' : 'mentor-dashboard');
        }
    },

    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPassword').value;
        const error = document.getElementById('loginError');
        
        const user = DB.users.find(u => u.login === email && u.password === pass);
        if (user) {
            this.currentUser = user;
            localStorage.setItem('itmentor_user', JSON.stringify(user));
            error.textContent = '';
            this.updateNav();
            this.navigate(user.role === 'student' ? 'student-dashboard' : 'mentor-dashboard');
        } else {
            error.textContent = 'Неверный логин или пароль!';
        }
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('itmentor_user');
        this.updateNav();
        this.navigate('login');
        
        // reset forms
        document.getElementById('loginPassword').value = '';
    },

    updateNav() {
        const nav = document.getElementById('navbar');
        if (this.currentUser) {
            nav.classList.remove('hidden');
            document.getElementById('userRoleBadge').textContent = this.currentUser.role === 'student' ? 'Студент' : 'Ментор';
            document.getElementById('userNameDisplay').textContent = this.currentUser.name;
        } else {
            nav.classList.add('hidden');
        }
    },

    // SPA Router
    navigate(viewId) {
        // Hide all views
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        // Show target view
        document.getElementById(`view-${viewId}`).classList.add('active');
        // Scroll to top
        window.scrollTo(0, 0);

        // Run view-specific logic
        if (viewId === 'student-dashboard') this.renderStudentDashboard();
        if (viewId === 'mentor-dashboard') this.renderMentorDashboard();
        if (viewId === 'certificate') this.renderCertificate();
    },

    /* --- STUDENT LOGIC --- */
    renderStudentDashboard() {
        document.getElementById('studentWelcome').textContent = `Привет, ${this.currentUser.name}! 👋`;
        
        let hasCert = localStorage.getItem('itmentor_cert_earned') === 'true';
        document.getElementById('certCount').textContent = hasCert ? '1' : '0';
        
        // Calculate progress dynamically
        let completedLessons = DB.course.lessons.filter(l => l.completed).length;
        // if cert earned in past session, force update DB mock
        if (hasCert && completedLessons < DB.course.lessons.length) {
            DB.course.lessons.forEach(l => l.completed = true);
            completedLessons = DB.course.lessons.length;
        }

        let totalLessons = DB.course.lessons.length;
        let progressPercent = Math.round((completedLessons / totalLessons) * 100);

        document.getElementById('statsLessons').textContent = `${completedLessons} / ${totalLessons}`;

        const list = document.getElementById('studentCoursesList');
        list.innerHTML = `
            <div class="course-card">
                <div class="course-info">
                    <div class="course-tag">Тестирование</div>
                    <h3>${DB.course.title}</h3>
                    <p>${DB.course.description}</p>
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${progressPercent}%;"></div>
                    </div>
                    <span class="progress-text">${progressPercent}% завершено</span>
                </div>
                <div class="course-actions">
                    <button class="btn primary full-width" onclick="app.openCourse()">Продолжить обучение</button>
                    <button id="paymentButton" class="btn primary full-width mt-4" style="margin-top: 10px;">Оплатить следующий модуль</button>
                    ${hasCert ? '<button class="btn success full-width mt-4" onclick="app.navigate(\'certificate\')">Посмотреть сертификат 🏆</button>' : ''}
                </div>
            </div>
        `;
    },

    openCourse() {
        this.navigate('lesson');
        // Find first incomplete, or default to last lesson
        const nextLesson = DB.course.lessons.find(l => !l.completed) || DB.course.lessons[DB.course.lessons.length - 1];
        this.renderLesson(nextLesson.id);
        this.renderLessonSidebar();
    },

    renderLessonSidebar() {
        const list = document.getElementById('lessonSidebarList');
        list.innerHTML = DB.course.lessons.map(l => 
            `<li onclick="app.renderLesson(${l.id})" id="sidebar-lesson-${l.id}">
                ${l.title} <span style="margin-left:auto">${l.completed ? '✅' : '🔒'}</span>
            </li>`
        ).join('');
    },

    renderLesson(id) {
        // Highlight active
        document.querySelectorAll('#lessonSidebarList li').forEach(li => li.classList.remove('active'));
        const activeLi = document.getElementById(`sidebar-lesson-${id}`);
        if(activeLi) activeLi.classList.add('active');

        const lesson = DB.course.lessons.find(l => l.id === id);
        document.getElementById('lessonTitle').textContent = lesson.title;
        document.getElementById('lessonText').textContent = lesson.text;
        
        const testSection = document.getElementById('testSection');
        if (lesson.isTest) {
            testSection.style.display = 'block';
            document.getElementById('testQuestion').textContent = lesson.test.question;
            const optionsHtml = lesson.test.options.map((opt, idx) => 
                `<label><input type="radio" name="testOpt" value="${idx}"> ${opt}</label>`
            ).join('');
            document.getElementById('testOptions').innerHTML = optionsHtml;
            document.getElementById('testResult').textContent = '';
            document.getElementById('videoText').textContent = '📝 Экзамен';
            this.currentTestLessonId = id;

            if (lesson.completed) {
                document.getElementById('testResult').textContent = '✅ Вы уже успешно сдали этот тест.';
                document.getElementById('testResult').className = 'test-result success';
            }
        } else {
            testSection.style.display = 'none';
            document.getElementById('videoText').textContent = '▶ Видеоплеер (Заглушка)';
        }
    },

    submitTest() {
        const selected = document.querySelector('input[name="testOpt"]:checked');
        const res = document.getElementById('testResult');
        
        if (!selected) {
            res.textContent = '❗ Пожалуйста, выберите вариант ответа.';
            res.className = 'test-result error-msg';
            return;
        }

        const lesson = DB.course.lessons.find(l => l.id === this.currentTestLessonId);
        
        if (parseInt(selected.value) === lesson.test.correct) {
            res.textContent = '🎉 Правильно! Курс успешно завершен. Создаем сертификат...';
            res.className = 'test-result success';
            lesson.completed = true;
            localStorage.setItem('itmentor_cert_earned', 'true'); // Save state persistently
            
            this.renderLessonSidebar(); // update ticks
            
            // Auto navigate to certificate after 2 seconds
            setTimeout(() => {
                this.navigate('certificate');
            }, 2000);
        } else {
            res.textContent = '❌ Неверный ответ. Повторите материал и попробуйте снова.';
            res.className = 'test-result error-msg';
        }
    },

    renderCertificate() {
        document.getElementById('certStudentName').textContent = this.currentUser.name;
        document.getElementById('certCourseName').textContent = DB.course.title;
        const today = new Date().toLocaleDateString('ru-RU');
        document.getElementById('certDate').textContent = today;
    },

    printCert() {
        window.print();
    },

    /* --- MENTOR LOGIC --- */
    renderMentorDashboard() {
        const list = document.getElementById('mentorHwList');
        list.innerHTML = DB.mentorTasks.map(t => `
            <div class="hw-item" id="task-${t.id}">
                <div>
                    <h4>${t.task}</h4>
                    <span style="color:var(--text-secondary)">Студент: <b>${t.student}</b></span>
                </div>
                <div style="display:flex; align-items:center;">
                    <span class="badge" id="badge-${t.id}">Ожидает</span>
                    <button class="btn primary" id="btn-${t.id}" style="margin-left:1rem;" onclick="app.checkHw(${t.id})">Проверить</button>
                </div>
            </div>
        `).join('');

        const modulesList = document.getElementById('mentorModulesList');
        if (modulesList) {
            modulesList.innerHTML = DB.course.lessons.map(m => `
                <div class="hw-item" style="margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: 10px;">
                    <input type="text" id="edit-module-${m.id}" value="${m.title}" style="flex: 1; margin-right: 1rem; padding: 0.5rem; background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text);" />
                    <button class="btn primary" onclick="app.saveModuleName(${m.id})">Сохранить</button>
                </div>
            `).join('');
        }
    },

    saveModuleName(id) {
        const input = document.getElementById(`edit-module-${id}`);
        if (input) {
            const lesson = DB.course.lessons.find(l => l.id === id);
            if (lesson) {
                lesson.title = input.value;
                alert('Название модуля успешно сохранено!');
                
                if (document.getElementById('lessonSidebarList')) {
                    this.renderLessonSidebar();
                }
            }
        }
    },

    checkHw(id) {
        // Simulate checking homework
        const badge = document.getElementById(`badge-${id}`);
        const btn = document.getElementById(`btn-${id}`);
        
        btn.textContent = 'Проверка...';
        btn.style.opacity = '0.7';
        
        setTimeout(() => {
            badge.textContent = 'Проверено (5/5)';
            badge.className = 'badge success';
            btn.style.display = 'none'; // hide button after check
        }, 800);
    },

    async handleAddCourse(e) {
        e.preventDefault();
        const title = document.getElementById('newCourseTitle').value;
        const desc = document.getElementById('newCourseDesc').value;
        const statusEl = document.getElementById('addCourseStatus');
        const btn = e.target.querySelector('button');

        statusEl.textContent = 'Отправка данных в БД...';
        statusEl.style.color = 'var(--text-secondary)';
        btn.disabled = true;

        try {
            // Пытаемся отправить данные на наш Python Backend (FastAPI + SQLite на Render)
            const response = await fetch('https://it-mentor-platform.onrender.com/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: title, description: desc })
            });

            if (response.ok) {
                const data = await response.json();
                statusEl.textContent = `✅ Курс "${data.title}" успешно добавлен в базу данных (ID: ${data.id})!`;
                statusEl.style.color = 'var(--success)';
                e.target.reset();
            } else {
                throw new Error('Ошибка сервера');
            }
        } catch (error) {
            console.error('API Error:', error);
            // Фолбэк для демо (если бэкенд выключен или это GitHub Pages)
            statusEl.textContent = `✅ Курс "${title}" добавлен локально (бэкенд недоступен, симуляция).`;
            statusEl.style.color = 'var(--accent)';
            e.target.reset();
        } finally {
            btn.disabled = false;
        }
    }
};

// Initialize app when DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => app.init());
