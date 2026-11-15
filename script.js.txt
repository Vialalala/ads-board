// Элементы авторизации
const authSection = document.getElementById('auth-section');
const authForm = document.getElementById('auth-form');
const smsStep = document.getElementById('sms-step');
const smsCodeInput = document.getElementById('sms-code');
const authSubmitBtn = document.getElementById('auth-submit-btn');

const userProfile = document.getElementById('user-profile');
const profileName = document.getElementById('profile-name');
const profilePhone = document.getElementById('profile-phone');
const logoutBtn = document.getElementById('logout-btn');

// Элементы объявлений и поиска
const adForm = document.getElementById('ad-form');
const adAuthorInput = document.getElementById('ad-author');
const adsList = document.getElementById('ads-list');
const filterButtons = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('search-input');

// Состояние приложения
let isSmsSent = false;
let currentUser = JSON.parse(localStorage.getItem('my_board_user')) || null;
let currentFilter = 'all';
let searchQuery = '';

// Стартовые объявления (isCustom: false — нельзя удалить)
const defaultAds = [
    {
        id: 1,
        title: 'Отдам даром детский велосипед',
        author: 'Елена Смирнова',
        text: 'Велосипед в хорошем состоянии, ребенок вырос. Самовывоз в выходные дни.',
        isPaid: false,
        isFree: true,
        isCustom: false
    },
    {
        id: 2,
        title: 'Ремонт стиральных машин на дому',
        author: 'Дмитрий Мастер',
        text: 'Быстрый выезд по городу. Гарантия на все запчасти и выполненную работу до 1 года.',
        isPaid: true,
        isFree: false,
        isCustom: false
    },
    {
        id: 3,
        title: 'Компьютерный стол и стул',
        author: 'Игорь К.',
        text: 'Стол продаю за символическую плату, а офисный стул отдам в подарок к нему.',
        isPaid: true,
        isFree: true,
        isCustom: false
    }
];

let ads = JSON.parse(localStorage.getItem('my_board_ads')) || defaultAds;

// --- БЛОК АВТОРИЗАЦИИ ---

function updateAuthUI() {
    if (currentUser) {
        authSection.classList.add('hidden');
        userProfile.classList.remove('hidden');
        profileName.textContent = currentUser.name;
        profilePhone.textContent = currentUser.phone;
        adAuthorInput.value = currentUser.name; // Автоподстановка имени
    } else {
        authSection.classList.remove('hidden');
        userProfile.classList.add('hidden');
        smsStep.classList.add('hidden');
        authSubmitBtn.textContent = 'Получить код по СМС';
        isSmsSent = false;
        authForm.reset();
    }
}

authForm.addEventListener('submit', function(event) {
    event.preventDefault();

    if (!isSmsSent) {
        // Шаг 1: Имитация отправки СМС
        isSmsSent = true;
        smsStep.classList.remove('hidden');
        smsCodeInput.required = true;
        smsCodeInput.focus();
        authSubmitBtn.textContent = 'Подтвердить и войти';
        alert('Тестовый код из СМС: 1234 (можно ввести любые 4 цифры)');
    } else {
        // Шаг 2: Проверка длины кода и вход
        if (smsCodeInput.value.trim().length < 4) {
            alert('Пожалуйста, введите 4-значный код из СМС.');
            return;
        }
        currentUser = {
            name: document.getElementById('user-name').value.trim(),
            phone: document.getElementById('user-phone').value.trim()
        };
        localStorage.setItem('my_board_user', JSON.stringify(currentUser));
        updateAuthUI();
    }
});

logoutBtn.addEventListener('click', function() {
    currentUser = null;
    localStorage.removeItem('my_board_user');
    adAuthorInput.value = '';
    updateAuthUI();
});

// --- БЛОК ОБЪЯВЛЕНИЙ, ПОИСКА И УДАЛЕНИЯ ---

function saveAds() {
    localStorage.setItem('my_board_ads', JSON.stringify(ads));
}

function deleteAd(id) {
    if (confirm('Вы действительно хотите удалить это объявление?')) {
        ads = ads.filter(ad => ad.id !== id);
        saveAds();
        renderAds();
    }
}

function renderAds() {
    adsList.innerHTML = '';

    const filteredAds = ads.filter(ad => {
        // 1. Проверка по кнопкам фильтра
        const matchesFilter = 
            currentFilter === 'all' ||
            (currentFilter === 'paid' && ad.isPaid) ||
            (currentFilter === 'free' && ad.isFree);

        // 2. Проверка по строке поиска (без учёта регистра)
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
            ad.title.toLowerCase().includes(query) ||
            ad.text.toLowerCase().includes(query) ||
            ad.author.toLowerCase().includes(query);

        return matchesFilter && matchesSearch;
    });

    if (filteredAds.length === 0) {
        adsList.innerHTML = '<p>Ничего не найдено. Попробуйте изменить запрос или фильтр.</p>';
        return;
    }

    filteredAds.forEach(ad => {
        let badgesHTML = '';
        if (ad.isPaid) badgesHTML += '<span class="badge">💰 Платно</span> ';
        if (ad.isFree) badgesHTML += '<span class="badge">🆓 Бесплатно</span>';

        // Кнопка удаления показывается только для добавленных пользователем карточек
        const deleteBtnHTML = ad.isCustom 
            ? `<button type="button" class="btn-delete" onclick="deleteAd(${ad.id})">🗑 Удалить</button>` 
            : '';

        const article = document.createElement('article');
        article.innerHTML = `
            <div class="ad-header">
                <h3>${ad.title}</h3>
                ${deleteBtnHTML}
            </div>
            <p><strong>Автор:</strong> ${ad.author}</p>
            <p>${ad.text}</p>
            <footer class="badges">${badgesHTML}</footer>
        `;
        adsList.appendChild(article);
    });
}

// Публикация нового объявления
adForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const newAd = {
        id: Date.now(), // Уникальный номер на основе текущего времени
        title: document.getElementById('ad-title').value,
        author: adAuthorInput.value,
        text: document.getElementById('ad-text').value,
        isPaid: document.getElementById('is-paid').checked,
        isFree: document.getElementById('is-free').checked,
        isCustom: true
    };

    ads.unshift(newAd);
    saveAds();
    renderAds();
    adForm.reset();

    // Если пользователь авторизован, возвращаем его имя в поле автора
    if (currentUser) {
        adAuthorInput.value = currentUser.name;
    }
});

// Переключение фильтров
filterButtons.forEach(button => {
    button.addEventListener('click', function() {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        renderAds();
    });
});

// Живой поиск при вводе текста
searchInput.addEventListener('input', function() {
    searchQuery = this.value.trim();
    renderAds();
});

// Запуск при открытии страницы
updateAuthUI();
renderAds();