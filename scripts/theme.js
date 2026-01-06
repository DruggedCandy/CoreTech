// Управління темною темою

// Інітіалізація теми при завантаженні сторінки
document.addEventListener('DOMContentLoaded', function() {
    // Перевіримо, чи користувач мав темну тему раніше
    const isDarkTheme = localStorage.getItem('darkTheme') === 'true';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Встановимо тему (користувацька або за замовчуванням)
    if (isDarkTheme) {
        enableDarkTheme();
    } else if (prefersDark && localStorage.getItem('darkTheme') === null) {
        // Якщо користувач не вибирав, але ОС в темній темі
        enableDarkTheme();
    }
    
    // Встановимо слухача на кнопку переключення
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
});

function enableDarkTheme() {
    document.body.classList.add('dark-theme');
    localStorage.setItem('darkTheme', 'true');
    updateThemeToggleIcon();
}

function disableDarkTheme() {
    document.body.classList.remove('dark-theme');
    localStorage.setItem('darkTheme', 'false');
    updateThemeToggleIcon();
}

function toggleTheme() {
    if (document.body.classList.contains('dark-theme')) {
        disableDarkTheme();
    } else {
        enableDarkTheme();
    }
}

function updateThemeToggleIcon() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (document.body.classList.contains('dark-theme')) {
            icon.className = 'bi bi-sun-fill';
        } else {
            icon.className = 'bi bi-moon-stars';
        }
    }
}

// Слухаємо зміни темної теми в ОС
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (localStorage.getItem('darkTheme') === null) {
        if (e.matches) {
            enableDarkTheme();
        } else {
            disableDarkTheme();
        }
    }
});
