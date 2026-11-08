/*
 * «Русское» — раздел с российскими фильмами и сериалами для Lampa.
 * Только каталог (данные TMDB), видео плагин не содержит.
 * Работает с обычной Lampa, источник данных — TMDB.
 * Версия 4: возврат в меню по кнопке «Назад», раздел «Мультфильмы».
 */
(function () {
    'use strict';

    if (window.rus_menu_plugin) return;
    window.rus_menu_plugin = true;

    var RU = 'with_origin_country=RU';

    // Номера сетей проверены по страницам themoviedb.org/network/<id>
    var CINEMAS = [
        { id: 3827, name: 'Кинопоиск' },
        { id: 3871, name: 'Okko' },
        { id: 3923, name: 'Иви' },
        { id: 5806, name: 'Wink' },
        { id: 2493, name: 'START' },
        { id: 2859, name: 'PREMIER' },
        { id: 4085, name: 'KION' },
        { id: 3882, name: 'more.tv' }
    ];

    var CHANNELS = [
        { id: 558, name: 'Первый канал' },
        { id: 1199, name: 'НТВ' },
        { id: 1191, name: 'ТНТ' },
        { id: 806, name: 'СТС' }
    ];

    var TITLES = {
        main: 'Русское',
        cinemas: 'Онлайн-кинотеатры',
        channels: 'Телеканалы',
        genres: 'Жанры',
        cartoons: 'Мультфильмы'
    };

    // ---------- даты ----------

    function fmt(d) {
        return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    }

    function today() {
        return fmt(new Date());
    }

    function daysAgo(n) {
        var d = new Date();
        d.setDate(d.getDate() - n);
        return fmt(d);
    }

    function ids(list) {
        return list.map(function (n) { return n.id; }).join('|');
    }

    // ---------- пункты меню ----------

    function mainItems() {
        var t = today();
        return [
            { title: 'Сейчас смотрят: фильмы', url: 'discover/movie?' + RU + '&sort_by=popularity.desc&primary_release_date.gte=' + daysAgo(120) + '&primary_release_date.lte=' + t },
            { title: 'Сейчас смотрят: сериалы', url: 'discover/tv?' + RU + '&sort_by=popularity.desc&air_date.gte=' + daysAgo(30) + '&air_date.lte=' + t },
            { title: 'Онлайн-кинотеатры  ›', submenu: 'cinemas' },
            { title: 'Телеканалы  ›', submenu: 'channels' },
            { title: 'Мультфильмы  ›', submenu: 'cartoons' },
            { title: 'Жанры  ›', submenu: 'genres' },
            { title: 'Фильмы: популярные', url: 'discover/movie?' + RU + '&sort_by=popularity.desc' },
            { title: 'Фильмы: новинки', url: 'discover/movie?' + RU + '&sort_by=primary_release_date.desc&primary_release_date.lte=' + t + '&vote_count.gte=5' },
            { title: 'Фильмы: лучшие', url: 'discover/movie?' + RU + '&sort_by=vote_average.desc&vote_count.gte=200' },
            { title: 'Сериалы: популярные', url: 'discover/tv?' + RU + '&sort_by=popularity.desc' },
            { title: 'Сериалы: новинки', url: 'discover/tv?' + RU + '&sort_by=first_air_date.desc&first_air_date.lte=' + t + '&vote_count.gte=3' },
            { title: 'Сериалы: лучшие', url: 'discover/tv?' + RU + '&sort_by=vote_average.desc&vote_count.gte=100' },
            { title: 'Советское кино', url: 'discover/movie?with_origin_country=SU&sort_by=vote_count.desc' }
        ];
    }

    function networkItems(list, allTitle) {
        var t = today();
        var items = [
            { title: allTitle + ': новинки', url: 'discover/tv?with_networks=' + ids(list) + '&sort_by=first_air_date.desc&first_air_date.lte=' + t },
            { title: allTitle + ': сейчас смотрят', url: 'discover/tv?with_networks=' + ids(list) + '&sort_by=popularity.desc&air_date.gte=' + daysAgo(30) + '&air_date.lte=' + t }
        ];
        list.forEach(function (n) {
            items.push({ title: n.name, url: 'discover/tv?with_networks=' + n.id + '&sort_by=popularity.desc' });
        });
        return items;
    }

    function cartoonItems() {
        var t = today();
        var A = '&with_genres=16';
        return [
            { title: 'Мультфильмы: популярные', url: 'discover/movie?' + RU + A + '&sort_by=popularity.desc' },
            { title: 'Мультфильмы: новинки', url: 'discover/movie?' + RU + A + '&sort_by=primary_release_date.desc&primary_release_date.lte=' + t + '&vote_count.gte=3' },
            { title: 'Мультфильмы: лучшие', url: 'discover/movie?' + RU + A + '&sort_by=vote_average.desc&vote_count.gte=50' },
            { title: 'Мультсериалы: популярные', url: 'discover/tv?' + RU + A + '&sort_by=popularity.desc' },
            { title: 'Мультсериалы: новинки', url: 'discover/tv?' + RU + A + '&sort_by=first_air_date.desc&first_air_date.lte=' + t },
            { title: 'Мультсериалы: лучшие', url: 'discover/tv?' + RU + A + '&sort_by=vote_average.desc&vote_count.gte=20' },
            { title: 'Советские мультфильмы', url: 'discover/movie?with_origin_country=SU' + A + '&sort_by=vote_count.desc' },
            { title: 'Советские мультсериалы', url: 'discover/tv?with_origin_country=SU' + A + '&sort_by=vote_count.desc' }
        ];
    }

    function genreItems() {
        var g = [
            ['Комедии', 35],
            ['Драмы', 18],
            ['Боевики', 28],
            ['Военные', 10752],
            ['Криминал', 80],
            ['Детективы', 9648],
            ['Триллеры', 53],
            ['Фантастика', 878],
            ['Исторические', 36],
            ['Семейные', 10751],
            ['Мелодрамы', 10749]
        ];
        return g.map(function (x) {
            return { title: x[0], url: 'discover/movie?' + RU + '&with_genres=' + x[1] + '&sort_by=popularity.desc' };
        });
    }

    function itemsFor(kind) {
        if (kind === 'cinemas') return networkItems(CINEMAS, 'Все кинотеатры');
        if (kind === 'channels') return networkItems(CHANNELS, 'Все каналы');
        if (kind === 'cartoons') return cartoonItems();
        if (kind === 'genres') return genreItems();
        return mainItems();
    }

    // ---------- открытие подборки и возврат в меню ----------

    var counter = 0;
    var opened = {}; // id -> активность, из которой открыли подборку

    function open(item, kind) {
        counter++;
        opened[counter] = Lampa.Activity.active ? Lampa.Activity.active() : null;

        Lampa.Activity.push({
            url: item.url,
            title: item.title,
            component: 'category_full',
            source: 'tmdb',
            card_type: true,
            page: 1,
            rus_menu_back: kind,
            rus_menu_id: counter
        });
    }

    // Когда подборку закрывают кнопкой «Назад», снова показываем меню,
    // из которого её открыли.
    function watchBack() {
        Lampa.Listener.follow('activity', function (e) {
            if (!e || e.type !== 'destroy' || !e.object || !e.object.rus_menu_back) return;

            var id = e.object.rus_menu_id;
            var from = opened[id];
            delete opened[id];

            var active = Lampa.Activity.active ? Lampa.Activity.active() : null;

            // Закрыли не кнопкой «Назад» (например, Lampa чистит старую историю) — ничего не делаем.
            if (!from || active !== from) return;

            show(e.object.rus_menu_back, 'content');
        });
    }

    // ---------- окно выбора ----------

    // exitTo: куда вернуть фокус при выходе из главного окна — 'menu' или 'content'
    function show(kind, exitTo) {
        kind = kind || 'main';
        exitTo = exitTo || 'menu';

        Lampa.Select.show({
            title: TITLES[kind] || TITLES.main,
            items: itemsFor(kind),
            onSelect: function (item) {
                if (item.submenu) show(item.submenu, exitTo);
                else open(item, kind);
            },
            onBack: function () {
                if (kind !== 'main') show('main', exitTo);
                else Lampa.Controller.toggle(exitTo);
            }
        });
    }

    // ---------- пункт в левом меню ----------

    function start() {
        var icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">' +
            '<path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4h-4z"/></svg>';

        var item = $('<li class="menu__item selector" data-action="rus_menu">' +
            '<div class="menu__ico">' + icon + '</div>' +
            '<div class="menu__text">Русское</div></li>');

        item.on('hover:enter', function () {
            show('main', 'menu');
        });

        var menu = (Lampa.Menu && Lampa.Menu.render) ? Lampa.Menu.render() : $('.menu');
        var after = menu.find('[data-action="tv"]');

        if (after.length) after.eq(0).after(item);
        else menu.find('.menu__list').eq(0).append(item);

        watchBack();
    }

    if (window.appready) start();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') start();
        });
    }
})();
