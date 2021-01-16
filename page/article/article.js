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
                
                var date_created = new Date(article.created)
                var updateDate = ''
                if (article.created != article.updated) {
                    var date_updated = new Date(article.updated)
                    updateDate = ' modifié le ' + (date_updated.getDate() < 9 ? '0' + date_updated.getDate() : date_updated.getDate()) + '/' + (date_updated.getMonth() < 9 ? '0' + (date_updated.getMonth() + 1) : (date_updated.getMonth() + 1)) + '/' + date_updated.getFullYear()
                }

                let article_DOM = setDOMElement([
                    {
                        'element': 'div', 'attributs': {'id': 'bloc'}, 'sub':
                        [
                            {
                                'element': 'div', 'attributs': {'class': 'article'}, 'sub':
                                [
                                    {
                                        'element': 'div', 'attributs': {'id': 'article-title-container'}, 'sub':
                                        [
                                            {'element': 'img', 'attributs': {'src': 'img\\vignette\\' + article.vignette}},
                                            {'element': 'div', 'attributs': {'id': 'article-title-info'}, 'sub':
                                                [
                                                    {'element': 'h1', 'attributs': {'class': 'title', 'innerHTML': article.title}},
                                                    {'element': 'div', 'attributs': {'class': 'info', 'innerHTML': ' Par ' + article.user.login + ' le ' + (date_created.getDate() < 9 ? '0' + date_created.getDate() : date_created.getDate()) + '/' + (date_created.getMonth() < 9 ? '0' + (date_created.getMonth() + 1) : (date_created.getMonth() + 1)) + '/' + date_created.getFullYear() + updateDate } },
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        'element': 'div', 'attributs': {'id': 'article-content-commentaire-container'}, 'sub':
                                        [
                                            {
                                                'element': 'div', 'attributs': {'id': 'article-content-commentaire', 'innerHTML': ''}, 'sub':
                                                [
                                                    {
                                                        'element': 'a', 'attributs': {'class': 'modifier_article', 'innerHTML': "modifier l'article", 'href': 'index.html?edit=' + article.slug}, 
                                                        'connexion': true,
                                                        'multiple': false, 
                                                        'callback': {
                                                            'event': 'click',
                                                            'function': function (e) {
                                                                e.preventDefault()
                                                                load('edit', [], 'page', 'index.html?edit=' + article.slug)
                                                            }
                                                        },
                                                        'connexion': true
                                                    }
                                                ]
                                            },
                                            {'element': 'div', 'attributs': {'id': 'article-content-commentaire-end'}},
                                        ]
                                    },
                                    {'element': 'div', 'attributs': {'id': 'article-content', 'innerHTML': article.content}},
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