var search = function () {
    this.load = async function () {
        // Exemple : index.html?categories[]=tite:the-kng-s-avatar|test_categorie:test_tag
        let paramsURL = {'search': new URL(document.location.href).searchParams.get('search')}
        var params = new URL(document.location.href).searchParams.get('categories[]')
        if (params !== null) {
            paramsURL['data'] = params

            var searchParamCategorie = []
            let categorieSearch = params.split('|')
            for (var keyCategorieSearch in categorieSearch) {
                searchParamCategorie.push(categorieSearch[keyCategorieSearch])
            }
        }
        
        data = await promise('index.php', 'POST', {
            'find': 'categorie',
            'where': paramsURL
        })


        searchSelection = [];
        var hideResumeSearch = ''
        var hideResumeSearchResult = ''
        if (paramsURL['search'] == '' || paramsURL['search'] == null) {
            hideResumeSearch = 'display:none'
        }
        if ((paramsURL['search'] == '' || paramsURL['search'] == null) && paramsURL['data'] == undefined ) {
            hideResumeSearchResult = 'display:none'
        }
        
        if (data !== undefined && data !== false) {
            var categories = []
            var articles   = []

            // Gestion de la partie recherche
            for (var keyCategorie in data.list.categories.list) {
                var tags      = []
                let categorie = data.list.categories.list[keyCategorie]

                // On va chercher tous les tags de la catégorie
                for (var keyTag in categorie.tags) {
                    let tag = categorie.tags[keyTag]

                    let attributs = {'id': categorie.slug + ':' + tag.slug, 'name': categorie.slug + ':' + tag.slug, 'class': 'search-tag-checkbox', 'type': 'checkbox'}
                    if (searchParamCategorie != undefined &&  inArray(categorie.slug + ':' + tag.slug, searchParamCategorie)) {
                        searchSelection.push(
                            {
                                'element': 'div', 'attributs': {'class': 'search-tag-selection', 'innerHTML': tag.tag}, 'sub' :
                                [
                                    {'element': 'div', 'class': 'search-tag-selection', 'attributs': {'class': 'search-tag-selection-croix'} }
                                ]
                        }
                        )
                        attributs = {'id': categorie.slug + ':' + tag.slug, 'name': categorie.slug + ':' + tag.slug, 'class': 'search-tag-checkbox', 'type': 'checkbox', 'checked': 'checked'}
                    }


                    tags.push({
                        'element': 'div', 'attributs': {}, 'sub':
                        [
                            {
                                'element': 'div', 'attributs': {'class': 'search-tag'}, 'sub':
                                [
                                    {'element': 'input', 'attributs': attributs},
                                    {'element': 'label', 'attributs': {'for': categorie.slug + ':' + tag.slug, 'class': 'search-tag-checkbox-label', 'innerHTML': tag.tag}}
                                ]
                            }
                        ]
                    })
                }

                categories.push({
                    'element': 'div', 'attributs': {}, 'sub':
                    [
                        {
                            'element': 'div', 'attributs': {'class': 'search-categorie', 'innerHTML': categorie.categorie}

                        },
                        {
                            'element': 'div', 'attributs': {'class': 'search-tag-list'}, 'sub':tags

                        },
                    ]
                })
            }
            
            // Gestion de la partie résultat (Si aucune recherche n'a été envoyé (ni tag, ni recherche) : Alors tous les articles sont retournés)
            if (data.list.articles !== undefined && data.list.articles.list.length != 0) {
                for (var keyArticle in data.list.articles.list) {
                    let article   = data.list.articles.list[keyArticle]
                    if (article.type == 'article') {
                        var updateDate = ''
                        if (article.created != article.updated) {
                            var date_updated = new Date(article.updated)
                            updateDate = ' modifié le ' + (date_updated.getDate() < 9 ? '0' + date_updated.getDate() : date_updated.getDate()) + '/' + (date_updated.getMonth() < 9 ? '0' + (date_updated.getMonth() + 1) : (date_updated.getMonth() + 1)) + '/' + date_updated.getFullYear()
                        }

                        var vignette = ''
                        if (article.vignette != undefined) {
                            vignette = 'img\\vignette\\' + article.vignette
                        } else {
                            vignette = 'img\\totoro\\totoro_' + ((Math.floor(Math.random() * Math.floor(6))) + 1) + '_60.png'
                        }

                        var date_created = new Date(article.created)
                        articles.push( {
                            'element': 'div', 'attributs': {'class': 'article'}, 'sub':
                            [
                                {
                                    'element': 'div', 'attributs': {'class': 'vignette'}, 'sub':
                                    [
                                        {
                                            'element': 'img', 'attributs': {'src': vignette}, 'callback': {
                                                'event': 'click',
                                                'function': function (e) {
                                                    e.preventDefault()
                                                    load('article', [], 'page', 'index.html?article=' + article.slug)
                                                }
                                            }
                                        }
                                    ]
                                },
                                {
                                    'element': 'div', 'attributs': {'class': 'article_content' }, 'sub':
                                    [
                                        {'element': 'div', 'attributs': {'class': 'title' }, 'sub':
                                            [
                                                {
                                                    'element': 'a', 'attributs': {'href': 'index.html?article=' + article.slug, 'innerHTML': article.title }, 'callback': {
                                                        'event': 'click',
                                                        'function': function (e) {
                                                            e.preventDefault()
                                                            load('article', [], 'page', 'index.html?article=' + article.slug)
                                                        }
                                                    }
                                                }
                                            ]
                                        },
                                        { 'element': 'div', 'attributs': { 'class': 'info', 'innerHTML': 'Par ' + article.user.login + ' le ' + (date_created.getDate() < 9 ? '0' + date_created.getDate() : date_created.getDate()) + '/' + (date_created.getMonth() < 9 ? '0' + (date_created.getMonth() + 1) : (date_created.getMonth() + 1)) + '/' + date_created.getFullYear() + updateDate } },
                                    ]
                                }
                            ]
                        })
                    }
                }  
            } else {
                articles.push( {'element': 'div', 'attributs': {'innerHTML': 'Aucun résultat'}})
            }
            
            let article_result = [
                {
                    'element': 'div', 'attributs': {'id': 'search-selection', 'style': hideResumeSearchResult}, 'sub': 
                    [
                        {'element': 'div', 'attributs': {'id': 'search-selection-nb', 'innerHTML': data.list.articles.list.length + ' article(s) correspondant'}},
                        {'element': 'div', 'attributs': {'id': 'search-tag-selection'}, 'sub': searchSelection},
                        {'element': 'button', 'attributs': {'id': 'search-selection-delete', 'innerHTML': 'Effacer tout'}}
                    ]
                },
                {'element': 'ul', 'attributs': {'id': 'search-result'}, 'sub': articles}
            ]
            var articles_data = [{
                'element': 'div', 'attributs': {'id': 'search', 'style': 'display:flex;flex-direction: column;'}, 'sub':
                [
                    {'element': 'span', 'attributs': {'id': 'search-resume', 'innerHTML': 'Résultats pour votre recherche : "' + data.search  + '"', 'style': hideResumeSearch} },
                    {
                        'element': 'div', 'attributs': {'id': 'search-bloc'}, 'sub':
                        [
                            {
                                'element': 'div', 'attributs': {'id': 'search-list'}, 'sub':
                                [
                                    {
                                        'element': 'div', 'attributs': {'id': 'search-input-affine-bloc'}, 'sub':
                                        [
                                            {'element': 'span', 'attributs': {'id': 'search-input-affine-title', 'innerHTML': 'Affiner votre recherche'}},
                                            {'element': 'input', 'attributs': {'type': 'text', 'id': 'search-input-affine', 'name': 'search', 'placeholder': "Titre, artiste ..."}},
                                            {'element': 'button', 'attributs': {'id': 'search-input-affine-btn', 'innerHTML': 'Ok'}},
                                        ]
                                    },
                                    {'element': 'ul', 'attributs': {}, 'sub': categories},
                                    {'element': 'button', 'attributs': {'innerHTML': 'Valider'}},
                                ]
                            },
                            {
                                'element': 'div', 'attributs': {'id': 'search-list-result'}, 'sub': article_result
                            }
                        ]
                    }]
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