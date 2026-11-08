/*
 * «Русское» — раздел с российскими фильмами и сериалами для Lampa.
 * Только каталог (данные TMDB), видео плагин не содержит.
 * Работает с обычной Lampa, источник данных — TMDB.
 * Версия 10: жанр «Реальные события», на каждой плитке видно, как отсортированы фильмы.
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

    // ---------- подборки ----------
    // Номера сетей проверены по страницам themoviedb.org/network/<id>.
    // Цвета подобраны близкими к фирменным, логотипы не используются.

    var CINEMAS = [
        [3827, 'Кинопоиск', '#ff5c00', '#ffa31a'],
        [3871, 'Okko', '#4b1ad6', '#8c5cff'],
        [3923, 'Иви', '#e3003b', '#ff4a76'],
        [5806, 'Wink', '#ff4a1c', '#ff8a3d'],
        [2493, 'START', '#121214', '#3a3a42'],
        [2859, 'PREMIER', '#f5c400', '#ffe066', true],
        [4085, 'KION', '#6b1fd1', '#d83aa0'],
        [3882, 'more.tv', '#0a4dff', '#3f9bff']
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

    // ---------- фильмы онлайн-кинотеатров ----------
    // У фильмов в TMDB нет «телесети», поэтому берём данные «где посмотреть» (регион RU).
    // Номера провайдеров ищем по названию прямо в TMDB при первом открытии.

    var PROVIDER_MATCH = {
        3827: /кинопоиск|kinopoisk/i,
        3871: /^okko/i,
        3923: /^ivi|^иви/i,
        5806: /^wink/i,
        2493: /^start(\.ru)?$/i,
        2859: /^premier/i,
        4085: /^kion|^кион/i,
        3882: /^more\.?\s?tv/i
    };

    var providers = null;      // id сети -> id провайдера
    var providersFallback = {};
    var providersWait = [];

    function prov(id) {
        return (providers || providersFallback)[id];
    }

    function provAll() {
        var map = providers || providersFallback;
        var list = [];
        for (var id in map) list.push(map[id]);
        return list.join('|');
    }

    function loadProviders(done) {
        if (providers) return done();

        providersWait.push(done);
        if (providersWait.length > 1) return;

        function finish(found) {
            // при ошибке не запоминаем пустой результат — в следующий раз попробуем снова
            providers = found || null;
            providersFallback = found || {};
            var list = providersWait;
            providersWait = [];
            list.forEach(function (fn) { fn(); });
        }

        try {
            var net = new Lampa.Reguest();
            var url = Lampa.TMDB.api('watch/providers/movie?watch_region=RU&language=ru&api_key=' + Lampa.TMDB.key());

            net.timeout(8000);
            net.silent(url, function (json) {
                var found = {};

                ((json && json.results) || []).forEach(function (p) {
                    for (var id in PROVIDER_MATCH) {
                        if (!found[id] && PROVIDER_MATCH[id].test(String(p.provider_name || ''))) found[id] = p.provider_id;
                    }
                });

                finish(found);
            }, function () {
                finish(null);
            });
        } catch (e) {
            finish(null);
        }
    }

    // ---------- «Основано на реальных событиях» ----------
    // Номер ключевого слова ищем в TMDB по названию; 9672 — запасной вариант.

    var TRUE_STORY_FALLBACK = '9672';
    var trueStory = null;

    function loadTrueStory(done) {
        if (trueStory) return done();

        try {
            var net = new Lampa.Reguest();
            var url = Lampa.TMDB.api('search/keyword?query=' + encodeURIComponent('based on true story') + '&api_key=' + Lampa.TMDB.key());

            net.timeout(8000);
            net.silent(url, function (json) {
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
        } catch (e) {
            done();
        }
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

        if (!label || /популяр|новинк|лучш|известн/i.test(sub + ' ' + tile.title)) return sub;
        return sub ? sub + ' · ' + label : label.charAt(0).toUpperCase() + label.slice(1);
    }

    function cinemaSections(n) {
        var t = fmt(new Date());
        var tiles = [
            { title: 'Сериалы', sub: 'Популярные', icon: 'series', url: 'discover/tv?with_networks=' + n[0] + '&sort_by=popularity.desc', c1: n[2], c2: n[3], light: !!n[4] },
            { title: 'Сериалы', sub: 'Новинки', icon: 'clock', url: 'discover/tv?with_networks=' + n[0] + '&sort_by=first_air_date.desc&first_air_date.lte=' + t, c1: n[2], c2: n[3], light: !!n[4] }
        ];

        var pid = prov(n[0]);

        if (pid) {
            var base = 'discover/movie?with_watch_providers=' + pid + '&watch_region=RU';
            tiles.push(
                { title: 'Фильмы', sub: 'Популярные', icon: 'film', url: base + '&sort_by=popularity.desc', c1: n[2], c2: n[3], light: !!n[4] },
                { title: 'Фильмы', sub: 'Новинки', icon: 'clock', url: base + '&sort_by=primary_release_date.desc&primary_release_date.lte=' + t, c1: n[2], c2: n[3], light: !!n[4] },
                { title: 'Русские фильмы', sub: 'Популярные', icon: 'star', url: base + '&' + RU + '&sort_by=popularity.desc', c1: n[2], c2: n[3], light: !!n[4] }
            );
        }

        return [{ title: n[1], tiles: tiles }];
    }

    function sections() {
        var t = fmt(new Date());
        var allCinemas = CINEMAS.map(function (n) { return n[0]; }).join('|');

        function net(n, kind, icon) {
            return {
                title: n[1], sub: kind, icon: icon, light: !!n[4],
                url: 'discover/tv?with_networks=' + n[0] + '&sort_by=popularity.desc',
                c1: n[2], c2: n[3]
            };
        }

        return [
            {
                title: 'Сейчас смотрят',
                tiles: [
                    { title: 'Фильмы', sub: 'Популярно сейчас', icon: 'fire', url: 'discover/movie?' + RU + '&sort_by=popularity.desc&primary_release_date.gte=' + daysAgo(120) + '&primary_release_date.lte=' + t, c1: '#b3122a', c2: '#ff4d4d' },
                    { title: 'Сериалы', sub: 'Популярно сейчас', icon: 'fire', url: 'discover/tv?' + RU + '&sort_by=popularity.desc&air_date.gte=' + daysAgo(30) + '&air_date.lte=' + t, c1: '#8a0f5c', c2: '#e83e8c' },
                    { title: 'Новинки кинотеатров', sub: 'Сериалы', icon: 'news', url: 'discover/tv?with_networks=' + allCinemas + '&sort_by=first_air_date.desc&first_air_date.lte=' + t, c1: '#1f2a44', c2: '#4b6cb7' }
                ].concat(provAll() ? [
                    { title: 'Новинки кинотеатров', sub: 'Фильмы', icon: 'news', url: 'discover/movie?with_watch_providers=' + provAll() + '&watch_region=RU&sort_by=primary_release_date.desc&primary_release_date.lte=' + t + '&vote_count.gte=1', c1: '#14365c', c2: '#2f80c9' }
                ] : [])
            },
            {
                title: 'Онлайн-кинотеатры',
                tiles: CINEMAS.map(function (n) {
                    var tile = net(n, prov(n[0]) ? 'Фильмы и сериалы' : 'Сериалы', 'play');
                    tile.service = n[0];
                    return tile;
                })
            },
            {
                title: 'Телеканалы',
                tiles: CHANNELS.map(function (n) { return net(n, 'Сериалы', 'tv'); })
            },
            {
                title: 'Мультфильмы',
                tiles: [
                    { title: 'Мультфильмы', sub: 'Популярные', icon: 'smile', url: 'discover/movie?' + RU + '&with_genres=16&sort_by=popularity.desc', c1: '#00897b', c2: '#3dd6b5' },
                    { title: 'Мультсериалы', sub: 'Популярные', icon: 'smile', url: 'discover/tv?' + RU + '&with_genres=16&sort_by=popularity.desc', c1: '#0077a8', c2: '#35c3e8' },
                    { title: 'Советские', sub: 'Мультфильмы', icon: 'star', url: 'discover/movie?' + SU + '&with_genres=16&sort_by=vote_count.desc', c1: '#b23a00', c2: '#ff7a3d' }
                ]
            },
            {
                title: 'Фильмы и сериалы',
                tiles: [
                    { title: 'Фильмы', sub: 'Популярные', icon: 'film', url: 'discover/movie?' + RU + '&sort_by=popularity.desc', c1: '#23308f', c2: '#5868d6' },
                    { title: 'Фильмы', sub: 'Новинки', icon: 'clock', url: 'discover/movie?' + RU + '&sort_by=primary_release_date.desc&primary_release_date.lte=' + t + '&vote_count.gte=5', c1: '#0f5fb8', c2: '#3fa7f5' },
                    { title: 'Фильмы', sub: 'Лучшие', icon: 'star', light: true, url: 'discover/movie?' + RU + '&sort_by=vote_average.desc&vote_count.gte=200', c1: '#f2b705', c2: '#ffd95a' },
                    { title: 'Сериалы', sub: 'Популярные', icon: 'series', url: 'discover/tv?' + RU + '&sort_by=popularity.desc', c1: '#3e2196', c2: '#7b55d6' },
                    { title: 'Сериалы', sub: 'Новинки', icon: 'clock', url: 'discover/tv?' + RU + '&sort_by=first_air_date.desc&first_air_date.lte=' + t + '&vote_count.gte=3', c1: '#651a95', c2: '#b24ad1' },
                    { title: 'Сериалы', sub: 'Лучшие', icon: 'star', url: 'discover/tv?' + RU + '&sort_by=vote_average.desc&vote_count.gte=100', c1: '#d65a00', c2: '#ffa13d' },
                    { title: 'Советское кино', sub: 'Фильмы', icon: 'hammer', url: 'discover/movie?' + SU + '&sort_by=vote_count.desc', c1: '#7a1010', c2: '#c62828' }
                ]
            },
            {
                title: 'Жанры',
                tiles: GENRES.map(function (g, i) {
                    var hue = Math.round(i * 360 / GENRES.length);
                    return {
                        title: g[1], sub: 'Фильмы', icon: g[2],
                        url: 'discover/movie?' + RU + '&with_genres=' + g[0] + '&sort_by=popularity.desc',
                        c1: 'hsl(' + hue + ',60%,28%)', c2: 'hsl(' + hue + ',65%,46%)'
                    };
                }).concat([
                    { title: 'Реальные события', sub: 'Фильмы', icon: 'news', url: 'discover/movie?' + RU + '&with_keywords=' + trueStoryIds() + '&sort_by=popularity.desc', c1: '#3e4a1a', c2: '#7d8f2e' },
                    { title: 'Реальные события', sub: 'Сериалы', icon: 'news', url: 'discover/tv?' + RU + '&with_keywords=' + trueStoryIds() + '&sort_by=popularity.desc', c1: '#2f3d14', c2: '#6a7d25' },
                    // Ключевые слова TMDB: 190370 — erotic movie, 155477 — softcore, 445 — pornography.
                    // Российских фильмов с ними почти нет, поэтому подборки без фильтра по стране.
                    { title: 'Эротика', sub: 'Новинки', icon: 'flame', url: 'discover/movie?with_keywords=190370|155477&sort_by=primary_release_date.desc&primary_release_date.lte=' + t, c1: '#4a0d1f', c2: '#9b1f42' },
                    { title: '18+', sub: 'Новинки', icon: 'adult', url: 'discover/movie?include_adult=true&with_keywords=445&sort_by=primary_release_date.desc&primary_release_date.lte=' + t, c1: '#1a0008', c2: '#5c0a1e' }
                ])
            }
        ];
    }

    // ---------- оформление ----------

    function addStyle() {
        if ($('#rus-menu-style').length) return;

        var css =
            '.rus-menu{padding:1.5em 1.5em 4em}' +
            '.rus-menu__title{font-size:1.6em;font-weight:600;margin:1.4em 0 .5em;opacity:.9}' +
            '.rus-menu__title:first-child{margin-top:.3em}' +
            '.rus-menu__grid{display:flex;flex-wrap:wrap;margin:0 -.6em}' +
            '.rus-tile{position:relative;overflow:hidden;width:15em;height:8.5em;margin:.6em;border-radius:1em;' +
            'padding:1em 1.1em;box-sizing:border-box;display:flex;flex-direction:column;justify-content:flex-end;' +
            'color:#fff;border:.22em solid transparent}' +
            '.rus-tile--light{color:#1b1b1b}' +
            '.rus-tile__icon{position:absolute;top:.8em;right:.9em;width:2.6em;height:2.6em;opacity:.9}' +
            '.rus-tile__icon svg{width:100%;height:100%}' +
            '.rus-tile__badge{display:inline-block;font-size:1.2em;font-weight:800;border:.15em solid currentColor;' +
            'border-radius:.4em;padding:.05em .3em}' +
            '.rus-tile__name{position:relative;padding-right:1.6em;font-size:1.75em;font-weight:800;line-height:1.05;letter-spacing:-.01em}' +
            '.rus-tile__sub{position:relative;font-size:1.05em;font-weight:500;opacity:.9;margin-top:.35em}' +
            '.rus-tile.focus{border-color:#fff}';

        $('<style id="rus-menu-style">' + css + '</style>').appendTo('head');
    }

    // ---------- страница с плитками ----------

    function Page(object) {
        var self = this;
        var scroll = new Lampa.Scroll({ mask: true, over: true, step: 300 });
        var html = $('<div></div>');
        var body = $('<div class="rus-menu"></div>');
        var last;

        function tileTitle(tile) {
            var sub = tileSub(tile);
            return tile.title + (sub ? ' — ' + sub.toLowerCase() : '');
        }

        function build(list) {
            list.forEach(function (section) {
                body.append($('<div class="rus-menu__title"></div>').text(section.title));

                var grid = $('<div class="rus-menu__grid"></div>');

                section.tiles.forEach(function (tile) {
                    var el = $('<div class="rus-tile selector">' +
                        '<div class="rus-tile__icon"></div>' +
                        '<div class="rus-tile__name"></div>' +
                        '<div class="rus-tile__sub"></div></div>');

                    if (tile.light) el.addClass('rus-tile--light');

                    el.find('.rus-tile__icon').html(ICONS[tile.icon] || '');
                    el.find('.rus-tile__name').text(tile.title);
                    el.find('.rus-tile__sub').text(tile.service ? (tile.sub || '') : tileSub(tile));
                    el.css('background', 'linear-gradient(135deg,' + tile.c1 + ',' + tile.c2 + ')');

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
            var n = null;

            CINEMAS.forEach(function (c) { if (c[0] === service) n = c; });

            this.activity.loader(true);

            loadProviders(function () {
                loadTrueStory(function () {
                    build(n ? cinemaSections(n) : sections());
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
            scroll.destroy();
            html.remove();
        };
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
