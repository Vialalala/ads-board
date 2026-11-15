// ПОДКЛЮЧЕНИЕ К ВАШЕЙ ОБЛАЧНОЙ БАЗЕ ДАННЫХ SUPABASE:
const SUPABASE_URL = 'https://supabase.co';
const SUPABASE_KEY = 'sb_publishable_pUeM-H4q3txd1tEtMvgwqg_jGqwxaLy';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Встроенный быстрый справочник городов и регионов России (работает всегда без блокировок)
const RUSSIA_CITIES = [
    "г. Москва", "г. Санкт-Петербург", "г. Новосибирск, Новосибирская область",
    "г. Екатеринбург, Свердловская область", "г. Казань, Республика Татарстан",
    "г. Нижний Новгород, Нижегородская область", "г. Челябинск, Челябинская область",
    "г. Красноярск, Красноярский край", "г. Самара, Самарская область",
    "г. Уфа, Республика Башкортостан", "г. Ростов-на-Дону, Ростовская область",
    "г. Омск, Омская область", "г. Краснодар, Краснодарский край",
    "г. Воронеж, Воронежская область", "г. Пермь, Пермский край",
    "г. Волгоград, Волгоградская область", "г. Саратов, Саратовская область",
    "г. Тюмень, Тюменская область", "г. Тольятти, Самарская область",
    "г. Ижевск, Удмуртская Республика", "г. Барнаул, Алтайский край",
    "г. Ульяновск, Ульяновская область", "г. Иркутск, Иркутская область",
    "г. Хабаровск, Хабаровский край", "г. Махачкала, Республика Дагестан",
    "г. Ярославль, Ярославская область", "г. Владивосток, Приморский край",
    "г. Оренбург, Оренбургская область", "г. Томск, Томская область",
    "г. Кемерово, Кемеровская область", "г. Новокузнецк, Кемеровская область",
    "г. Рязань, Рязанская область", "г. Набережные Челны, Республика Татарстан",
    "г. Астрахань, Астраханская область", "г. Пенза, Пензенская область",
    "г. Киров, Кировская область", "г. Липецк, Липецкая область",
    "г. Балашиха, Московская область", "г. Чебоксары, Чувашская Республика",
    "г. Калининград, Калининградская область", "г. Тула, Тульская область",
    "г. Курск, Курская область", "г. Ставрополь, Ставропольский край",
    "г. Сочи, Краснодарский край", "г. Улан-Удэ, Республика Бурятия",
    "г. Тверь, Тверская область", "г. Магнитогорск, Челябинская область",
    "г. Иваново, Ивановская область", "г. Брянск, Брянская область",
    "г. Белгород, Белгородская область", "г. Сургут, Ханты-Мансийский АО",
    "г. Владимир, Владимирская область", "г. Чита, Забайкальский край",
    "г. Архангельск, Архангельская область", "г. Нижний Тагил, Свердловская область",
    "г. Калуга, Калужская область", "г. Якутск, Республика Саха (Якутия)",
    "г. Грозный, Чеченская Республика", "г. Волжский, Волгоградская область",
    "г. Смоленск, Смоленская область", "г. Саранск, Республика Мордовия",
    "г. Череповец, Вологодская область", "г. Курган, Курганская область",
    "г. Подольск, Московская область", "г. Вологда, Вологодская область",
    "г. Орёл, Орловская область", "г. Владикавказ, Республика Северная Осетия",
    "г. Тамбов, Тамбовская область", "г. Мурманск, Мурманская область",
    "г. Петрозаводск, Республика Карелия", "г. Нижневартовск, Ханты-Мансийский АО",
    "г. Кострома, Костромская область", "г. Йошкар-Ола, Республика Марий Эл",
    "г. Новороссийск, Краснодарский край", "г. Химки, Московская область",
    "г. Мытищи, Московская область", "г. Люберцы, Московская область",
    "г. Королёв, Московская область", "г. Красногорск, Московская область",
    "г. Одинцово, Московская область", "г. Домодедово, Московская область",
    "пос. Мурино, Ленинградская область", "г. Всеволожск, Ленинградская область"
];

