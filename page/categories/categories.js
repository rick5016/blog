var categories = function () {
    this.load = async function () {
        // Exemple : index.html?categories[]=tite:the-kng-s-avatar|test_categorie:test_tag
        var params = new URL(document.location.href).searchParams.get('categories[]')
        data = await promise('api.php', 'POST', {
            'find': 'categorie',
            //'order': 'id desc',
            'where': {
                'data': params
            }
        })

        if (data !== undefined && data !== false) {
            var search = []
            var categories = []
            var articles   = []

            let categorieSearch = params.split('|')
            for (var keyCategorieSearch in categorieSearch) {
                var categorieDetailSearch = categorieSearch[keyCategorieSearch].split(':')
                search.push(categorieSearch[keyCategorieSearch])
            }

            // Gestion de la partie recherche
            for (var keyCategorie in data.list.categories.list) {
                var tags      = []
                let categorie = data.list.categories.list[keyCategorie]
                for (var keyTag in categorie.tags) {
                    let tag = categorie.tags[keyTag]

                    let selection = ''
                    if (inArray(categorie.slug + ':' + tag.slug, search)) {
                        selection = ' checked'
                    }

                    tags.push({
                        'element': 'div', 'attributs': {'class': 'tag'}, 'sub':
                        [
                            {'element': 'div', 'attributs': {'style': 'background-color:#fff;padding:5px', 'innerHTML': '<input type="checkbox" id="' + categorie.slug + ':' + tag.slug + '" name="' + categorie.slug + ':' + tag.slug + '"' + selection + '><label for="scales">' + tag.tag + '</label>'}},
                            /*{
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
                            }*/
                            //{ 'element': 'div', 'attributs': { 'class': 'info', 'innerHTML': 'Par ' + article.user + ' dans ' + article.type + ' le ' + article.created + updateDate } },
                            //{ 'element': 'div', 'attributs': { 'innerHTML': line[0] + line[1] + line[2] + line[3] + line[4] + '...' } }
                        ]
                    })
                }

                categories.push({
                    'element': 'div', 'attributs': {'class': 'categorie'}, 'sub':
                    [
                        {
                            'element': 'div', 'attributs': {'style': 'background-color:#ccc;margin:5px;padding:5px', 'innerHTML': categorie.categorie}, 'sub':tags

                        },
                        /*{
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
                        }*/
                        //{ 'element': 'div', 'attributs': { 'class': 'info', 'innerHTML': 'Par ' + article.user + ' dans ' + article.type + ' le ' + article.created + updateDate } },
                        //{ 'element': 'div', 'attributs': { 'innerHTML': line[0] + line[1] + line[2] + line[3] + line[4] + '...' } }
                    ]
                })
            }

            // Gestion de la partie résultat
            for (var keyArticle in data.list.articles.list) {
                let article   = data.list.articles.list[keyArticle]

                //var tag       = data.list[key]['tag']
                //var categorie = data.list[key]['categorie']
                //categories_tags[categorie.categorie] = tag.tag
                //var line = article.content.split('\n');

                if (article.type == 'article') {
                    var updateDate = ''
                    if (article.created != article.updated) {
                        updateDate = ' modifié le ' + article.updated
                    }
                    
                    articles.push( {
                        'element': 'div', 'attributs': {'class': 'article'}, 'sub':
                        [
                            {
                                'element': 'div', 'attributs': {'class': 'title' }, 'sub':
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
                            { 'element': 'div', 'attributs': { 'class': 'info', 'innerHTML': 'Par ' + article.user + ' dans ' + article.type + ' le ' + article.created + updateDate } },
                            //{ 'element': 'div', 'attributs': { 'innerHTML': line[0] + line[1] + line[2] + line[3] + line[4] + '...' } }
                        ]
                    })
                }
            }
            /*var libelleCategorie = ''
            for (var keyC in categories_tags) {
                libelleCategorie += '<b>' + keyC + '</b>: ' + categories_tags[keyC] + '<br>'
            }*/
            /*var categories = await promise('api.php', 'POST', {
                'find': 'Categorie',
                'where': {
                    'categorie-': categorie,
                }
            })*/
            var articles_data = [{
                'element': 'div', 'attributs': {'id': 'bloc', 'style': 'display:flex;flex-direction: column;'}, 'sub':
                [
                    {
                        'element': 'div', 'attributs': {'style': 'margin:5px'}, 'sub': 
                        [
                            {
                                'element': 'div', 'attributs': {}, 'sub': 
                                [
                                    {'element': 'span', 'attributs': {'innerHTML': 'Votre recherche<br>'}}
                                ]
                            },
                            {
                                'element': 'div', 'attributs': {'style': 'display:flex'}, 'sub': 
                                [
                                    {'element': 'input', 'attributs': {'type': 'text', 'id': 'search', 'name': 'search', 'style': 'float:left;padding:5px;width: calc(100% - 30px);', 'placeholder': "4 caractères minimum : lettres, chiffres et espaces uniquement"}},
                                    {
                                        /*'element': 'img', 'attributs': {'src': 'http://127.0.0.1:5500/blog/img/loupe-30.png', 'style': 'border-top: solid 1px #000;border-right: solid 1px #000;border-bottom: solid 1px #000;background-color: #ccc;cursor: pointer'}, 'sub':
                                        [
                                            {*/
                                                'element': 'a', 'attributs': {'href': 'index.html?article=', 'innerHTML': '', 'style': 'width: 30px;height: 30px;background-color:#000'}, 'callback': {
                                                    'event': 'click',
                                                    'function': function (e) {
                                                        e.preventDefault()
                                                        let searchCategoriesURL = ''
                                                        var searchCategories    = document.querySelectorAll('input[type="checkbox"]');
                                                        for (var key in searchCategories) {
                                                            if (searchCategories[key].checked === true) {
                                                                searchCategoriesURL += searchCategories[key].id + '|'
                                                            }
                                                        }
                                                        load('article', [], 'page', 'index.html?categories[]=' + searchCategoriesURL.substring(0, searchCategoriesURL.length - 1))
                                                    }
                                                }
                                            /*}
                                        ]*/
                                    }
                                ]
                            },
                        ]
                    },
                    {
                        'element': 'div', 'attributs': {'id': 'bloc', 'style': 'display:flex'}, 'sub':
                        [
                            {
                                'element': 'div', 'attributs': {'id': 'bloc1', 'style': 'width:20%'}, 'sub':
                                [
                                    {'element': 'ul', 'attributs': {}, 'sub': categories}
                                ]
                            },
                            {
                                'element': 'div', 'attributs': {'id': 'bloc2', 'style': 'width:80%'}, 'sub':
                                [
                                    {'element': 'ul', 'attributs': {}, 'sub': articles}
                                ]
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