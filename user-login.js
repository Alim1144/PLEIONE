// Ключи для localStorage
const USERS_KEY = 'pleione_users';
const CURRENT_USER_KEY = 'pleione_current_user';
const ADMIN_EMAIL = 'admin@pleione.com'; // Ваш email для доступа к админке

// Получение пользователей из localStorage
function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

// Сохранение пользователей
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Получение текущего пользователя
function getCurrentUser() {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
}

// Сохранение текущего пользователя
function saveCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

// Переключение между формами
window.switchTab = function (tab, clickedElement) {
    // Обновляем кнопки
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (clickedElement) {
        clickedElement.classList.add('active');
    }

    // Обновляем формы
    document.querySelectorAll('.user-form').forEach(form => form.classList.remove('active'));
    if (tab === 'login') {
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.getElementById('registerForm').classList.add('active');
    }
};

// Проверка авторизации при загрузке
document.addEventListener('DOMContentLoaded', function () {
    const currentUser = getCurrentUser();
    if (currentUser) {
        // Если пользователь уже авторизован, перенаправляем в личный кабинет
        window.location.href = 'user-cabinet.html';
    }

    // Показываем админ-доступ для определенного email
    checkAdminAccess();
});

// Проверка доступа к админке
function checkAdminAccess() {
    const adminAccess = document.getElementById('adminAccess');
    const loginEmail = document.getElementById('loginEmail');

    loginEmail.addEventListener('input', function () {
        if (this.value === ADMIN_EMAIL) {
            adminAccess.style.display = 'block';
        } else {
            adminAccess.style.display = 'none';
        }
    });
}

// Обработка формы входа
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showNotification('Заполните все поля', 'error');
        return;
    }

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // Успешный вход
        saveCurrentUser(user);
        showNotification('Успешный вход! Перенаправление...', 'success');

        setTimeout(() => {
            window.location.href = 'user-cabinet.html';
        }, 1000);
    } else {
        // Неверные данные
        showNotification('Неверный email или пароль', 'error');
        document.getElementById('loginPassword').value = '';
    }
});

// Обработка формы регистрации
document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const phone = document.getElementById('registerPhone').value.trim();
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

    // Валидация
    if (!name || !email || !phone || !password || !passwordConfirm) {
        showNotification('Заполните все поля', 'error');
        return;
    }

    if (password !== passwordConfirm) {
        showNotification('Пароли не совпадают', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('Пароль должен содержать минимум 6 символов', 'error');
        return;
    }

    // Проверка существования пользователя
    const users = getUsers();
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
        showNotification('Пользователь с таким email уже существует', 'error');
        return;
    }

    // Создание нового пользователя
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        phone: phone,
        password: password,
        registrationDate: new Date().toISOString(),
        cart: [],
        orders: []
    };

    users.push(newUser);
    saveUsers(users);

    // Автоматический вход после регистрации
    saveCurrentUser(newUser);
    showNotification('Регистрация успешна! Перенаправление...', 'success');

    setTimeout(() => {
        window.location.href = 'user-cabinet.html';
    }, 1000);
});

// Показ уведомлений
function showNotification(message, type = 'info') {
    const notification = document.getElementById('userNotification');
    notification.textContent = message;
    notification.className = 'show';

    // Цвет в зависимости от типа
    switch (type) {
        case 'success':
            notification.style.background = '#4CAF50';
            break;
        case 'error':
            notification.style.background = '#f44336';
            break;
        default:
            notification.style.background = '#e91e63';
    }

    // Автоматическое скрытие
    setTimeout(() => {
        notification.className = '';
    }, 3000);
}

// Анимация при фокусе на полях
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', function () {
        this.parentElement.style.transform = 'scale(1.02)';
    });

    input.addEventListener('blur', function () {
        this.parentElement.style.transform = 'scale(1)';
    });
});

// Ввод по Enter
document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        const activeForm = document.querySelector('.user-form.active');
        if (activeForm) {
            activeForm.dispatchEvent(new Event('submit'));
        }
    }
});