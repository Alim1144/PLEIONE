// Админ данные
const ADMIN_EMAIL = 'admin@pleione.com';
const ADMIN_PASSWORD = 'admin123';

// DOM элементы
const adminLoginForm = document.getElementById('adminLoginForm');
const adminEmailInput = document.getElementById('adminEmail');
const adminPasswordInput = document.getElementById('adminPassword');
const notificationContainer = document.getElementById('adminNotification');

// Обработчик отправки формы
adminLoginForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const email = adminEmailInput.value.trim();
  const password = adminPasswordInput.value.trim();

  // Проверка данных
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    // Сохраняем сессию админа
    localStorage.setItem('pleione_admin_session', 'true');
    localStorage.setItem('pleione_admin_email', email);

    showNotification('Успешный вход! Перенаправление...', 'success');

    // Перенаправляем в админ панель
    setTimeout(() => {
      window.location.href = 'admin-panel.html';
    }, 1500);
  } else {
    showNotification('Неверный email или пароль', 'error');
    adminPasswordInput.value = '';
    adminPasswordInput.focus();
  }
});

// Функция показа уведомлений
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  notificationContainer.appendChild(notification);

  // Автоматически удаляем уведомление через 5 секунд
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 5000);
}

// Проверка авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
  const adminSession = localStorage.getItem('pleione_admin_session');

  if (adminSession === 'true') {
    // Если уже авторизован, перенаправляем в админ панель
    window.location.href = 'admin-panel.html';
  }

  // Фокус на поле email
  adminEmailInput.focus();
});

// Обработка клавиши Enter
adminPasswordInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    adminLoginForm.dispatchEvent(new Event('submit'));
  }
});
