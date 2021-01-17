var accueil = function () {
    this.load = async function () {
        data = await promise('api.php', 'POST', {
            'find': 'page',
            'order': 'id desc',
            'where': {
                'type': 'article'
            }
        })

        if (data !== undefined && data !== false) {
            var articles = []
            for (var key in data.list) {
                let article = data.list[key]

                if (article.type == 'article') {
                    var updateDate = ''
                    if (article.created != article.updated) {
                        updateDate = ' modifié le ' + article.updated
                    }
                    articles.push({
                        'element': 'div', 'attributs': {'class': 'article'}, 'sub':
                        [
                            {
                                'element': 'div', 'attributs': { 'class': 'title' }, 'sub':
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
                            { 'element': 'div', 'attributs': { 'class': 'info', 'innerHTML': 'Par ' + article.user + ' dans ' + article.type + ' le ' + article.created + updateDate } },
                            { 'element': 'div', 'attributs': { 'innerHTML': article.content } }
                        ]
                    })
                }
            }
            var articles_data = [{'element': 'div', 'attributs': {'id': 'bloc'}, 'sub': articles}]
            let DOM = setDOMElement(articles_data)
            DOM.querySelectorAll('.link').forEach(function (a) {
                a.addEventListener("click", function (e) {
                    e.preventDefault()
                    load(a.getAttribute('b-entity'), [], 'page', a.getAttribute('href'))
                })
            });
            document.querySelector('#content').innerHTML = ''
            document.querySelector('#content').appendChild(DOM)
        }
    }
}