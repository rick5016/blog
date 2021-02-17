var article = function () {
    this.load = async function () {
        let page = (new URL(document.location.href).searchParams.get('page') != null) ? new URL(document.location.href).searchParams.get('page') : 1
        var slug = new URL(document.location.href).searchParams.get('article')
        let data = await promise('api.php', 'POST', {
            'find': 'page',
            'where': {
                'slug': slug,
                'page': page
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

                let similaireElts = []
                if (article.similaires.list.length > 0) {
                    var i = 0
                    for (var keyArticle in article.similaires.list) {
                        i++
                        var similaire = article.similaires.list[keyArticle]
                        similaireElts.push({
                            'element': 'a', 'attributs': { 'b-entity': 'article', 'class': 'similaire link', 'href': 'index.html?article=' + similaire.slug }, 'sub': [
                                { 'element': 'img', 'attributs': { 'src': 'img\\vignette\\' + similaire.vignette } },
                                { 'element': 'div', 'attributs': { 'class': 'title', 'innerHTML': similaire.title } },
                            ]
                        })
                    }
                }
                let articleSimilaires = []
                // Flêche de gauche
                articleSimilaires.push({
                    'element': 'div', 'attributs': { 'id': 'article-similaire-scroll-left' }, 'sub': [
                        { 'element': 'div', 'attributs': { 'id': 'article-similaire-scroll-left-arrow' } }
                    ]
                })
                // container
                articleSimilaires.push({
                    'element': 'div', 'attributs': { 'id': 'article-similaire-container' }, 'sub': [
                        {
                            // container-scroll
                            'element': 'div', 'attributs': { 'id': "article-similaire-scroll" }, 'sub': [
                                // elements
                                { 'element': 'div', 'attributs': { 'id': 'article-similaire-liste' }, 'sub': similaireElts }
                            ]
                        }
                    ]
                })
                if (i > 5) {
                    // Flêche de droite
                    articleSimilaires.push({
                        'element': 'div', 'attributs': { 'id': 'article-similaire-scroll-right' }, 'sub': [
                            { 'element': 'div', 'attributs': { 'id': 'article-similaire-scroll-right-arrow' } }
                        ]
                    })
                }

                let article_DOM = setDOMElement([
                    {
                        'element': 'div', 'attributs': { 'id': 'bloc' }, 'sub': [
                            {
                                'element': 'div', 'attributs': { 'class': 'article' }, 'sub': [
                                    {
                                        'element': 'div', 'attributs': { 'id': 'article-title-container' }, 'sub': [
                                            { 'element': 'img', 'attributs': { 'src': 'img\\vignette\\' + article.vignette } },
                                            {
                                                'element': 'div', 'attributs': { 'id': 'article-title-info' }, 'sub':
                                                    [
                                                        { 'element': 'h1', 'attributs': { 'class': 'title', 'innerHTML': article.title } },
                                                        { 'element': 'div', 'attributs': { 'class': 'info', 'innerHTML': ' Par ' + article.user.login + ' le ' + (date_created.getDate() < 9 ? '0' + date_created.getDate() : date_created.getDate()) + '/' + (date_created.getMonth() < 9 ? '0' + (date_created.getMonth() + 1) : (date_created.getMonth() + 1)) + '/' + date_created.getFullYear() + updateDate } },
                                                    ]
                                            }
                                        ]
                                    },
                                    {
                                        'element': 'div', 'attributs': { 'id': 'article-content-head-container' }, 'sub': [
                                            {
                                                'element': 'div', 'attributs': { 'id': 'article-head' }, 'sub': [
                                                    {
                                                        'element': 'div', 'attributs': { 'id': 'article-head-edit' }, 'sub': [
                                                            {
                                                                'element': 'a', 'attributs': { 'class': 'modifier_article', 'innerHTML': "modifier l'article", 'href': 'index.html?edit=' + article.slug },
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
                                                            },
                                                            {
                                                                'element': 'a', 'attributs': { 'id': 'article-commentaire-link', 'href': '#article-similaire-title' }, 'sub': [
                                                                    { 'element': 'span', 'attributs': { 'id': 'article-commentaire-link-logo' } },
                                                                    { 'element': 'span', 'attributs': { 'id': 'article-commentaire-link-text', 'innerHTML': "Écrire un commentaire" } },
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                ]
                                            },
                                            { 'element': 'div', 'attributs': { 'id': 'article-head-end' } },
                                        ]
                                    },
                                    { 'element': 'div', 'attributs': { 'id': 'article-content', 'innerHTML': article.content } },
                                    { 'element': 'h2', 'attributs': { 'id': 'article-similaire-title', 'innerHTML': 'Articles similaires' } },
                                    { 'element': 'div', 'attributs': { 'id': 'article-similaire' }, 'sub': articleSimilaires },
                                ]
                            },
                            { 'element': 'div', 'attributs': { 'id': 'commentaires' } }
                        ]
                    }
                ])

                // Lien vers la section des commentaires
                article_DOM.querySelector("#article-commentaire-link").addEventListener("click", function (e) {
                    e.preventDefault();
                    var scroll = function () {
                        var progress = Math.min(1, (new Date - start) / 800);
                        window.scrollTo(0, (to - from) * Math.pow(progress, 2) + from);
                        (progress < 1) && window.requestAnimationFrame(scroll);

                    }
                    var start = new Date,
                        from = window.pageYOffset,
                        to = document.getElementById(this.hash.substring(1)).offsetTop;
                    scroll();
                })

                // Section articles similaires
                if (i > 5) {
                    article_DOM.querySelector('#article-similaire-scroll-right').addEventListener("click", function () {
                        document.querySelector('#article-similaire-liste').style.left = '-1296px'
                        document.querySelector('#article-similaire').style['margin-left'] = '-75px'
                        document.querySelector('#article-similaire-scroll-left').style.display = 'block'
                        document.querySelector('#article-similaire-scroll-right').style.display = 'none'
                    })
                }
                article_DOM.querySelector('#article-similaire-scroll-left').addEventListener("click", function () {
                    document.querySelector('#article-similaire-liste').style.left = '0px'
                    document.querySelector('#article-similaire').style['margin-left'] = '0px'
                    document.querySelector('#article-similaire-scroll-left').style.display = 'none'
                    document.querySelector('#article-similaire-scroll-right').style.display = 'block'
                })
                article_DOM.querySelectorAll('.link').forEach(function (a) {
                    a.addEventListener("click", function (e) {
                        e.preventDefault()
                        load(a.getAttribute('b-entity'), [], 'page', a.getAttribute('href'))
                    })
                });

                // Plugin de gestion des commentaires
                load('commentaire', [article], 'plugin', false, true)

                document.querySelector('title').innerHTML = article.title
                document.querySelector('#content').innerHTML = ''
                document.querySelector('#content').appendChild(article_DOM)
            } else {
                alerte(error_messages.load_article_not_found, 'ko', 10)
            }
        }
    }
}