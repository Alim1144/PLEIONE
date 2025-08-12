// Данные о цветах - загружаются из localStorage или используются дефолтные
const STORAGE_KEY = 'pleione_flowers';

function getFlowers() {
    const savedFlowers = localStorage.getItem(STORAGE_KEY);
    if (savedFlowers) {
        return JSON.parse(savedFlowers);
    }

    // Дефолтные данные, если ничего не сохранено
    return [
        {
            id: 1,
            name: "Роза Кения (лиловая)",
            price: 120,
            description: "Красивая лиловая роза из Кении, 40 см",
            category: "roses",
            emoji: "🌹",
            image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=300&fit=crop&crop=center"
        },
        {
            id: 2,
            name: "Роза Кения (красная)",
            price: 120,
            description: "Классическая красная роза из Кении, 40 см",
            category: "roses",
            emoji: "🌹",
            image: "https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=400&h=300&fit=crop&crop=center"
        },
        {
            id: 3,
            name: "Роза Red Naomi",
            price: 250,
            description: "Премиум роза Red Naomi, 60 см",
            category: "roses",
            emoji: "🌹",
            image: "https://images.unsplash.com/photo-1582793988951-9c88b7d36c46?w=400&h=300&fit=crop&crop=center"
        },
        {
            id: 4,
            name: "Хризантема Алтай",
            price: 300,
            description: "Пышная хризантема Алтай",
            category: "chrysanthemums",
            emoji: "🌼",
            image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center"
        },
        {
            id: 5,
            name: "Мондиаль 60 см",
            price: 300,
            description: "Элегантная роза Мондиаль, 60 см",
            category: "roses",
            emoji: "🌹",
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center"
        },
        {
            id: 6,
            name: "Мондиаль Французская",
            price: 350,
            description: "Французская роза Мондиаль премиум качества",
            category: "roses",
            emoji: "🌹",
            image: "https://images.unsplash.com/photo-1582793988951-9c88b7d36c46?w=400&h=300&fit=crop&crop=center"
        },
        {
            id: 7,
            name: "Кантри Блюз",
            price: 300,
            description: "Уникальная роза Кантри Блюз, 50-60 см",
            category: "roses",
            emoji: "🌹",
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center"
        },
        {
            id: 8,
            name: "Гортензия Кения",
            price: 550,
            description: "Пышная гортензия из Кении",
            category: "hydrangeas",
            emoji: "🌸",
            image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center"
        },
        {
            id: 9,
            name: "Диантус 60 см",
            price: 150,
            description: "Нежный диантус, 60 см",
            category: "dianthus",
            emoji: "🌺",
            image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center"
        },
        {
            id: 10,
            name: "Пинк Охара Французская",
            price: 350,
            description: "Французская роза Пинк Охара",
            category: "roses",
            emoji: "🌹",
            image: "https://images.unsplash.com/photo-1582793988951-9c88b7d36c46?w=400&h=300&fit=crop&crop=center"
        }
    ];
}

// Корзина
let cart = [];

// Проверка авторизации пользователя
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('pleione_current_user') || 'null');
}

// Получение корзины пользователя
function getUserCart() {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.cart) {
        return currentUser.cart;
    }
    return [];
}

// Сохранение корзины пользователя
function saveUserCart(cartItems) {
    const currentUser = getCurrentUser();
    if (currentUser) {
        const users = JSON.parse(localStorage.getItem('pleione_users') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].cart = cartItems;
            localStorage.setItem('pleione_users', JSON.stringify(users));

            // Обновляем текущего пользователя
            currentUser.cart = cartItems;
            localStorage.setItem('pleione_current_user', JSON.stringify(currentUser));
        }
    }
}

// Переменные для фильтрации
let currentView = 'grid';
let filteredFlowers = [];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
    loadFlowers();
    loadUserCart();
    updateCartCount();
    setupFilters();

    // Плавная прокрутка для навигации
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Загрузка корзины пользователя
function loadUserCart() {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.cart) {
        cart = [...currentUser.cart];
    }
}