let currentUser = null;
let myProfile = null;
let viewedProfile = null;
let ads = [];
let currentPayFilter = 'all';
let currentDaysFilter = 'all';
let isMyCityOnly = false;
let searchQuery = '';
let locationFilterQuery = '';
let locationTimeout = null;
let userSearchTimeout = null;

const regLocationInput = document.getElementById('reg-location');
const locationSuggestions = document.getElementById('location-suggestions');
const userLoginSearch = document.getElementById('user-login-search');
const userSearchResults = document.getElementById('user-search-results');

const adForm = document.getElementById('ad-form');
const adsList = document.getElementById('ads-list');
const refreshAdsBtn = document.getElementById('refresh-ads-btn');
const myCityBtn = document.getElementById('my-city-btn');

// ==========================================
// 1. НАВИГАЦИЯ И ОТРИСОВКА 5 ЗВЁЗД РЕЙТИНГА
// ==========================================
function openFeed() {
    showView('view-feed');
    loadAds();
}

function renderStarsHTML(rating, votesCount = null) {
    const score = Number(rating) || 0;
    const filledCount = Math.round(score);
    
    let stars = '<span class="stars-row">';
    for (let i = 1; i <= 5; i++) {
        const isFilled = i <= filledCount ? 'filled' : '';
        stars += `<span class="star-icon ${isFilled}">★</span>`;
    }
    
    if (score > 0) {
        const votesText = votesCount !== null ? `, голосов: ${votesCount}` : '';
        stars += `<span class="rating-score-text">${score.toFixed(1)}${votesText}</span>`;
    } else {
        stars += `<span class="rating-score-text">нет оценок</span>`;
    }
    stars += '</span>';
    return stars;
}

// ==========================================
// 2. АВТОРИЗАЦИЯ И РЕГИСТРАЦИЯ
// ==========================================
db.auth.onAuthStateChange(async (event, session) => {
    if (session && session.user) {
        currentUser = session.user;
        await loadOrCreateMyProfile(currentUser);
        updateNavbarProfile();
        openFeed();
    } else {
        currentUser = null;
        myProfile = null;
        showView('view-landing');
    }
});

async function loadOrCreateMyProfile(user) {
    const { data } = await db.from('profiles').select('*').eq('email', user.email).single();
    if (data) {
        myProfile = data;
    } else {
        const meta = user.user_metadata || {};
        const emailPrefix = user.email.split('@').at(0);
        const newProfile = {
            email: user.email,
            username: meta.username || emailPrefix,
            name: meta.name || 'Родитель',
            location: meta.location || 'Россия',
            bio: '',
            telegram: '',
            whatsapp: '',
            avatar: '',
            rating: 0,
            ratings_map: {}
        };
        const { error } = await db.from('profiles').insert([newProfile]);
        if (error) {
            console.error('Ошибка создания профиля в базе:', error);
            alert('Внимание: профиль не сохранился в таблице profiles. Отключите RLS в Supabase! Ошибка: ' + error.message);
        }
        myProfile = newProfile;
    }
}

function updateNavbarProfile() {
    if (!myProfile) return;
    document.getElementById('nav-username').textContent = '@' + myProfile.username;
    
    const votesCount = Object.keys(myProfile.ratings_map || {}).length;
    document.getElementById('nav-rating').innerHTML = renderStarsHTML(myProfile.rating, votesCount);

    const navImg = document.getElementById('nav-avatar-img');
    const navPlace = document.getElementById('nav-avatar-placeholder');
    if (myProfile.avatar) {
        navImg.src = myProfile.avatar;
        navImg.classList.remove('hidden');
        navPlace.classList.add('hidden');
    } else {
        navPlace.textContent = myProfile.name.charAt(0).toUpperCase();
        navPlace.classList.remove('hidden');
        navImg.classList.add('hidden');
    }

    document.getElementById('ad-location').value = myProfile.location || '';
    const cityParts = (myProfile.location || '').split(',');
    const shortCity = (cityParts.at(0) || '').trim();
    myCityBtn.textContent = shortCity ? `📍 Мой город (${shortCity})` : '📍 Мой населённый пункт';
}

