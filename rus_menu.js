/*
 * «Русское» — раздел с российскими фильмами и сериалами для Lampa.
 * Только каталог (данные TMDB), видео плагин не содержит.
 * Работает с обычной Lampa, источник данных — TMDB.
 * Версия 6: страница с плитками-подборками.
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

    // ---------- подборки ----------
    // Номера сетей проверены по страницам themoviedb.org/network/<id>

    var CINEMAS = [
        [3827, 'Кинопоиск', '#ff6a00', '#ffa000'],
        [3871, 'Okko', '#5b2ee0', '#9b5cff'],
        [3923, 'Иви', '#d0104c', '#ff4f7a'],
        [5806, 'Wink', '#ff4b2b', '#ff9a3c'],
        [2493, 'START', '#1d1d1f', '#4a4a52'],
        [2859, 'PREMIER', '#c9a300', '#f2d34f'],
        [4085, 'KION', '#7a2bd9', '#e0459b'],
        [3882, 'more.tv', '#0b5cff', '#3fa0ff']
    ];

    var CHANNELS = [
        [558, 'Первый канал', '#0d47a1', '#1e88e5'],
        [1199, 'НТВ', '#1b5e20', '#43a047'],
        [1191, 'ТНТ', '#4a148c', '#8e24aa'],
        [806, 'СТС', '#e65100', '#ffb300']
    ];

    var GENRES = [
        [35, 'Комедии'], [18, 'Драмы'], [28, 'Боевики'], [10752, 'Военные'],
        [80, 'Криминал'], [9648, 'Детективы'], [53, 'Триллеры'], [878, 'Фантастика'],
        [36, 'Исторические'], [10751, 'Семейные'], [10749, 'Мелодрамы']
    ];

    function sections() {
        var t = fmt(new Date());
        var allCinemas = CINEMAS.map(function (n) { return n[0]; }).join('|');

        function net(n, kind) {
            return { title: n[1], sub: kind, url: 'discover/tv?with_networks=' + n[0] + '&sort_by=popularity.desc', c1: n[2], c2: n[3] };
        }

        return [
            {
                title: 'Сейчас смотрят',
                tiles: [
                    { title: 'Фильмы', sub: 'Популярно сейчас', url: 'discover/movie?' + RU + '&sort_by=popularity.desc&primary_release_date.gte=' + daysAgo(120) + '&primary_release_date.lte=' + t, c1: '#b71c1c', c2: '#ef5350' },
                    { title: 'Сериалы', sub: 'Популярно сейчас', url: 'discover/tv?' + RU + '&sort_by=popularity.desc&air_date.gte=' + daysAgo(30) + '&air_date.lte=' + t, c1: '#880e4f', c2: '#ec407a' },
                    { title: 'Новинки кинотеатров', sub: 'Сериалы', url: 'discover/tv?with_networks=' + allCinemas + '&sort_by=first_air_date.desc&first_air_date.lte=' + t, c1: '#263238', c2: '#607d8b' }
                ]
            },
            {
                title: 'Онлайн-кинотеатры',
                tiles: CINEMAS.map(function (n) { return net(n, 'Сериалы'); })
            },
            {
                title: 'Телеканалы',
                tiles: CHANNELS.map(function (n) { return net(n, 'Сериалы и шоу'); })
            },
            {
                title: 'Мультфильмы',
                tiles: [
                    { title: 'Мультфильмы', sub: 'Популярные', url: 'discover/movie?' + RU + '&with_genres=16&sort_by=popularity.desc', c1: '#00897b', c2: '#4db6ac' },
                    { title: 'Мультсериалы', sub: 'Популярные', url: 'discover/tv?' + RU + '&with_genres=16&sort_by=popularity.desc', c1: '#00838f', c2: '#4dd0e1' },
                    { title: 'Советские', sub: 'Мультфильмы', url: 'discover/movie?' + SU + '&with_genres=16&sort_by=vote_count.desc', c1: '#bf360c', c2: '#ff7043' }
                ]
            },
            {
                title: 'Фильмы и сериалы',
                tiles: [
                    { title: 'Фильмы', sub: 'Популярные', url: 'discover/movie?' + RU + '&sort_by=popularity.desc', c1: '#283593', c2: '#5c6bc0' },
                    { title: 'Фильмы', sub: 'Новинки', url: 'discover/movie?' + RU + '&sort_by=primary_release_date.desc&primary_release_date.lte=' + t + '&vote_count.gte=5', c1: '#1565c0', c2: '#42a5f5' },
                    { title: 'Фильмы', sub: 'Лучшие', url: 'discover/movie?' + RU + '&sort_by=vote_average.desc&vote_count.gte=200', c1: '#f9a825', c2: '#ffd54f' },
                    { title: 'Сериалы', sub: 'Популярные', url: 'discover/tv?' + RU + '&sort_by=popularity.desc', c1: '#4527a0', c2: '#7e57c2' },
                    { title: 'Сериалы', sub: 'Новинки', url: 'discover/tv?' + RU + '&sort_by=first_air_date.desc&first_air_date.lte=' + t + '&vote_count.gte=3', c1: '#6a1b9a', c2: '#ab47bc' },
                    { title: 'Сериалы', sub: 'Лучшие', url: 'discover/tv?' + RU + '&sort_by=vote_average.desc&vote_count.gte=100', c1: '#ef6c00', c2: '#ffa726' },
                    { title: 'Советское кино', sub: 'Фильмы', url: 'discover/movie?' + SU + '&sort_by=vote_count.desc', c1: '#8d1c1c', c2: '#c62828' }
                ]
            },
            {
                title: 'Жанры',
                tiles: GENRES.map(function (g, i) {
                    var hue = Math.round(i * 360 / GENRES.length);
                    return {
                        title: g[1], sub: 'Фильмы',
                        url: 'discover/movie?' + RU + '&with_genres=' + g[0] + '&sort_by=popularity.desc',
                        c1: 'hsl(' + hue + ',55%,30%)', c2: 'hsl(' + hue + ',60%,48%)'
                    };
                }).concat([
                    // Ключевые слова TMDB: 190370 — erotic movie, 155477 — softcore, 445 — pornography.
                    // Российских фильмов с ними почти нет, поэтому подборки без фильтра по стране.
                    { title: 'Эротика', sub: 'Фильмы', url: 'discover/movie?with_keywords=190370|155477&sort_by=popularity.desc', c1: '#4a0d1f', c2: '#8e1b3a' },
                    { title: '18+', sub: 'Фильмы', url: 'discover/movie?include_adult=true&with_keywords=445&sort_by=popularity.desc', c1: '#1a0008', c2: '#5c0a1e' }
                ])
            }
        ];
    }

    // ---------- оформление ----------

    function addStyle() {
        if ($('#rus-menu-style').length) return;

        var css =
            '.rus-menu{padding:1.5em 1.5em 3em}' +
            '.rus-menu__title{font-size:1.6em;font-weight:600;margin:1.2em 0 .6em;opacity:.9}' +
            '.rus-menu__title:first-child{margin-top:0}' +
            '.rus-menu__grid{display:flex;flex-wrap:wrap;margin:0 -.5em}' +
            '.rus-tile{width:14em;height:8em;margin:.5em;border-radius:1em;padding:1em;box-sizing:border-box;' +
            'display:flex;flex-direction:column;justify-content:flex-end;color:#fff;' +
            'box-shadow:0 .3em 1em rgba(0,0,0,.35);transition:transform .15s}' +
            '.rus-tile__name{font-size:1.5em;font-weight:700;line-height:1.1;text-shadow:0 .1em .3em rgba(0,0,0,.4)}' +
            '.rus-tile__sub{font-size:1em;opacity:.85;margin-top:.3em}' +
            '.rus-tile.focus{transform:scale(1.07);outline:.25em solid #fff;outline-offset:.15em}';

        $('<style id="rus-menu-style">' + css + '</style>').appendTo('head');
    }

    // ---------- страница с плитками ----------

    function Page(object) {
        var scroll = new Lampa.Scroll({ mask: true, over: true });
        var html = $('<div></div>');
        var body = $('<div class="rus-menu"></div>');
        var last;

        this.create = function () {
            addStyle();

            sections().forEach(function (section) {
                body.append($('<div class="rus-menu__title"></div>').text(section.title));

                var grid = $('<div class="rus-menu__grid"></div>');

                section.tiles.forEach(function (tile) {
                    var el = $('<div class="rus-tile selector">' +
                        '<div class="rus-tile__name"></div>' +
                        '<div class="rus-tile__sub"></div></div>');

                    el.find('.rus-tile__name').text(tile.title);
                    el.find('.rus-tile__sub').text(tile.sub || '');
                    el.css('background', 'linear-gradient(135deg,' + tile.c1 + ',' + tile.c2 + ')');

                    el.on('hover:focus', function () {
                        last = el[0];
                        scroll.update(el, true);
                    });

                    el.on('hover:enter', function () {
                        Lampa.Activity.push({
                            url: tile.url,
                            title: tile.title + (tile.sub ? ': ' + tile.sub.toLowerCase() : ''),
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

            scroll.append(body);
            html.append(scroll.render());

            this.activity.loader(false);
            this.activity.toggle();
        };

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