// Настройка фильтров
function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const priceFilter = document.getElementById('priceFilter');
    const categoryTabs = document.getElementById('categoryTabs');

    searchInput.addEventListener('input', filterFlowers);
    priceFilter.addEventListener('change', filterFlowers);
    if (categoryTabs) {
        categoryTabs.addEventListener('click', (e) => {
            const btn = e.target.closest('.category-tab');
            if (!btn) return;
            document.querySelectorAll('.category-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterFlowers();
        });
    }
}

// Фильтрация цветов
function filterFlowers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const priceRange = document.getElementById('priceFilter').value;
    const activeCategoryBtn = document.querySelector('.category-tab.active');
    const activeCategory = activeCategoryBtn ? activeCategoryBtn.getAttribute('data-category') : '';
    const flowers = getFlowers();

    filteredFlowers = flowers.filter(flower => {
        // Поиск по названию и описанию
        const matchesSearch = flower.name.toLowerCase().includes(searchTerm) ||
            flower.description.toLowerCase().includes(searchTerm);

        // Фильтр по цене
        let matchesPrice = true;
        if (priceRange) {
            const [minStr, maxStr] = priceRange.split('-');
            const min = parseInt(minStr) || 0;
            const max = parseInt(maxStr) || Infinity;
            matchesPrice = flower.price >= min && flower.price <= max;
        }

        // Фильтр по категории
        let matchesCategory = true;
        if (activeCategory) {
            if (activeCategory.startsWith('flowers-price-')) {
                // Категории цен для цветов: flowers-price-min-max
                const parts = activeCategory.split('-');
                const min = parseInt(parts[2]) || 0;
                const max = parseInt(parts[3]) || Infinity;
                matchesCategory = flower.price >= min && flower.price <= max;
            } else {
                matchesCategory = flower.category === activeCategory;
            }
        }

        return matchesSearch && matchesPrice && matchesCategory;
    });

    renderFilteredFlowers();
}

// Рендер отфильтрованных цветов
function renderFilteredFlowers() {
    const flowersGrid = document.getElementById('flowersGrid');
    flowersGrid.innerHTML = '';

    if (filteredFlowers.length === 0) {
        flowersGrid.innerHTML = '<div class="no-results"><p>По вашему запросу ничего не найдено</p></div>';
        return;
    }

    filteredFlowers.forEach(flower => {
        const flowerCard = createFlowerCard(flower);
        flowersGrid.appendChild(flowerCard);
    });
}

// Переключение вида отображения
window.changeView = function (view) {
    currentView = view;
    const flowersGrid = document.getElementById('flowersGrid');
    const viewBtns = document.querySelectorAll('.view-btn');

    // Обновляем кнопки
    viewBtns.forEach(btn => btn.classList.remove('active'));
    const clickedBtn = document.querySelector(`[onclick*="${view}"]`);
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }

    // Обновляем классы сетки
    flowersGrid.className = `flowers-grid ${view === 'list' ? 'list-view' : ''}`;

    // Перерендериваем цветы
    renderFilteredFlowers();
};

// Мобильное меню
window.toggleMobileMenu = function () {
    const navLinks = document.getElementById('navLinks');
    const isActive = navLinks.classList.contains('active');

    if (isActive) {
        navLinks.classList.remove('active');
        document.body.style.overflow = 'auto'; // Разрешаем скролл
    } else {
        navLinks.classList.add('active');
        document.body.style.overflow = 'hidden'; // Блокируем скролл
    }
};

