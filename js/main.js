(() => {
    const root = document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    let preference = null;
    let language = 'ru';

    try {
        const savedTheme = localStorage.getItem('puxxalwl-theme');
        if (savedTheme === 'light' || savedTheme === 'dark') preference = savedTheme;
        const savedLanguage = localStorage.getItem('puxxalwl-language');
        if (savedLanguage === 'ru' || savedLanguage === 'en') language = savedLanguage;
    } catch {}

    if (preference) root.dataset.theme = preference;
    root.lang = language;

    function isDark() {
        return preference ? preference === 'dark' : systemTheme.matches;
    }

    function updateThemeControls() {
        document.querySelector('.theme-toggle')?.setAttribute('aria-pressed', String(isDark()));
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark() ? '#20241f' : '#f6f4ed');
    }

    function updateLanguage() {
        document.querySelectorAll('[data-lang]').forEach((element) => {
            element.hidden = element.dataset.lang !== language;
        });
        const button = document.querySelector('.language-toggle');
        if (button) {
            button.hidden = false;
            button.textContent = language === 'ru' ? 'EN' : 'RU';
            button.setAttribute('aria-label', language === 'ru' ? 'Switch to English' : 'Переключить на русский');
            button.lang = language === 'ru' ? 'en' : 'ru';
        }
        root.lang = language;
        document.querySelector('.theme-toggle')?.setAttribute('aria-label', language === 'ru' ? 'Тёмная тема' : 'Dark theme');
        document.querySelector('.home-link')?.setAttribute('aria-label', language === 'ru' ? 'puxxalwl, в начало' : 'puxxalwl, back to top');
        document.querySelector('nav')?.setAttribute('aria-label', language === 'ru' ? 'Основная навигация' : 'Main navigation');
        document.querySelector('.personal-notes')?.setAttribute('aria-label', language === 'ru' ? 'Личные сведения' : 'Personal details');
        document.title = language === 'ru' ? 'puxxalwl — независимый разработчик' : 'puxxalwl — independent developer';
        document.querySelector('meta[name="description"]')?.setAttribute('content', language === 'ru'
            ? 'puxxalwl — независимый разработчик, интересующийся системами и сетями. Stille Messenger и Volt.NET.'
            : "puxxalwl — an independent developer interested in systems and networking. Stille Messenger and Volt.NET.");
    }

    document.addEventListener('DOMContentLoaded', () => {
        const themeButton = document.querySelector('.theme-toggle');
        const languageButton = document.querySelector('.language-toggle');
        if (themeButton) {
            themeButton.hidden = false;
            themeButton.addEventListener('click', () => {
                preference = isDark() ? 'light' : 'dark';
                root.dataset.theme = preference;
                try { localStorage.setItem('puxxalwl-theme', preference); } catch {}
                updateThemeControls();
            });
        }
        languageButton?.addEventListener('click', () => {
            language = language === 'ru' ? 'en' : 'ru';
            try { localStorage.setItem('puxxalwl-language', language); } catch {}
            updateLanguage();
        });
        updateThemeControls();
        updateLanguage();
    });

    systemTheme.addEventListener('change', updateThemeControls);
})();