// ==========================================
// ГИБРИДНЫЙ ПОИСК НАСЕЛЁННЫХ ПУНКТОВ РФ
// ==========================================
function renderCitySuggestions(items) {
    locationSuggestions.innerHTML = '';
    if (items.length === 0) {
        locationSuggestions.classList.add('hidden');
        return;
    }
    items.forEach(fullName => {
        const li = document.createElement('li');
        li.textContent = fullName;
        li.onclick = () => {
            regLocationInput.value = fullName;
            locationSuggestions.classList.add('hidden');
        };
        locationSuggestions.appendChild(li);
    });
    locationSuggestions.classList.remove('hidden');
}

if (regLocationInput) {
    regLocationInput.addEventListener('input', function() {
        const query = this.value.trim();
        clearTimeout(locationTimeout);

        if (query.length < 2) {
            locationSuggestions.classList.add('hidden');
            return;
        }

        // 1. Мгновенный поиск по встроенному списку городов РФ
        const qLower = query.toLowerCase();
        const localMatches = RUSSIA_CITIES.filter(c => c.toLowerCase().includes(qLower));
        renderCitySuggestions(localMatches);

        // 2. Дополнительный поиск малых сёл, деревень и посёлков через Photon API
        locationTimeout = setTimeout(async () => {
            try {
                const url = `https://komoot.io{encodeURIComponent(query)}&lang=ru&limit=10`;
                const res = await fetch(url);
                const data = await res.json();

                if (!data.features) return;

                const combined = new Set(localMatches);
                data.features.forEach(feature => {
                    const props = feature.properties;
                    if (props.countrycode !== 'RU') return;

                    const locality = props.name || props.city;
                    const district = props.county || props.district || '';
                    const region = props.state || '';
                    const parts = [locality, district, region].filter(Boolean);
                    const fullName = [...new Set(parts)].join(', ');

                    if (fullName) combined.add(fullName);
                });

renderCitySuggestions(Array.from(combined).slice(0, 10));
} catch (err) {
// Если внешний API заблокирован провайдером, остаётся локальный список
console.log('Работает локальный справочник городов');
}
}, 350);
});
}
document.addEventListener('click', (e) => {
if (locationSuggestions && !e.target.closest('.autocomplete-wrapper')) {
locationSuggestions.classList.add('hidden');
}
});
// ==========================================
// ОТПРАВКА ФОРМЫ РЕГИСТРАЦИИ
// ==========================================
document.getElementById('register-form').addEventListener('submit', async (e) => {
e.preventDefault();
const submitBtn = e.target.querySelector('button[type="submit"]');
const username = document.getElementById('reg-username').value.trim().toLowerCase();
const name = document.getElementById('reg-name').value.trim();
const location = regLocationInput.value.trim();
const email = document.getElementById('reg-email').value.trim();
const password = document.getElementById('reg-password').value;
submitBtn.disabled = true;
submitBtn.textContent = '⏳ Регистрируем...';
try {
// Проверяем уникальность логина
const { data: existingUser } = await db.from('profiles').select('username').eq('username', username).maybeSingle();
if (existingUser) {
alert('Этот логин уже занят! Придумайте другой уникальный логин.');
submitBtn.disabled = false;
submitBtn.textContent = 'Зарегистрироваться';
return;
}
const { data, error } = await db.auth.signUp({
email,
password,
options: {
data: { username, name, location },
emailRedirectTo: window.location.href
}
});
if (error) {
alert('Ошибка при регистрации: ' + error.message);
} else if (data && data.session) {
// Если Confirm email отключён, вход происходит сразу
alert('Регистрация успешна! Добро пожаловать в сервис «Няня рядом».');
e.target.reset();
} else {
// Если Confirm email всё ещё включён в Supabase
alert('Заявка принята! Проверьте почту ' + email + ' (включая папку «Спам») или отключите Confirm email в настройках Supabase для мгновенного входа.');
e.target.reset();
showView('view-login');
}
} catch (err) {
alert('Сбой соединения с базой данных: ' + err.message);
} finally {
submitBtn.disabled = false;
submitBtn.textContent = 'Зарегистрироваться';
}
});
document.getElementById('login-form').addEventListener('submit', async (e) => {
e.preventDefault();
let identifier = document.getElementById('login-identifier').value.trim();
const password = document.getElementById('login-password').value;
if (!identifier.includes('@')) {
const cleanLogin = identifier.replace(/^@/, '').toLowerCase();
const { data: prof } = await db.from('profiles').select('email').eq('username', cleanLogin).maybeSingle();
if (!prof) {
alert('Пользователь с таким логином не найден.');
return;
}
identifier = prof.email;
}
const { error } = await db.auth.signInWithPassword({ email: identifier, password });
if (error) {
alert('Ошибка входа: ' + error.message);
}
});
document.getElementById('reset-form').addEventListener('submit', async (e) => {
e.preventDefault();
const email = document.getElementById('reset-email').value.trim();
const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo: window.location.href });
if (error) {
alert('Ошибка отправки письма: ' + error.message);
} else {
alert('Ссылка для входа и смены пароля отправлена на ' + email);
e.target.reset();
}
});
document.getElementById('logout-btn').addEventListener('click', async () => {
await db.auth.signOut();
});
// ==========================================
// 3. ПРОФИЛЬ, КОНТАКТЫ И ГОЛОСОВАНИЕ ЗА РЕЙТИНГ
// ==========================================
function openOwnProfile() {
if (myProfile) openUserProfile(myProfile.username);
}
async function openUserProfile(username) {
const cleanLogin = username.replace(/^@/, '').toLowerCase();
const { data: profile, error } = await db.from('profiles').select('*').eq('username', cleanLogin).maybeSingle();
if (error || !profile) {
alert('Профиль участника не найден.');
return;
}
viewedProfile = profile;
const isOwn = myProfile && profile.email === myProfile.email;
document.getElementById('page-name').textContent = profile.name;
document.getElementById('page-username').textContent = '@' + profile.username;
document.getElementById('page-location').textContent = '📍 ' + (profile.location || 'Населённый пункт не указан');
const votesCount = Object.keys(profile.ratings_map || {}).length;
document.getElementById('page-rating').innerHTML = renderStarsHTML(profile.rating, votesCount);
const imgEl = document.getElementById('page-avatar-img');
const placeEl = document.getElementById('page-avatar-placeholder');
if (profile.avatar) {
imgEl.src = profile.avatar;
imgEl.classList.remove('hidden');
placeEl.classList.add('hidden');
} else {
placeEl.textContent = profile.name.charAt(0).toUpperCase();
placeEl.classList.remove('hidden');
imgEl.classList.add('hidden');
}
const contactBox = document.getElementById('contact-buttons-box');
const tgLink = document.getElementById('tg-contact-link');
const waLink = document.getElementById('wa-contact-link');
const defaultMsg = encodeURIComponent('Здравствуйте! Пишу вам с сервиса «Няня рядом» по поводу присмотра за ребёнком.');
let hasContacts = false;
if (profile.telegram) {
const cleanTg = profile.telegram.replace(/^@/, '').trim();
tgLink.href = https://t.me{cleanTg}?text=${defaultMsg};
tgLink.classList.remove('hidden');
hasContacts = true;
} else {
tgLink.classList.add('hidden');
}
if (profile.whatsapp) {
const cleanWa = profile.whatsapp.replace(/\D/g, '');
waLink.href = https://wa.me{cleanWa}?text=${defaultMsg};
waLink.classList.remove('hidden');
hasContacts = true;
} else {
waLink.classList.add('hidden');
}
if (hasContacts) contactBox.classList.remove('hidden');
else contactBox.classList.add('hidden');
const uploadLabel = document.getElementById('avatar-upload-label');
const bioView = document.getElementById('bio-view-mode');
const bioForm = document.getElementById('bio-edit-form');
const passBox = document.getElementById('own-password-box');
const rateBox = document.getElementById('rate-user-box');
if (isOwn) {
uploadLabel.classList.remove('hidden');
bioView.classList.add('hidden');
bioForm.classList.remove('hidden');
const bioInput = document.getElementById('page-bio-input');
if (bioInput) bioInput.value = profile.bio || '';
document.getElementById('page-tg-input').value = profile.telegram || '';
document.getElementById('page-wa-input').value = profile.whatsapp || '';
passBox.classList.remove('hidden');
rateBox.classList.add('hidden');
} else {
uploadLabel.classList.add('hidden');
bioView.classList.remove('hidden');
bioForm.classList.add('hidden');
document.getElementById('page-bio-text').textContent = profile.bio || 'Участник пока не добавил информацию о себе.';
passBox.classList.add('hidden');
if (myProfile) {
rateBox.classList.remove('hidden');
const myPreviousVote = (profile.ratings_map || {})[myProfile.username] || 0;
highlightInteractiveStars(myPreviousVote);
document.getElementById('rate-status').textContent = myPreviousVote
? Ваша оценка: ${myPreviousVote} ★ (можно изменить)
: 'Нажмите на звезду, чтобы проголосовать';
} else {
rateBox.classList.add('hidden');
}
}
const { data: userAds } = await db.from('ads').select('title, comments').eq('author_username', profile.username);
const commentsContainer = document.getElementById('profile-comments-list');
commentsContainer.innerHTML = '';
let hasComments = false;
if (userAds) {
userAds.forEach(ad => {
(ad.comments || []).forEach(c => {
hasComments = true;
const div = document.createElement('div');
div.className = 'comment-item';
div.innerHTML = <span class="muted-text">К объявлению «${ad.title}»:</span><br><strong>${c.author}:</strong> ${c.text};
commentsContainer.appendChild(div);
});
});
}
if (!hasComments) {
commentsContainer.innerHTML = 'Комментариев к объявлениям этого участника пока нет.';
}
showView('view-profile');
}
const starButtons = document.querySelectorAll('.star-btn');
function highlightInteractiveStars(count, isHover = false) {
starButtons.forEach(btn => {
const val = Number(btn.dataset.value);
btn.classList.remove('hovered', 'clicked');
if (val <= count) {
btn.classList.add(isHover ? 'hovered' : 'clicked');
}
});
}
starButtons.forEach(btn => {
btn.addEventListener('mouseenter', () => {
const hoverVal = Number(btn.dataset.value);
highlightInteractiveStars(hoverVal, true);
});
btn.addEventListener('mouseleave', () => {
if (!viewedProfile || !myProfile) return;
const myVote = (viewedProfile.ratings_map || {})[myProfile.username] || 0;
highlightInteractiveStars(myVote, false);
});
btn.addEventListener('click', async () => {
if (!viewedProfile || !myProfile) return;
if (viewedProfile.email === myProfile.email) {
alert('Нельзя голосовать за собственный рейтинг.');
return;
}
const chosenStars = Number(btn.dataset.value);
highlightInteractiveStars(chosenStars, false);
const updatedMap = { ...(viewedProfile.ratings_map || {}), [myProfile.username]: chosenStars };
const allVotes = Object.values(updatedMap).map(Number);
const sum = allVotes.reduce((acc, v) => acc + v, 0);
const newAverage = sum / allVotes.length;
await db.from('profiles')
.update({ rating: newAverage, ratings_map: updatedMap })
.eq('username', viewedProfile.username);
await db.from('ads')
.update({ rating: newAverage })
.eq('author_username', viewedProfile.username);
viewedProfile.rating = newAverage;
viewedProfile.ratings_map = updatedMap;
document.getElementById('page-rating').innerHTML = renderStarsHTML(newAverage, allVotes.length);
document.getElementById('rate-status').textContent = Спасибо! Ваша оценка (${chosenStars} ★) учтена.;
});
});
document.getElementById('bio-edit-form').addEventListener('submit', async (e) => {
e.preventDefault();
if (!myProfile) return;
const bioInput = document.getElementById('page-bio-input');
const newBio = bioInput ? bioInput.value.trim() : '';
const newTg = document.getElementById('page-tg-input').value.trim().replace(/^@/, '');
const newWa = document.getElementById('page-wa-input').value.trim();
const { error } = await db.from('profiles')
.update({ bio: newBio, telegram: newTg, whatsapp: newWa })
.eq('email', myProfile.email);
if (error) {
alert('Ошибка при сохранении профиля: ' + error.message);
return;
}
myProfile.bio = newBio;
myProfile.telegram = newTg;
myProfile.whatsapp = newWa;
openOwnProfile();
alert('Данные профиля и контакты для связи сохранены!');
});
document.getElementById('avatar-upload').addEventListener('change', function(e) {
const file = e.target.files ? e.target.files.item(0) : null;
if (!file || !myProfile) return;
const reader = new FileReader();
reader.onload = function(event) {
const img = new Image();
img.onload = async function() {
const canvas = document.createElement('canvas');
canvas.width = 140;
canvas.height = 140;
const ctx = canvas.getContext('2d');
ctx.drawImage(img, 0, 0, 140, 140);
const base64 = canvas.toDataURL('image/jpeg', 0.8);
await db.from('profiles').update({ avatar: base64 }).eq('email', myProfile.email);
await db.from('ads').update({ avatar: base64 }).eq('author_username', myProfile.username);
myProfile.avatar = base64;
updateNavbarProfile();
openOwnProfile();
alert('Фото профиля обновлено!');
};
img.src = event.target.result;
};
reader.readAsDataURL(file);
});
document.getElementById('change-password-form').addEventListener('submit', async (e) => {
e.preventDefault();
const newPassword = document.getElementById('new-password').value;
const { error } = await db.auth.updateUser({ password: newPassword });
if (error) alert('Ошибка: ' + error.message);
else {
alert('Пароль успешно изменён!');
e.target.reset();
}
});
if (userLoginSearch) {
userLoginSearch.addEventListener('input', function() {
const q = this.value.trim().replace(/^@/, '').toLowerCase();
clearTimeout(userSearchTimeout);
if (q.length < 1) {
userSearchResults.classList.add('hidden');
return;
}
userSearchTimeout = setTimeout(async () => {
const { data } = await db.from('profiles')
.select('username, name, location')
.ilike('username', %${q}%)
.limit(8);
userSearchResults.innerHTML = '';
if (!data || data.length === 0) {
userSearchResults.classList.add('hidden');
return;
}
data.forEach(u => {
const li = document.createElement('li');
li.textContent = @${u.username} — ${u.name} (${u.location || 'РФ'});
li.onclick = () => {
userLoginSearch.value = '';
userSearchResults.classList.add('hidden');
openUserProfile(u.username);
};
userSearchResults.appendChild(li);
});
userSearchResults.classList.remove('hidden');
}, 300);
});
}
// ==========================================
// 4. ОБЪЯВЛЕНИЯ: ДАТЫ, РЕДАКТИРОВАНИЕ И ФИЛЬТРЫ
// ==========================================
function formatDate(timestamp) {
if (!timestamp) return 'Недавно';
const d = new Date(Number(timestamp));
return d.toLocaleString('ru-RU', {
day: '2-digit', month: '2-digit', year: 'numeric',
hour: '2-digit', minute: '2-digit'
});
}
async function loadAds() {
refreshAdsBtn.disabled = true;
refreshAdsBtn.textContent = '⏳ Обновляем...';
const { data, error } = await db.from('ads').select('*').order('updated_at', { ascending: false });
if (error) {
console.error(error);
ads = [];
} else {
ads = data || [];
}
renderAds();
refreshAdsBtn.disabled = false;
refreshAdsBtn.textContent = '🔄 Обновить объявления';
}
refreshAdsBtn.addEventListener('click', loadAds);
adForm.addEventListener('submit', async (e) => {
e.preventDefault();
if (!myProfile) return;
const editId = document.getElementById('edit-ad-id').value;
const now = Date.now();
const adPayload = {
title: document.getElementById('ad-title').value.trim(),
location: document.getElementById('ad-location').value.trim(),
text: document.getElementById('ad-text').value.trim(),
isPaid: document.getElementById('is-paid').checked,
isFree: document.getElementById('is-free').checked,
updated_at: now
};
if (editId) {
const { error } = await db.from('ads').update(adPayload).eq('id', editId);
if (error) {
alert('Ошибка при обновлении: ' + error.message);
return;
}
cancelEdit();
} else {
const newAd = {
...adPayload,
author: myProfile.name,
author_username: myProfile.username,
author_email: myProfile.email,
avatar: myProfile.avatar || '',
rating: myProfile.rating || 0,
likes: 0,
comments: []
};
const { error } = await db.from('ads').insert([newAd]);
if (error) {
alert('Ошибка публикации: ' + error.message);
return;
}
adForm.reset();
document.getElementById('ad-location').value = myProfile.location || '';
}
loadAds();
});
function startEditAd(id) {
const ad = ads.find(item => String(item.id) === String(id));
if (!ad) return;
document.getElementById('edit-ad-id').value = ad.id;
document.getElementById('ad-location').value = ad.location || '';
document.getElementById('ad-title').value = ad.title;
document.getElementById('ad-text').value = ad.text;
document.getElementById('is-paid').checked = ad.isPaid;
document.getElementById('is-free').checked = ad.isFree;
document.getElementById('editor-title').textContent = '✏️ Редактирование объявления (поднимется вверх)';
document.getElementById('ad-submit-btn').textContent = 'Сохранить и поднять вверх';
document.getElementById('cancel-edit-btn').classList.remove('hidden');
window.scrollTo(0, 0);
}
function cancelEdit() {
document.getElementById('edit-ad-id').value = '';
adForm.reset();
if (myProfile) document.getElementById('ad-location').value = myProfile.location || '';
document.getElementById('editor-title').textContent = 'Разместить новое объявление';
document.getElementById('ad-submit-btn').textContent = 'Опубликовать объявление';
document.getElementById('cancel-edit-btn').classList.add('hidden');
}
async function deleteAd(id) {
if (confirm('Удалить это объявление?')) {
await db.from('ads').delete().eq('id', id);
loadAds();
}
}
async function toggleLike(id) {
const ad = ads.find(item => String(item.id) === String(id));
if (!ad) return;
ad.likes = (ad.likes || 0) + 1;
renderAds();
await db.from('ads').update({ likes: ad.likes }).eq('id', ad.id);
}
async function addComment(event, id) {
event.preventDefault();
const input = event.target.querySelector('input');
const text = input.value.trim();
if (!text) return;
const ad = ads.find(item => String(item.id) === String(id));
if (!ad) return;
const authorLabel = myProfile ? ${myProfile.name} (@${myProfile.username}) : 'Участник';
const updatedComments = [...(ad.comments || []), { author: authorLabel, text }];
ad.comments = updatedComments;
renderAds();
await db.from('ads').update({ comments: updatedComments }).eq('id', ad.id);
}
function renderAds() {
adsList.innerHTML = '';
const now = Date.now();
const filteredAds = ads.filter(ad => {
const matchesPay =
currentPayFilter === 'all' ||
(currentPayFilter === 'paid' && ad.isPaid) ||
(currentPayFilter === 'free' && ad.isFree);
let matchesDate = true;
if (currentDaysFilter !== 'all' && ad.updated_at) {
const diffDays = (now - Number(ad.updated_at)) / (1000 * 60 * 60 * 24);
matchesDate = diffDays <= Number(currentDaysFilter);
}
const q = searchQuery.toLowerCase();
const matchesSearch =
ad.title.toLowerCase().includes(q) ||
ad.text.toLowerCase().includes(q) ||
ad.author.toLowerCase().includes(q);
const lq = locationFilterQuery.toLowerCase();
const matchesLocation = !lq || (ad.location && ad.location.toLowerCase().includes(lq));
return matchesPay && matchesDate && matchesSearch && matchesLocation;
});
if (filteredAds.length === 0) {
adsList.innerHTML = 'По выбранным фильтрам объявлений пока нет.';
return;
}
filteredAds.forEach(ad => {
let badgesHTML = '';
if (ad.isPaid) badgesHTML += '💰 Платно';
if (ad.isFree) badgesHTML += '🆓 Бесплатно';
const avatarHTML = ad.avatar
? <img src="${ad.avatar}" alt="${ad.author}" class="avatar-mini">
: <div class="avatar-mini placeholder">${ad.author.charAt(0).toUpperCase()}</div>;
const starsHTML = renderStarsHTML(ad.rating);
const isAuthor = myProfile && ad.author_email === myProfile.email;
const ownerControlsHTML = isAuthor ? <div class="ad-actions"> <button type="button" class="btn-edit" onclick="startEditAd('${ad.id}')">✏️ Редактировать</button> <button type="button" class="btn-delete" onclick="deleteAd('${ad.id}')">🗑 Удалить</button> </div> : '';
const commentsListHTML = (ad.comments || []).map(c =>
<div class="comment-item"><strong>${c.author}:</strong> ${c.text}</div>
).join('');
const article = document.createElement('article');
article.innerHTML = `


${avatarHTML}

${ad.author} (@${ad.author_username || 'user'})
${starsHTML}



🕒 ${formatDate(ad.updated_at)}
${ownerControlsHTML}

📍 ${ad.location || 'Местоположение не указано'}
${ad.title}
${ad.text}
${badgesHTML}
❤️ Нравится (${ad.likes || 0})
${commentsListHTML || 'Комментариев пока нет'}


Отправить


`;
adsList.appendChild(article);
});
}
document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
btn.addEventListener('click', function() {
document.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
this.classList.add('active');
currentPayFilter = this.dataset.filter;
renderAds();
});
});
document.querySelectorAll('.date-btn').forEach(btn => {
btn.addEventListener('click', function() {
document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
this.classList.add('active');
currentDaysFilter = this.dataset.days;
renderAds();
});
});
myCityBtn.addEventListener('click', () => {
if (!myProfile || !myProfile.location) return;
isMyCityOnly = !isMyCityOnly;
if (isMyCityOnly) {
myCityBtn.classList.add('active');
const cityParts = myProfile.location.split(',');
const mainCity = (cityParts.at(0) || '').trim();
document.getElementById('location-filter-input').value = mainCity;
locationFilterQuery = mainCity;
} else {
myCityBtn.classList.remove('active');
document.getElementById('location-filter-input').value = '';
locationFilterQuery = '';
}
renderAds();
});
document.getElementById('search-input').addEventListener('input', function() {
searchQuery = this.value.trim();
renderAds();
});
document.getElementById('location-filter-input').addEventListener('input', function() {
locationFilterQuery = this.value.trim();
if (isMyCityOnly) {
isMyCityOnly = false;
myCityBtn.classList.remove('active');
}
renderAds();
});