// Закрытие мобильного меню при клике на ссылку
document.addEventListener('click', function (e) {
    if (e.target.matches('.nav-links a')) {
        const navLinks = document.getElementById('navLinks');
        navLinks.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Закрытие мобильного меню при изменении размера окна
window.addEventListener('resize', function () {
    if (window.innerWidth > 768) {
        const navLinks = document.getElementById('navLinks');
        navLinks.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Загрузка цветов в каталог
function loadFlowers() {
    const flowers = getFlowers();
    filteredFlowers = [...flowers];
    renderFilteredFlowers();
}

// Функция получения активной скидки для товара
function getActiveDiscount(productId) {
    const discounts = JSON.parse(localStorage.getItem('pleione_discounts') || '[]');
    const today = new Date().toISOString().split('T')[0];

    return discounts.find(d =>
        d.productId === productId &&
        d.startDate <= today &&
        d.endDate >= today
    );
}

// Создание карточки цветка
function createFlowerCard(flower) {
    const card = document.createElement('div');
    card.className = 'flower-card';

    const discount = getActiveDiscount(flower.id);
    const finalPrice = discount ? Math.round(flower.price * (1 - discount.percent / 100)) : flower.price;

    card.innerHTML = `
        <div class="flower-image">
            <img src="${flower.image}" alt="${flower.name}">
        </div>
        <div class="flower-info">
            <h3 class="flower-name">${flower.name}</h3>
            <div class="flower-price">
                ${discount ? `<span style="text-decoration: line-through; color: #999; margin-right: 0.5rem;">${flower.price} ₽</span>` : ''}
                ${finalPrice} ₽
                ${discount ? `<span style="background: #dc3545; color: white; padding: 0.2rem 0.5rem; border-radius: 10px; font-size: 0.8rem; margin-left: 0.5rem;">-${discount.percent}%</span>` : ''}
            </div>
            <p class="flower-description">${flower.description}</p>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="changeQuantity(${flower.id}, -1)">-</button>
                <span class="quantity-display" id="quantity-${flower.id}">0</span>
                <button class="quantity-btn" onclick="changeQuantity(${flower.id}, 1)">+</button>
            </div>
            <button class="add-to-cart" onclick="addToCart(${flower.id})">
                <i class="fas fa-plus"></i> Добавить в букет
            </button>
        </div>
    `;
    return card;
}

// Изменение количества
function changeQuantity(flowerId, change) {
    const quantityDisplay = document.getElementById(`quantity-${flowerId}`);
    let currentQuantity = parseInt(quantityDisplay.textContent) || 0;
    currentQuantity = Math.max(0, currentQuantity + change);
    quantityDisplay.textContent = currentQuantity;

    // Тактильная обратная связь на поддерживающих устройствах
    if ('vibrate' in navigator && change !== 0) {
        navigator.vibrate(50);
    }
}

// Добавление в корзину
function addToCart(flowerId) {
    const quantityDisplay = document.getElementById(`quantity-${flowerId}`);
    const quantity = parseInt(quantityDisplay.textContent) || 0;

    if (quantity === 0) {
        showNotification('Выберите количество цветов', 'error');
        return;
    }

    const flowers = getFlowers();
    const flower = flowers.find(f => f.id === flowerId);
    const discount = getActiveDiscount(flowerId);
    const finalPrice = discount ? Math.round(flower.price * (1 - discount.percent / 100)) : flower.price;

    const existingItem = cart.find(item => item.id === flowerId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...flower,
            price: finalPrice, // Используем цену со скидкой
            originalPrice: flower.price, // Сохраняем оригинальную цену
            quantity: quantity
        });
    }

    // Сброс счетчика
    quantityDisplay.textContent = '0';

    // Сохраняем корзину пользователя
    saveUserCart(cart);

    updateCartCount();
    showNotification(`${flower.name} добавлен в букет!`, 'success');
}

// Обновление счетчика корзины
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Открытие/закрытие корзины
function toggleCart() {
    const cartOverlay = document.getElementById('cartOverlay');
    const isVisible = cartOverlay.style.display === 'flex';

    if (isVisible) {
        cartOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    } else {
        cartOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Блокируем скролл фона
        updateCartDisplay();
    }
}

// Обновление отображения корзины
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    cartItems.innerHTML = '';

    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Ваш букет пуст</p>';
        cartTotal.textContent = '0 ₽';
        return;
    }

    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';

        // Проверяем, есть ли скидка
        const hasDiscount = item.originalPrice && item.originalPrice > item.price;

        cartItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">
                    ${hasDiscount ? `<span style="text-decoration: line-through; color: #999; margin-right: 0.5rem;">${item.originalPrice} ₽</span>` : ''}
                    ${item.price} ₽ × ${item.quantity}
                    ${hasDiscount ? `<span style="background: #dc3545; color: white; padding: 0.2rem 0.5rem; border-radius: 10px; font-size: 0.8rem; margin-left: 0.5rem;">Скидка</span>` : ''}
                </div>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn" onclick="updateCartItemQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" onclick="updateCartItemQuantity(${item.id}, 1)">+</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });

    cartTotal.textContent = `${total} ₽`;
}

// Обновление количества в корзине
function updateCartItemQuantity(flowerId, change) {
    const item = cart.find(item => item.id === flowerId);
    if (item) {
        item.quantity = Math.max(0, item.quantity + change);
        if (item.quantity === 0) {
            cart = cart.filter(item => item.id !== flowerId);
        }
        // Сохраняем корзину пользователя
        saveUserCart(cart);
        updateCartCount();
        updateCartDisplay();
    }
}

// Прокрутка к каталогу
function scrollToCatalog() {
    const catalog = document.getElementById('catalog');
    const headerHeight = document.querySelector('.header').offsetHeight;
    const catalogTop = catalog.offsetTop - headerHeight - 20;

    window.scrollTo({
        top: catalogTop,
        behavior: 'smooth'
    });
}

// Размещение заказа через WhatsApp
function placeOrder() {
    if (cart.length === 0) {
        showNotification('Ваш букет пуст', 'error');
        return;
    }

    const message = createOrderMessage();
    const whatsappNumber = '+7XXXXXXXXXX'; // Замените на ваш номер
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
}

// Размещение заказа через Telegram
function placeOrderTelegram() {
    if (cart.length === 0) {
        showNotification('Ваш букет пуст', 'error');
        return;
    }

    const message = createOrderMessage();
    const telegramUsername = 'pleione_flowers'; // Замените на ваш username
    const telegramUrl = `https://t.me/${telegramUsername}?text=${encodeURIComponent(message)}`;

    window.open(telegramUrl, '_blank');
}

// Создание сообщения заказа
function createOrderMessage() {
    let message = `🌸 *Новый заказ букета от Pleione* 🌸\n\n`;
    message += `*Состав букета:*\n`;

    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        message += `• ${item.name} - ${item.quantity} шт. (${itemTotal} ₽)\n`;
    });

    message += `\n*Итого: ${total} ₽*\n\n`;
    message += `📱 Заказ размещен через сайт\n`;
    message += `🕐 Время: ${new Date().toLocaleString('ru-RU')}\n\n`;
    message += `Пожалуйста, свяжитесь с клиентом для уточнения деталей доставки.`;

    return message;
}

// Показ уведомлений
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Стили для уведомления
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 3000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-weight: 500;
    `;

    document.body.appendChild(notification);

    // Анимация появления
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Автоматическое скрытие
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Закрытие корзины при клике вне её
document.addEventListener('click', function (event) {
    const cartOverlay = document.getElementById('cartOverlay');
    const cartModal = document.querySelector('.cart-modal');

    if (event.target === cartOverlay) {
        cartOverlay.style.display = 'none';
    }
});

// Анимация появления элементов при скролле
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Наблюдение за элементами
document.addEventListener('DOMContentLoaded', function () {
    const animatedElements = document.querySelectorAll('.flower-card, .feature, .contact-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Обработка свайпов для закрытия корзины
let startY = 0;
let currentY = 0;

document.addEventListener('touchstart', function (e) {
    if (e.target.closest('.cart-modal')) {
        startY = e.touches[0].clientY;
    }
});

document.addEventListener('touchmove', function (e) {
    if (e.target.closest('.cart-modal')) {
        currentY = e.touches[0].clientY;
        const diffY = currentY - startY;

        if (diffY > 100) { // Свайп вниз на 100px
            toggleCart();
        }
    }
});