var menu = function (menus = 3) {
    this.load = async function () {
        let data = await promise('index.php', 'POST', { 'find': 'page', 'order': 'id desc' })
        var type = 'all'
        if (data == null && (type == 'page' || type == 'article')) {
            data = await promise('index.php', 'POST', {
                'find': 'page',
                'where': {
                    'type': type
                }
            })
        }

        if (data !== undefined && data !== false) {
            var articles_data = []
            var pages_data = []
            for (var key in data.list) {
                let article = data.list[key]

                if (menus == 1 || menus == 3) {
                    if (article.type == 'article') {
                        articles_data.push({
                            'selector': '#articles', 'element': 'li', 'attributs': {}, 'sub':
                            [
                                {
                                    'element': 'a', 'attributs': { 'href': 'index.html?article=' + article.slug, 'innerHTML': article.title },
                                    'callback': {
                                        'event': 'click',
                                        'function': function (e) {
                                            e.preventDefault()
                                            load('article', [], 'page', 'index.html?article=' + article.slug)
                                        }
                                    }
                                }
                            ]
                        })
                    }
                }

                if (menus == 2 || menus == 3) {
                    if (article.type == 'page') {
                        pages_data.push({
                            'selector': '#pages', 'element': 'li', 'attributs': {}, 'sub':
                            {
                                'element': 'a', 'attributs': { 'href': 'index.html?article=' + article.slug, 'innerHTML': article.title, 'class': 'link page item' },
                                'callback': {
                                    'event': 'click',
                                    'function': function (e) {
                                        e.preventDefault()
                                        load('article', [], 'page', 'index.html?article=' + article.slug)
                                    }
                                }
                            }
                        })
                    }
                }
            }
            
            if (menus == 1 || menus == 3) {
                let DOM_menu_vertical = document.createElement('ul')
                DOM_menu_vertical.id = 'articles'
                let articles = setDOMElement(DOM_menu_vertical, articles_data)
                document.querySelector('#menu').innerHTML = ''
                document.querySelector('#menu').appendChild(articles)
            }
            if (menus == 2 || menus == 3) {
                let DOM_menu_horizontal = document.createElement('ul')
                DOM_menu_horizontal.id = 'pages'
                let pages = setDOMElement(DOM_menu_horizontal, pages_data)
                document.querySelector('#pages').appendChild(pages.firstChild) // TODO : ça passe car en dev j'en ai qu'un mais faudra le faire foncitonner avec plusieurs
            }

            this.setStyleMenu()
        }
    }

    this.setStyleMenu = function () {
        document.querySelectorAll('#articles li a').forEach(link => {
            link.style.background = 'initial'
            link.style.boxShadow = 'none'
        })
        document.querySelectorAll('.page').forEach(link => {
            link.style.color = '#ccc'
        })
        let url = new URL(document.location.href)
        let menu = getMenu(url)
        let slug = url.search.substring(menu.length + 2)
        if (menu == 'article' || menu == 'edit') {
            let query = document.querySelector("[href='index.html?article=" + slug + "']")
            if (query !== null) {
                if (query.className.indexOf("page") !== -1) {
                    document.querySelector("[href='index.html?article=" + slug + "']").style.color = '#fff'
                } else {
                    document.querySelector("[href='index.html?article=" + slug + "']").style.background = '#fff'
                    document.querySelector("[href='index.html?article=" + slug + "']").style.boxShadow = '0px 0px 5px #888, 0px 0px 5px #aaa'
                }
            }
        }
    }
}

const clearMenuCSS = function () {
    document.querySelectorAll('.article').forEach(link => {
        link.style.background = 'initial'
        link.style.boxShadow = 'none'
    })
}