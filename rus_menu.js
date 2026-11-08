/*
 * «Русское» — раздел с российскими фильмами и сериалами для Lampa.
 * Только каталог (данные TMDB), видео плагин не содержит.
 * Работает с обычной Lampa, источник данных — TMDB.
 * Версия 12: обложки на плитках, настройки плагина, блоки «По годам» и «Подборки», Амедиатека.
 */
(function () {
    'use strict';

    if (window.rus_menu_plugin) return;
    window.rus_menu_plugin = true;

    var COMPONENT = 'rus_menu';
    var RU = 'with_origin_country=RU';
    var SU = 'with_origin_country=SU';

    // ---------- даты ----------

    function fmt(d) {
        return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    }

    function daysAgo(n) {
        var d = new Date();
        d.setDate(d.getDate() - n);
        return fmt(d);
    }

    function range(from, to) {
        return '&primary_release_date.gte=' + from + '-01-01&primary_release_date.lte=' + to + '-12-31';
    }

    // ---------- настройки ----------

    function opt(name, def) {
        try {
            var v = Lampa.Storage.get(name, def);
            if (v === undefined || v === null || v === '') return def;
            if (typeof def === 'boolean') return v === true || v === 'true';
            return v;
        } catch (e) {
            return def;
        }
    }

    var SECTIONS = [
        ['now', 'Сейчас смотрят'],
        ['cinemas', 'Онлайн-кинотеатры'],
        ['channels', 'Телеканалы'],
        ['cartoons', 'Мультфильмы'],
        ['films', 'Фильмы и сериалы'],
        ['picks', 'Подборки'],
        ['years', 'По годам'],
        ['genres', 'Жанры']
    ];

    function sectionOn(key) {
        return opt('rus_menu_sec_' + key, true);
    }

    function cinemaOn(id) {
        return opt('rus_menu_cin_' + id, true);
    }

    // ---------- значки (простые, собственные) ----------

    function svg(inner) {
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
            'stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
    }

    var ICONS = {
        fire: svg('<path d="M12 3c1 3 4 5 4 9a4 4 0 0 1-8 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 0-8z"/>'),
        film: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>'),
        series: svg('<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 3l4 3 4-3"/>'),
        play: svg('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9l5 3-5 3z"/>'),
        tv: svg('<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>'),
        smile: svg('<circle cx="12" cy="12" r="9"/><path d="M8 14c1 2 7 2 8 0"/><path d="M9 9h.01M15 9h.01"/>'),
        star: svg('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'),
        news: svg('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>'),
        clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>'),
        calendar: svg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
        timer: svg('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M10 2h4"/>'),
        check: svg('<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>'),
        list: svg('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'),
        laugh: svg('<circle cx="12" cy="12" r="9"/><path d="M7 13h10a5 5 0 0 1-10 0z"/>'),
        drama: svg('<circle cx="12" cy="12" r="9"/><path d="M8 16c1-2 7-2 8 0"/><path d="M9 9h.01M15 9h.01"/>'),
        bolt: svg('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'),
        shield: svg('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>'),
        lock: svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
        search: svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'),
        eye: svg('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
        rocket: svg('<path d="M5 15c-1 1-2 4-2 6 2 0 5-1 6-2M9 15l-3-3c2-6 7-9 14-9 0 7-3 12-9 14z"/><circle cx="15" cy="9" r="1.5"/>'),
        column: svg('<path d="M4 21h16M6 18V9M10 18V9M14 18V9M18 18V9M3 9l9-5 9 5z"/>'),
        home: svg('<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
        heart: svg('<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>'),
        hammer: svg('<path d="M4 20l9-9M12 4l8 8-3 3-8-8z"/>'),
        flame: svg('<path d="M12 21a6 6 0 0 1-6-6c0-4 6-8 6-12 0 4 6 8 6 12a6 6 0 0 1-6 6z"/>'),
        adult: '<span class="rus-tile__badge">18+</span>'
    };

    // ---------- кинотеатры и каналы ----------
    // Номера сетей проверены по страницам themoviedb.org/network/<id>.
    // У Амедиатеки своей сети в TMDB нет — для неё берём только данные «где посмотреть».

    var CINEMAS = [
        { id: 3827, name: 'Кинопоиск', c1: '#ff5c00', c2: '#ffa31a', match: /кинопоиск|kinopoisk/i },
        { id: 3871, name: 'Okko', c1: '#4b1ad6', c2: '#8c5cff', match: /^okko/i },
        { id: 3923, name: 'Иви', c1: '#e3003b', c2: '#ff4a76', match: /^ivi|^иви/i },
        { id: 5806, name: 'Wink', c1: '#ff4a1c', c2: '#ff8a3d', match: /^wink/i },
        { id: 2493, name: 'START', c1: '#121214', c2: '#3a3a42', match: /^start(\.ru)?$/i },
        { id: 2859, name: 'PREMIER', c1: '#f5c400', c2: '#ffe066', light: true, match: /^premier/i },
        { id: 4085, name: 'KION', c1: '#6b1fd1', c2: '#d83aa0', match: /^kion|^кион/i },
        { id: 3882, name: 'more.tv', c1: '#0a4dff', c2: '#3f9bff', match: /^more\.?\s?tv/i },
        { id: 'amediateka', name: 'Амедиатека', c1: '#0d0d0d', c2: '#3b2a1a', match: /amediateka|амедиатека/i, noNetwork: true }
    ];

    var CHANNELS = [
        [558, 'Первый канал', '#0b3d91', '#1e7be0'],
        [1199, 'НТВ', '#1a5f1f', '#3fa046'],
        [1191, 'ТНТ', '#3f0f86', '#8a2bc2'],
        [806, 'СТС', '#e04e00', '#ffae00']
    ];

    var GENRES = [
        [35, 'Комедии', 'laugh'], [18, 'Драмы', 'drama'], [28, 'Боевики', 'bolt'],
        [10752, 'Военные', 'shield'], [80, 'Криминал', 'lock'], [9648, 'Детективы', 'search'],
        [53, 'Триллеры', 'eye'], [878, 'Фантастика', 'rocket'], [36, 'Исторические', 'column'],
        [10751, 'Семейные', 'home'], [10749, 'Мелодрамы', 'heart']
    ];

    // Языки оригинала для «Эротики» и «18+»
    var WEST_LANGS = ['en', 'ru', 'uk', 'fr', 'de', 'it', 'es', 'pt', 'nl', 'sv', 'da', 'no', 'fi',
        'pl', 'cs', 'sk', 'hu', 'ro', 'el', 'sr', 'hr', 'bg'].join('|');

    // ---------- данные TMDB, которые ищем при первом открытии ----------

    function tmdbGet(path, ok, fail) {
        try {
            var net = new Lampa.Reguest();
            var sep = path.indexOf('?') >= 0 ? '&' : '?';
            var url = Lampa.TMDB.api(path + sep + 'api_key=' + Lampa.TMDB.key());

            net.timeout(8000);
            net.silent(url, ok, fail);
        } catch (e) {
            fail();
        }
    }

    // Провайдеры «где посмотреть» в России: id кинотеатра -> id провайдера
    var providers = null;
    var providersFallback = {};

    function loadProviders(done) {
        if (providers) return done();

        tmdbGet('watch/providers/movie?watch_region=RU&language=ru', function (json) {
            var found = {};

            ((json && json.results) || []).forEach(function (p) {
                CINEMAS.forEach(function (c) {
                    if (!found[c.id] && c.match.test(String(p.provider_name || ''))) found[c.id] = p.provider_id;
                });
            });

            providers = found;
            providersFallback = found;
            done();
        }, function () {
            done(); // при ошибке не запоминаем — в следующий раз попробуем снова
        });
    }

    function prov(id) {
        return (providers || providersFallback)[id];
    }

    function provAll() {
        var map = providers || providersFallback;
        var list = [];
        for (var id in map) list.push(map[id]);
        return list.join('|');
    }

    // Ключевое слово «основано на реальных событиях»; 9672 — запасной вариант
    var TRUE_STORY_FALLBACK = '9672';
    var trueStory = null;

    function loadTrueStory(done) {
        if (trueStory) return done();

        tmdbGet('search/keyword?query=' + encodeURIComponent('based on true story'), function (json) {
            var ids = [];

            ((json && json.results) || []).forEach(function (k) {
                var name = String(k.name || '').toLowerCase();
                if (name === 'based on true story' || name === 'based on a true story') ids.push(k.id);
            });

            trueStory = ids.length ? ids.join('|') : TRUE_STORY_FALLBACK;
            done();
        }, function () {
            done();
        });
    }

    function trueStoryIds() {
        return trueStory || TRUE_STORY_FALLBACK;
    }

    // ---------- как отсортирована подборка ----------

    function sortLabel(url) {
        if (/sort_by=popularity/.test(url)) return 'популярные';
        if (/sort_by=(primary_release_date|first_air_date)\.desc/.test(url)) return 'новинки';
        if (/sort_by=vote_average/.test(url)) return 'лучшие по оценкам';
        if (/sort_by=vote_count/.test(url)) return 'известные';
        return '';
    }

    function tileSub(tile) {
        var sub = tile.sub || '';
        var label = tile.url ? sortLabel(tile.url) : '';

        if (tile.service || !label || /популяр|новинк|лучш|известн/i.test(sub + ' ' + tile.title)) return sub;
        return sub ? sub + ' · ' + label : label.charAt(0).toUpperCase() + label.slice(1);
    }

    // ---------- плитки ----------

    function cinemaSeriesUrl(c, sort) {
        var t = fmt(new Date());
        var by = sort === 'new' ? '&sort_by=first_air_date.desc&first_air_date.lte=' + t : '&sort_by=popularity.desc';

        if (!c.noNetwork) return 'discover/tv?with_networks=' + c.id + by;

        var pid = prov(c.id);
        return pid ? 'discover/tv?with_watch_providers=' + pid + '&watch_region=RU' + by : '';
    }

    function cinemaSections(c) {
        var t = fmt(new Date());
        var tiles = [];
        var pid = prov(c.id);

        function add(title, sub, icon, url) {
            if (url) tiles.push({ title: title, sub: sub, icon: icon, url: url, c1: c.c1, c2: c.c2, light: c.light });
        }

        add('Сериалы', 'Популярные', 'series', cinemaSeriesUrl(c, 'popular'));
        add('Сериалы', 'Новинки', 'clock', cinemaSeriesUrl(c, 'new'));

        if (pid) {
            var base = 'discover/movie?with_watch_providers=' + pid + '&watch_region=RU';
            add('Фильмы', 'Популярные', 'film', base + '&sort_by=popularity.desc');
            add('Фильмы', 'Новинки', 'clock', base + '&sort_by=primary_release_date.desc&primary_release_date.lte=' + t);
            add('Русские фильмы', 'Популярные', 'star', base + '&' + RU + '&sort_by=popularity.desc');
        }

        return [{ title: c.name, tiles: tiles }];
    }

    function sections() {
        var t = fmt(new Date());
        var year = new Date().getFullYear();
        var allNetworks = CINEMAS.filter(function (c) { return !c.noNetwork; }).map(function (c) { return c.id; }).join('|');
        var list = [];

        function section(key, tiles) {
            if (sectionOn(key) && tiles.length) {
                SECTIONS.forEach(function (s) { if (s[0] === key) list.push({ title: s[1], tiles: tiles }); });
            }
        }

        // Сейчас смотрят
        var now = [
            { title: 'Фильмы', sub: 'Популярно сейчас', icon: 'fire', url: 'discover/movie?' + RU + '&sort_by=popularity.desc&primary_release_date.gte=' + daysAgo(120) + '&primary_release_date.lte=' + t, c1: '#b3122a', c2: '#ff4d4d' },
            { title: 'Сериалы', sub: 'Популярно сейчас', icon: 'fire', url: 'discover/tv?' + RU + '&sort_by=popularity.desc&air_date.gte=' + daysAgo(30) + '&air_date.lte=' + t, c1: '#8a0f5c', c2: '#e83e8c' },
            { title: 'Новинки кинотеатров', sub: 'Сериалы', icon: 'news', url: 'discover/tv?with_networks=' + allNetworks + '&sort_by=first_air_date.desc&first_air_date.lte=' + t, c1: '#1f2a44', c2: '#4b6cb7' }
        ];
        if (provAll()) {
            now.push({ title: 'Новинки кинотеатров', sub: 'Фильмы', icon: 'news', url: 'discover/movie?with_watch_providers=' + provAll() + '&watch_region=RU&sort_by=primary_release_date.desc&primary_release_date.lte=' + t + '&vote_count.gte=1', c1: '#14365c', c2: '#2f80c9' });
        }
        section('now', now);

        // Онлайн-кинотеатры
        section('cinemas', CINEMAS.filter(function (c) {
            if (!cinemaOn(c.id)) return false;
            return !c.noNetwork || prov(c.id); // Амедиатеку показываем, только если TMDB о ней знает
        }).map(function (c) {
            return {
                title: c.name, sub: prov(c.id) ? 'Фильмы и сериалы' : 'Сериалы', icon: 'play',
                service: c.id, url: cinemaSeriesUrl(c, 'popular'), c1: c.c1, c2: c.c2, light: c.light
            };
        }));

        // Телеканалы
        section('channels', CHANNELS.map(function (n) {
            return { title: n[1], sub: 'Сериалы', icon: 'tv', url: 'discover/tv?with_networks=' + n[0] + '&sort_by=popularity.desc', c1: n[2], c2: n[3] };
        }));

        // Мультфильмы
        section('cartoons', [
            { title: 'Мультфильмы', sub: 'Популярные', icon: 'smile', url: 'discover/movie?' + RU + '&with_genres=16&sort_by=popularity.desc', c1: '#00897b', c2: '#3dd6b5' },
            { title: 'Мультсериалы', sub: 'Популярные', icon: 'smile', url: 'discover/tv?' + RU + '&with_genres=16&sort_by=popularity.desc', c1: '#0077a8', c2: '#35c3e8' },
            { title: 'Советские', sub: 'Мультфильмы', icon: 'star', url: 'discover/movie?' + SU + '&with_genres=16&sort_by=vote_count.desc', c1: '#b23a00', c2: '#ff7a3d' }
        ]);

        // Фильмы и сериалы
        section('films', [
            { title: 'Фильмы', sub: 'Популярные', icon: 'film', url: 'discover/movie?' + RU + '&sort_by=popularity.desc', c1: '#23308f', c2: '#5868d6' },
            { title: 'Фильмы', sub: 'Новинки', icon: 'clock', url: 'discover/movie?' + RU + '&sort_by=primary_release_date.desc&primary_release_date.lte=' + t + '&vote_count.gte=5', c1: '#0f5fb8', c2: '#3fa7f5' },
            { title: 'Фильмы', sub: 'Лучшие', icon: 'star', light: true, url: 'discover/movie?' + RU + '&sort_by=vote_average.desc&vote_count.gte=200', c1: '#f2b705', c2: '#ffd95a' },
            { title: 'Сериалы', sub: 'Популярные', icon: 'series', url: 'discover/tv?' + RU + '&sort_by=popularity.desc', c1: '#3e2196', c2: '#7b55d6' },
            { title: 'Сериалы', sub: 'Новинки', icon: 'clock', url: 'discover/tv?' + RU + '&sort_by=first_air_date.desc&first_air_date.lte=' + t + '&vote_count.gte=3', c1: '#651a95', c2: '#b24ad1' },
            { title: 'Сериалы', sub: 'Лучшие', icon: 'star', url: 'discover/tv?' + RU + '&sort_by=vote_average.desc&vote_count.gte=100', c1: '#d65a00', c2: '#ffa13d' },
            { title: 'Советское кино', sub: 'Фильмы', icon: 'hammer', url: 'discover/movie?' + SU + '&sort_by=vote_count.desc', c1: '#7a1010', c2: '#c62828' }
        ]);

        // Подборки по качеству и формату
        section('picks', [
            { title: 'Рейтинг 7+', sub: 'Фильмы', icon: 'star', url: 'discover/movie?' + RU + '&vote_average.gte=7&vote_count.gte=50&sort_by=popularity.desc', c1: '#6b5300', c2: '#c9a400' },
            { title: 'Рейтинг 7+', sub: 'Сериалы', icon: 'star', url: 'discover/tv?' + RU + '&vote_average.gte=7&vote_count.gte=30&sort_by=popularity.desc', c1: '#5c4700', c2: '#b08f00' },
            { title: 'Короткие', sub: 'До 90 мин', icon: 'timer', url: 'discover/movie?' + RU + '&with_runtime.gte=40&with_runtime.lte=90&sort_by=popularity.desc', c1: '#004d40', c2: '#00897b' },
            { title: 'Мини-сериалы', sub: 'Популярные', icon: 'list', url: 'discover/tv?' + RU + '&with_type=2&sort_by=popularity.desc', c1: '#263238', c2: '#546e7a' },
            { title: 'Сериалы', sub: 'Завершённые', icon: 'check', url: 'discover/tv?' + RU + '&with_status=3&sort_by=popularity.desc', c1: '#1b3a2a', c2: '#2e7d4f' }
        ]);

        // По годам
        var years = [
            { title: String(year), sub: 'Фильмы', icon: 'calendar', url: 'discover/movie?' + RU + '&primary_release_year=' + year + '&sort_by=popularity.desc', c1: '#283593', c2: '#3f51b5' },
            { title: String(year - 1), sub: 'Фильмы', icon: 'calendar', url: 'discover/movie?' + RU + '&primary_release_year=' + (year - 1) + '&sort_by=popularity.desc', c1: '#1a237e', c2: '#3949ab' },
            { title: '2010-е', sub: 'Фильмы', icon: 'calendar', url: 'discover/movie?' + RU + range(2010, 2019) + '&sort_by=popularity.desc', c1: '#311b92', c2: '#5e35b1' },
            { title: '2000-е', sub: 'Фильмы', icon: 'calendar', url: 'discover/movie?' + RU + range(2000, 2009) + '&sort_by=popularity.desc', c1: '#4a148c', c2: '#7b1fa2' },
            { title: '90-е', sub: 'Фильмы', icon: 'calendar', url: 'discover/movie?' + RU + range(1990, 1999) + '&sort_by=popularity.desc', c1: '#880e4f', c2: '#c2185b' },
            { title: 'СССР: 80-е', sub: 'Фильмы', icon: 'hammer', url: 'discover/movie?' + SU + range(1980, 1991) + '&sort_by=vote_count.desc', c1: '#7f1d1d', c2: '#b91c1c' },
            { title: 'СССР: 70-е', sub: 'Фильмы', icon: 'hammer', url: 'discover/movie?' + SU + range(1970, 1979) + '&sort_by=vote_count.desc', c1: '#6b1a1a', c2: '#a31f1f' },
            { title: 'СССР: 60-е', sub: 'Фильмы', icon: 'hammer', url: 'discover/movie?' + SU + range(1960, 1969) + '&sort_by=vote_count.desc', c1: '#5a1616', c2: '#8c1c1c' }
        ];
        section('years', years);

        // Жанры
        var genres = GENRES.map(function (g, i) {
            var hue = Math.round(i * 360 / GENRES.length);
            return {
                title: g[1], sub: 'Фильмы', icon: g[2],
                url: 'discover/movie?' + RU + '&with_genres=' + g[0] + '&sort_by=popularity.desc',
                c1: 'hsl(' + hue + ',60%,28%)', c2: 'hsl(' + hue + ',65%,46%)'
            };
        }).concat([
            { title: 'Реальные события', sub: 'Фильмы', icon: 'news', url: 'discover/movie?' + RU + '&with_keywords=' + trueStoryIds() + '&sort_by=popularity.desc', c1: '#3e4a1a', c2: '#7d8f2e' },
            { title: 'Реальные события', sub: 'Сериалы', icon: 'news', url: 'discover/tv?' + RU + '&with_keywords=' + trueStoryIds() + '&sort_by=popularity.desc', c1: '#2f3d14', c2: '#6a7d25' }
        ]);

        if (opt('rus_menu_adult', true)) {
            // Ключевые слова TMDB: 190370 — erotic movie, 155477 — softcore, 445 — pornography.
            // Фильтр по языку оригинала: английский, русский и европейские языки.
            genres.push(
                { title: 'Эротика', sub: 'Фильмы', icon: 'flame', adult: true, url: 'discover/movie?with_keywords=190370|155477&with_original_language=' + WEST_LANGS + '&sort_by=popularity.desc', c1: '#4a0d1f', c2: '#9b1f42' },
                { title: '18+', sub: 'Фильмы', icon: 'adult', adult: true, url: 'discover/movie?include_adult=true&with_keywords=445&with_original_language=' + WEST_LANGS + '&sort_by=popularity.desc', c1: '#1a0008', c2: '#5c0a1e' }
            );
        }
        section('genres', genres);

        return list;
    }

    // ---------- оформление ----------

    var SIZES = { s: 12, m: 15, l: 18 };

    function addStyle() {
        $('#rus-menu-style').remove();

        var w = SIZES[opt('rus_menu_size', 'm')] || SIZES.m;
        var h = Math.round(w * 0.57 * 10) / 10;

        var css =
            '.rus-menu{padding:1.5em 1.5em 4em}' +
            '.rus-menu__title{font-size:1.6em;font-weight:600;margin:1.4em 0 .5em;opacity:.9}' +
            '.rus-menu__title:first-child{margin-top:.3em}' +
            '.rus-menu__grid{display:flex;flex-wrap:wrap;margin:0 -.6em}' +
            '.rus-tile{position:relative;overflow:hidden;width:' + w + 'em;height:' + h + 'em;margin:.6em;border-radius:1em;' +
            'padding:1em 1.1em;box-sizing:border-box;display:flex;flex-direction:column;justify-content:flex-end;' +
            'color:#fff;border:.22em solid transparent;background-size:cover;background-position:center}' +
            '.rus-tile--light{color:#1b1b1b}' +
            '.rus-tile--poster{color:#fff}' +
            '.rus-tile__bar{position:absolute;left:0;right:0;bottom:0;height:.35em}' +
            '.rus-tile__icon{position:absolute;top:.8em;right:.9em;width:2.6em;height:2.6em;opacity:.9}' +
            '.rus-tile__icon svg{width:100%;height:100%}' +
            '.rus-tile__badge{display:inline-block;font-size:1.2em;font-weight:800;border:.15em solid currentColor;' +
            'border-radius:.4em;padding:.05em .3em}' +
            '.rus-tile__name{position:relative;padding-right:1.6em;font-size:1.75em;font-weight:800;line-height:1.05;letter-spacing:-.01em}' +
            '.rus-tile--poster .rus-tile__name,.rus-tile--poster .rus-tile__sub{text-shadow:0 .08em .25em rgba(0,0,0,.7)}' +
            '.rus-tile__sub{position:relative;font-size:1.05em;font-weight:500;opacity:.9;margin-top:.35em}' +
            '.rus-tile.focus{border-color:#fff}';

        $('<style id="rus-menu-style">' + css + '</style>').appendTo('head');
    }

    // ---------- обложки на плитках ----------
    // Берём фон самого популярного фильма подборки. Грузим по очереди, по 3 запроса,
    // уже после того как страница показана, — чтобы не тормозить открытие.

    function imageUrl(path) {
        try {
            if (Lampa.Api && Lampa.Api.img) return Lampa.Api.img(path, 'w500');
        } catch (e) {}
        return 'https://image.tmdb.org/t/p/w500' + path;
    }

    function PosterLoader() {
        var queue = [];
        var active = 0;
        var stopped = false;

        function next() {
            if (stopped) return;

            while (active < 3 && queue.length) {
                (function (job) {
                    active++;

                    function done() {
                        active--;
                        next();
                    }

                    try {
                        Lampa.Api.sources.tmdb.list({ url: job.url, page: 1 }, function (json) {
                            if (stopped) return;

                            var items = (json && json.results) || [];
                            var pick = null;

                            for (var i = 0; i < items.length && !pick; i++) {
                                if (items[i].backdrop_path) pick = items[i].backdrop_path;
                            }

                            if (pick) job.apply(imageUrl(pick));
                            done();
                        }, done);
                    } catch (e) {
                        done();
                    }
                })(queue.shift());
            }
        }

        this.add = function (url, apply) {
            queue.push({ url: url, apply: apply });
        };

        this.start = next;

        this.stop = function () {
            stopped = true;
            queue = [];
        };
    }

    // ---------- страница с плитками ----------

    function Page(object) {
        var self = this;
        var scroll = new Lampa.Scroll({ mask: true, over: true, step: 300 });
        var html = $('<div></div>');
        var body = $('<div class="rus-menu"></div>');
        var posters = new PosterLoader();
        var last;

        function tileTitle(tile) {
            var sub = tileSub(tile);
            return tile.title + (sub ? ' — ' + sub.toLowerCase() : '');
        }

        function build(list) {
            var withPosters = opt('rus_menu_posters', true);

            list.forEach(function (section) {
                body.append($('<div class="rus-menu__title"></div>').text(section.title));

                var grid = $('<div class="rus-menu__grid"></div>');

                section.tiles.forEach(function (tile) {
                    var el = $('<div class="rus-tile selector">' +
                        '<div class="rus-tile__icon"></div>' +
                        '<div class="rus-tile__name"></div>' +
                        '<div class="rus-tile__sub"></div>' +
                        '<div class="rus-tile__bar"></div></div>');

                    var gradient = 'linear-gradient(135deg,' + tile.c1 + ',' + tile.c2 + ')';

                    if (tile.light) el.addClass('rus-tile--light');

                    el.find('.rus-tile__icon').html(ICONS[tile.icon] || '');
                    el.find('.rus-tile__name').text(tile.title);
                    el.find('.rus-tile__sub').text(tileSub(tile));
                    el.find('.rus-tile__bar').css('background', gradient);
                    el.css('background', gradient);

                    // Обложки не ставим на плитки 18+
                    if (withPosters && tile.url && !tile.adult) {
                        posters.add(tile.url, function (src) {
                            el.removeClass('rus-tile--light').addClass('rus-tile--poster');
                            el.css('background', 'linear-gradient(to top,rgba(0,0,0,.85),rgba(0,0,0,.25)),url("' + src + '") center/cover');
                        });
                    }

                    el.on('hover:focus', function () {
                        last = el[0];
                        // без центрирования: страница сдвигается только когда плитка уходит за край
                        scroll.update(el, false);
                    });

                    el.on('hover:enter', function () {
                        if (tile.service) {
                            Lampa.Activity.push({
                                url: '',
                                title: tile.title,
                                component: COMPONENT,
                                rus_service: tile.service,
                                page: 1
                            });
                            return;
                        }

                        Lampa.Activity.push({
                            url: tile.url,
                            title: tileTitle(tile),
                            component: 'category_full',
                            source: 'tmdb',
                            card_type: true,
                            page: 1
                        });
                    });

                    grid.append(el);
                });

                body.append(grid);
            });
        }

        this.create = function () {
            addStyle();

            var service = object && object.rus_service;
            var cinema = null;

            CINEMAS.forEach(function (c) { if (c.id === service) cinema = c; });

            this.activity.loader(true);

            loadProviders(function () {
                loadTrueStory(function () {
                    build(cinema ? cinemaSections(cinema) : sections());
                    finishCreate();
                });
            });
        };

        function finishCreate() {
            // minus() ограничивает высоту области под шапкой — без этого Lampa не прокручивает страницу.
            if (scroll.minus) scroll.minus();

            scroll.append(body);
            html.append(scroll.render());

            if (Lampa.Layer && Lampa.Layer.update) Lampa.Layer.update(html);

            self.activity.loader(false);
            self.activity.toggle();

            posters.start();
        }

        this.start = function () {
            Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(last || false, scroll.render());
                },
                left: function () {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: function () {
                    Navigator.move('right');
                },
                up: function () {
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: function () {
                    if (Navigator.canmove('down')) Navigator.move('down');
                },
                back: function () {
                    Lampa.Activity.backward();
                }
            });

            Lampa.Controller.toggle('content');
        };

        this.pause = function () {};
        this.stop = function () {};

        this.render = function () {
            return html;
        };

        this.destroy = function () {
            posters.stop();
            scroll.destroy();
            html.remove();
        };
    }

    // ---------- раздел «Русское» в Настройках Lampa ----------

    function addSettings() {
        if (!Lampa.SettingsApi || !Lampa.SettingsApi.addComponent) return;

        try {
            Lampa.SettingsApi.addComponent({
                component: COMPONENT,
                name: 'Русское',
                icon: ICONS.play
            });

            function trigger(name, title, descr) {
                Lampa.SettingsApi.addParam({
                    component: COMPONENT,
                    param: { name: name, type: 'trigger', 'default': true },
                    field: { name: title, description: descr || '' }
                });
            }

            Lampa.SettingsApi.addParam({
                component: COMPONENT,
                param: { name: 'rus_menu_size', type: 'select', values: { s: 'Маленькие', m: 'Обычные', l: 'Крупные' }, 'default': 'm' },
                field: { name: 'Размер плиток' }
            });

            trigger('rus_menu_posters', 'Обложки на плитках', 'Фон из самого популярного фильма подборки');
            trigger('rus_menu_adult', 'Показывать 18+', 'Плитки «Эротика» и «18+» в жанрах');

            SECTIONS.forEach(function (s) {
                trigger('rus_menu_sec_' + s[0], 'Блок «' + s[1] + '»');
            });

            CINEMAS.forEach(function (c) {
                trigger('rus_menu_cin_' + c.id, 'Кинотеатр ' + c.name);
            });
        } catch (e) {
            console.log('[RusMenu] settings:', e);
        }
    }

    // ---------- без окна «Навигация» ----------
    // В полном списке подборки кнопка «Назад» сразу возвращает обратно,
    // без окна выбора страниц.

    function skipNavigation() {
        var original = Lampa.Select.show;

        Lampa.Select.show = function (params) {
            try {
                var active = Lampa.Activity.active();
                var items = params && params.items;

                var isPages = active && active.component === 'category_full' &&
                    items && items.length > 1 &&
                    items.every(function (i) { return /\d+$/.test(String(i.title || '')); });

                if (isPages) {
                    Lampa.Activity.backward();
                    return;
                }
            } catch (e) {}

            return original.apply(this, arguments);
        };
    }

    // ---------- пункт в левом меню ----------

    function openPage() {
        Lampa.Activity.push({
            url: '',
            title: 'Русское',
            component: COMPONENT,
            page: 1
        });
    }

    function start() {
        skipNavigation();
        addSettings();

        var icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">' +
            '<path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4h-4z"/></svg>';

        var item = $('<li class="menu__item selector" data-action="rus_menu">' +
            '<div class="menu__ico">' + icon + '</div>' +
            '<div class="menu__text">Русское</div></li>');

        item.on('hover:enter', openPage);

        var menu = (Lampa.Menu && Lampa.Menu.render) ? Lampa.Menu.render() : $('.menu');
        var after = menu.find('[data-action="tv"]');

        if (after.length) after.eq(0).after(item);
        else menu.find('.menu__list').eq(0).append(item);
    }

    // Компонент регистрируем сразу, чтобы Lampa могла открыть страницу при восстановлении истории.
    Lampa.Component.add(COMPONENT, Page);

    if (window.appready) start();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') start();
        });
    }
})();
