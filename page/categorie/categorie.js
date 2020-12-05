var categorie = function () {
    this.load = async function () {
        var categorie = new URL(document.location.href).searchParams.get('categorie')
        var tag = new URL(document.location.href).searchParams.get('tag')
        data = await promise('index.php', 'POST', {
            'findAllByCategorie': 'page',
            'order': 'id desc',
            'where': {
                'type': 'article',
                'categories': '{"categorie":"' + categorie + '","tag":"' + tag + '"}'
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
                    
                    articles.push( {
                        'element': 'li', 'attributs': {}, 'sub':
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
                            { 'element': 'div', 'attributs': { 'innerHTML': article.content.split('\n')[0] + '...' } }
                        ]
                    })
                }
            }
            var articles_data = [{
                'element': 'div', 'attributs': {'id': 'c-bloc'}, 'sub':
                [
                    {'selector': '#article', 'element': 'span', 'attributs': {'innerHTML': 'Recherche par <b>' + categorie + '</b>: <b>'+ tag + '</b>'}},
                    {'element': 'ul', 'attributs': {}, 'sub': articles}
                ]
            }]
            if (document.querySelector('#accueilCSS')) {
                document.querySelector('#accueilCSS').remove()
            }
            article_DOM = setDOMElement(articles_data)
            article_DOM.querySelectorAll('.link').forEach(function (a) {
                a.addEventListener("click", function (e) {
                    e.preventDefault()
                    load(a.getAttribute('b-entity'), [], 'page', a.getAttribute('href'))
                })
            });
            document.querySelector('#content').innerHTML = ''
            document.querySelector('#content').appendChild(article_DOM)
        }
    }
}