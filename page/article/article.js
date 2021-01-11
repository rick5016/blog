var article = function () {
    this.load = async function (elm) {
        var slug = new URL(document.location.href).searchParams.get('article')
        let data = await promise('index.php', 'POST', {
            'find': 'page',
            'where': {
                'slug': slug
            }
        })

        if (data !== undefined && data.error === 0) {
            if (data.list.length > 0) {
                var article = data.list[0]

                // Chargement de l'article
                var updateDate = ''
                if (article.created != article.updated) {
                    updateDate = ' modifié le ' + article.updated
                }

                let article_DOM = setDOMElement([
                    {
                        'element': 'div', 'attributs': {'id': 'bloc'}, 'sub':
                        [
                            {
                                'element': 'div', 'attributs': {'class': 'article'}, 'sub':
                                [
                                    {'element': 'div', 'attributs': {'class': 'title', 'innerHTML': article.title}},
                                    {'element': 'div', 'attributs': {'id': 'info', 'innerHTML': 'Par ' + article.user + ' dans ' + article.type + ' le ' + article.created + updateDate } },
                                    {
                                        'element': 'span', 'attributs': {'class': 'modifier_article', 'innerHTML': "modifier l'article" }, 
                                        'connexion': true,
                                        'multiple': false, 
                                        'callback': {
                                            'event': 'click',
                                            'function': function () {
                                                load('edit', [], 'page', 'index.html?edit=' + article.slug)
                                            }
                                        },
                                        'connexion': true
                                    },
                                    { 'element': 'div', 'attributs': {'id': 'article_content', 'innerHTML': article.content } },
                                ]
                            }
                        ]
                    }
                ])
                article_DOM.querySelectorAll('.link').forEach(function (a) {
                    a.addEventListener("click", function (e) {
                        e.preventDefault()
                        load(a.getAttribute('b-entity'), [], 'page', a.getAttribute('href'))
                    })
                });
                document.querySelector('#content').innerHTML = ''
                document.querySelector('#content').appendChild(article_DOM)

            } else {
                alerte(error_messages.load_article_not_found, 'ko', 10)
            }
        }
    }
}