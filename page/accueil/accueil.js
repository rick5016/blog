var accueil = function () {
    this.load = async function () {
        data = await promise('index.php', 'POST', {
            'find': 'page',
            'where': {
                'type': 'article'
            }
        })

        if (data !== undefined && data !== false) {
            var articles_data = []
            for (var key in data.list) {
                let article = data.list[key]

                if (article.type == 'article') {
                    var updateDate = ''
                    if (article.created != article.updated) {
                        updateDate = ' modifié le ' + article.updated
                    }
                    articles_data.push(
                        {
                            'selector': '#articles', 'element': 'li', 'attributs': {}, 'sub':
                            [
                                {
                                    'element': 'div', 'attributs': {'class': 'title'}, 'sub':
                                    [
                                        {
                                            'element': 'a', 'attributs': { 'href': 'index.html?article=' + article.slug, 'innerHTML': article.title }, 'callback': {
                                                'event': 'click',
                                                'function': function (e) {
                                                    e.preventDefault()
                                                    load('article', [], 'page', 'index.html?article=' + article.slug)
                                                }
                                            }
                                        }
                                    ]
                                },
                                {'element': 'div', 'attributs': {'class': 'info', 'innerHTML': 'Par ' + article.user + ' dans ' + article.type + ' le ' + article.created + updateDate}},
                                {'element': 'div',  'attributs': { 'innerHTML': article.content }}
                            ]
                        }
                    )
                }
            }
            document.querySelector('#content').innerHTML = ''
            let DOM_menu_vertical = document.createElement('ul')
            DOM_menu_vertical.id = 'articles'
            document.querySelector('#content').appendChild(setDOMElement(DOM_menu_vertical, articles_data))
        }
    }
}