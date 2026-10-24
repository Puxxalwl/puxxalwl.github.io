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
        const dark = isDark();
        const label = language === 'ru'
            ? (dark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему')
            : (dark ? 'Switch to light theme' : 'Switch to dark theme');
        const button = document.querySelector('.theme-toggle');
        // This is an action button: its name describes the next action, not a pressed state.
        button?.setAttribute('aria-label', label);
        button?.setAttribute('title', label);
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#20241f' : '#f6f4ed');
    }

    function updateLanguage() {
        root.lang = language;
        const russian = language === 'ru';
        const button = document.querySelector('.language-toggle');
        if (button) {
            button.textContent = russian ? 'EN' : 'RU';
            button.setAttribute('aria-label', russian ? 'Switch to English' : 'Переключить на русский');
            button.lang = russian ? 'en' : 'ru';
        }
        document.querySelector('.home-link')?.setAttribute('aria-label', russian ? 'puxxalwl, в начало' : 'puxxalwl, back to top');
        document.querySelector('nav')?.setAttribute('aria-label', russian ? 'Основная навигация' : 'Main navigation');

        const title = russian ? 'puxxalwl — независимый разработчик' : 'puxxalwl — independent developer';
        const description = russian
            ? 'Я Руслан, независимый разработчик. Работаю над Stille Messenger и Volt.NET, интересуюсь системами и сетями.'
            : "I'm Ruslan, an independent developer working on Stille Messenger and Volt.NET, with an interest in systems and networking.";
        const imageAlt = russian
            ? 'puxxalwl — независимый разработчик. Stille Messenger · Volt.NET.'
            : 'puxxalwl — independent developer. Stille Messenger · Volt.NET.';
        document.title = title;
        for (const [selector, value] of [
            ['meta[name="description"]', description],
            ['meta[property="og:title"]', title],
            ['meta[property="og:description"]', description],
            ['meta[property="og:locale"]', russian ? 'ru_RU' : 'en_US'],
            ['meta[property="og:locale:alternate"]', russian ? 'en_US' : 'ru_RU'],
            ['meta[property="og:image:alt"]', imageAlt],
            ['meta[name="twitter:title"]', title],
            ['meta[name="twitter:description"]', description],
            ['meta[name="twitter:image:alt"]', imageAlt],
        ]) document.querySelector(selector)?.setAttribute('content', value);
        updateThemeControls();
    }

    updateThemeControls();
    document.addEventListener('DOMContentLoaded', () => {
        const themeButton = document.querySelector('.theme-toggle');
        const languageButton = document.querySelector('.language-toggle');
        themeButton?.addEventListener('click', () => {
            preference = isDark() ? 'light' : 'dark';
            root.dataset.theme = preference;
            try { localStorage.setItem('puxxalwl-theme', preference); } catch {}
            updateThemeControls();
        });
        languageButton?.addEventListener('click', () => {
            language = language === 'ru' ? 'en' : 'ru';
            try { localStorage.setItem('puxxalwl-language', language); } catch {}
            updateLanguage();
        });
        updateLanguage();
        if (themeButton) themeButton.hidden = false;
        if (languageButton) languageButton.hidden = false;
    });

    systemTheme.addEventListener('change', updateThemeControls);
})();
