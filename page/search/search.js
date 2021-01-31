var search = function () {
    this.load = async function (params = []) {
        // Récupération des paramètres (exemple: index.html?search=king&categories[]=tite:the-kng-s-avatar|test_categorie:test_tag)
        params['type'] = (new URL(document.location.href).searchParams.get('type') != null) ? new URL(document.location.href).searchParams.get('type') : ''
        params['search'] = (new URL(document.location.href).searchParams.get('search') != null) ? new URL(document.location.href).searchParams.get('search') : ''
        params['affine'] = (new URL(document.location.href).searchParams.get('affine') != null) ? new URL(document.location.href).searchParams.get('affine') : ''
        params['categories'] = (new URL(document.location.href).searchParams.get('categories[]') != null) ? new URL(document.location.href).searchParams.get('categories[]') : ''
        let nb_result_by_page = (new URL(document.location.href).searchParams.get('resultbypage') != null) ? new URL(document.location.href).searchParams.get('resultbypage') : 10
        let page = (new URL(document.location.href).searchParams.get('page') != null) ? new URL(document.location.href).searchParams.get('page') : 1
        let search = true // Détermine si une recherche a été effectuée
        if (params['search'] === '' && params['affine'] === '' && params['categories'] === '') {
            search = false
        }

        let accueil = (params['accueil'] === 1) ? 1 : 0
        data = await promise('api.php', 'POST', {
            'find': 'categorie',
            'where': params,
            'page': page,
            'nb_page': nb_result_by_page,
            'accueil': accueil
        })

        // Si au moins une recherche a été effectué on construit le bloc du résumé de la recherche
        let selection = []
        if (search) {
            selectionElts = []
            // Récupération des catégories/tags sélectionnés (exemple: ['tite:the-kng-s-avatar', 'test_categorie:test_tag'])
            if (params['categories'] !== '') {
                let categorieSearch = params['categories'].split('|')
                for (var keyCategorieSearch in categorieSearch) {
                    selection.push(categorieSearch[keyCategorieSearch])
                }
            }
        }

        if (data !== false && data.list !== undefined) {

            // Gestion de la recherche par catégories/tags
            var categoriesElts = []

            // Parcours des catégories
            for (var keyCategorie in data.list.categories.list) {
                let categorie = data.list.categories.list[keyCategorie]

                // Parcours des tags de chaque catégorie
                var tagsElts = []
                for (var keyTag in categorie.tags) {
                    let tag = categorie.tags[keyTag]

                    // Tag non sélectionné
                    let attributs = { 'id': categorie.slug + ':' + tag.slug, 'name': categorie.slug + ':' + tag.slug, 'class': 'search-tag-checkbox', 'type': 'checkbox' }

                    if (search && inArray(categorie.slug + ':' + tag.slug, selection)) {
                        // Si une recherche a été effectué on récupère les tags afin de les afficher dans le bloc du résumé de la recherche
                        selectionElts.push({
                            'element': 'a', 'attributs': {
                                'b-entity': 'search', 'class': 'search-tag-selection link', 'innerHTML': tag.tag,
                                'href': changeURL(null, null, categorie.slug + ':' + tag.slug)
                            }, 'sub': [
                                { 'element': 'span', 'attributs': { 'class': 'search-tag-selection-croix' } }
                            ]
                        })

                        // Tag sélectionné
                        attributs = { 'id': categorie.slug + ':' + tag.slug, 'name': categorie.slug + ':' + tag.slug, 'class': 'search-tag-checkbox', 'type': 'checkbox', 'checked': 'checked' }
                    }

                    // Construction du tableau des tags pour chaque catégorie
                    tagsElts.push({
                        'element': 'div', 'attributs': {}, 'sub': [
                            {
                                'element': 'div', 'attributs': { 'class': 'search-tag' }, 'sub': [
                                    {
                                        'element': 'div', 'attributs': { 'style': 'display: flex' }, 'sub': [
                                            { 'element': 'input', 'attributs': attributs },
                                            { 'element': 'label', 'attributs': { 'for': categorie.slug + ':' + tag.slug, 'class': 'search-tag-checkbox-label', 'innerHTML': tag.tag} }
                                        ]
                                    },
                                    {'element': 'div', 'attributs': { 'style': 'padding: 5px;', 'innerHTML': ' (' + tag.count + ')' }}
                                ]
                            }
                        ]
                    })
                }

                // Construction du tableau des catégories
                categoriesElts.push({
                    'element': 'div', 'attributs': {}, 'sub': [
                        { 'element': 'div', 'attributs': { 'class': 'search-categorie', 'innerHTML': categorie.categorie } },
                        { 'element': 'div', 'attributs': { 'class': 'search-tag-list' }, 'sub': tagsElts },
                    ]
                })
            }
            /****************************** Fin de parcours des catégories ******************************/

            // Gestion durésultat (Si aucune recherche n'a été envoyé (ni tag, ni recherche) : Alors tous les articles sont retournés)

            // Récupération du nombre de résultat
            var nb_article = 0;
            if (data.list.articles != undefined) {
                var nb_article = data.list.articles.nb_result;
            }

            var paginationElts = []
            var articlesElts = []
            if (data.list.articles !== undefined && data.list.articles.list.length != 0) {

                // Parcours des articles
                for (var keyArticle in data.list.articles.list) {
                    let article = data.list.articles.list[keyArticle]

                    // Recherche et formatage de la date de modification et de création
                    var date_created = new Date(article.created)
                    date_created = ' le ' + (date_created.getDate() < 9 ? '0' + date_created.getDate() : date_created.getDate()) + '/' + (date_created.getMonth() < 9 ? '0' + (date_created.getMonth() + 1) : (date_created.getMonth() + 1)) + '/' + date_created.getFullYear()
                    var updateDate = ''
                    if (article.created != article.updated) {
                        var date_updated = new Date(article.updated)
                        updateDate = ' modifié le ' + (date_updated.getDate() < 9 ? '0' + date_updated.getDate() : date_updated.getDate()) + '/' + (date_updated.getMonth() < 9 ? '0' + (date_updated.getMonth() + 1) : (date_updated.getMonth() + 1)) + '/' + date_updated.getFullYear()
                    }

                    // Recherche et formatage de la vignette
                    var vignette = ''
                    if (article.vignette != undefined) {
                        vignette = 'img\\vignette\\' + article.vignette
                    }

                    // Construction du tableau des articles
                    articlesElts.push({
                        'element': 'div', 'attributs': { 'class': 'article' }, 'sub': [
                            {
                                'element': 'div', 'attributs': { 'class': 'vignette' }, 'sub': [
                                    {
                                        'element': 'img', 'attributs': { 'src': vignette }, 'callback': {
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
                                'element': 'div', 'attributs': { 'class': 'article_content' }, 'sub': [
                                    {
                                        'element': 'div', 'attributs': { 'class': 'title' }, 'sub': [{
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
                                    { 'element': 'div', 'attributs': { 'class': 'info', 'innerHTML': 'Par ' + article.user.login + date_created + updateDate } },
                                ]
                            }
                        ]
                    })
                }
                /****************************** Fin de parcours des articles ******************************/

                // Construction du tableau de la pagination

                // Elément à gauche de la pagination permettant de revenir à la première page
                if (page > 3) {
                    if (data.list.articles.nb_page > 5) {
                        paginationElts.push(
                            {
                                'element': 'div', 'attributs': { 'class': 'page' }, 'sub': [
                                    {
                                        'element': 'a', 'attributs': { 'class': 'link', 'b-entity': 'search', 'href': changeURL() }, 'sub': [
                                            { 'element': 'span', 'attributs': { 'class': 'search-pagination-prems' } }
                                        ]
                                    }
                                ]
                            }
                        )
                    }
                }

                // Pagination
                if (data.list.articles.nb_page > 1) {
                    var nb_pagination = 0;
                    var nb_page = page - 3
                    if (nb_page < 1) nb_page = 0
                    for (var i = (0 + nb_page); i < data.list.articles.nb_page; i++) {
                        nb_pagination++;
                        if (nb_pagination < 6) {
                            var selected = ''
                            if ((i + 1) == page) {
                                var selected = ' page-selected'
                            }
                            paginationElts.push(
                                {
                                    'element': 'div', 'attributs': { 'class': 'page' }, 'sub': [
                                        { 'element': 'a', 'attributs': { 'class': 'link ' + selected, 'innerHTML': (i + 1), 'b-entity': 'search', 'href': changeURL(null, null, null, null, (i + 1)) } }
                                    ]
                                }
                            )
                        }
                    }

                    // Elément à droite de la pagination permettant d'aller à la dernière page
                    if (page < (data.list.articles.nb_page - 2)) {
                        if (data.list.articles.nb_page > 5) {
                            paginationElts.push(
                                {
                                    'element': 'div', 'attributs': { 'b-entity': 'search', 'class': 'page' }, 'sub': [
                                        {
                                            'element': 'a', 'attributs': { 'class': 'link search-pagination-last-container', 'b-entity': 'search', 'href': changeURL(null, null, null, null, data.list.articles.nb_page) }, 'sub':
                                                [
                                                    { 'element': 'span', 'attributs': { 'class': 'search-pagination-last' } }
                                                ]
                                        }
                                    ]
                                }
                            )
                        }
                    }
                }

                // Commentaire en fin de pagination affichant le numéro des articles affiché à l'écran
                var max = page * nb_result_by_page
                if (nb_article < max) {
                    max = nb_article
                }
                paginationElts.push(
                    { 'element': 'div', 'attributs': { 'class': 'search-pagination-info', 'innerHTML': ((page * nb_result_by_page) - (nb_result_by_page - 1)) + ' - ' + max + ' sur ' + data.list.articles.nb_result + ' article(s)' } }
                )
            } else {
                let aucun_resultat_texte = ''
                if (params['categories'] !== '' && params['search'] !== '') {
                    aucun_resultat_texte += 'Essayez d\'utiliser des mots-clefs plus larges et de vérifier l\'orthographe.<br>Vous pouvez également modifier ou réinitialiser les filtres.'
                } else if (params['categories'] !== '') {
                    aucun_resultat_texte += 'Essayez de modifiez ou réinitialisez les filtres.'
                } else if (params['search'] !== '' || params['affine'] !== '') {
                    aucun_resultat_texte += 'Essayez d\'utiliser des mots-clefs plus larges et de vérifier l\'orthographe.'
                } else {
                    aucun_resultat_texte += 'Aucun résultat.'
                }
                // Si un critère de recherche est écrit : Essayez d'utiliser des mots-clefs plus larges et de vérifier l'orthographe.
                // Si au moins un tag est selectionné : Mdifiez ou réinitialisez les filtres

                articlesElts.push({ 'element': 'div', 'attributs': { 'id': 'aucun-resultat', 'innerHTML': aucun_resultat_texte } })
            }
            /****************************** Fin de la création de la pagination ******************************/

            // Construction du résultat
            let article_result = []

            // Contruction du résumé de la recherche (si une recherche existe)
            if (search) {
                let nb_article_texte = 'Aucun article ne correspond'
                if (nb_article > 0) {
                    nb_article_texte = nb_article + ' article(s) correspondant'
                }

                // Si affine existe on l'ajoute en tps que tag à selectionElts (en début de liste)
                if (params['affine'] !== '') {
                    selectionElts.unshift({
                        'element': 'a', 'attributs': {
                            'b-entity': 'search', 'class': 'search-tag-selection link', 'innerHTML': data.affine,
                            'href': changeURL(null, '')
                        }, 'sub': [
                            { 'element': 'span', 'attributs': { 'class': 'search-tag-selection-croix' } }
                        ]
                    })
                }

                let article_resume = []
                article_resume.push({ 'element': 'div', 'attributs': { 'id': 'search-selection-nb', 'innerHTML': nb_article_texte } });
                article_resume.push({ 'element': 'div', 'attributs': { 'id': 'search-tag-selection' }, 'sub': selectionElts });

                if (selectionElts.length > 0) {
                    article_resume.push({
                        'element': 'button', 'attributs': { 'id': 'search-selection-delete' }, 'sub': [
                            { 'element': 'a', 'attributs': { 'class': 'link', 'b-entity': 'search', 'innerHTML': 'Effacer tout', 'href': changeURL(null, '', '') } }
                        ]
                    });
                }

                article_result.push(
                    { 'element': 'div', 'attributs': { 'id': 'search-selection' }, 'sub': article_resume }
                )
            }
            if (data.list.articles.nb_result > 0) {
                var nb_result_by_page_option_Elts = []
                for (var i = 0; i < 6; i++) {
                    let value = i * 10;
                    if (i == 0) {
                        value = 5
                    }
                    let attr = { 'value': value, 'innerHTML': value }
                    if (value == nb_result_by_page) {
                        attr = { 'value': value, 'innerHTML': value, 'selected': 'selected' }
                    }

                    nb_result_by_page_option_Elts.push({ 'element': 'option', 'attributs': attr })
                }
                article_result.push({
                    'element': 'div', 'attributs': { 'id': 'search-pagination-nb-result-by-page', 'innerHTML': 'Afficher ' }, 'sub': [
                        { 'element': 'select', 'attributs': {}, 'sub': nb_result_by_page_option_Elts },
                        { 'element': 'span', 'attributs': { 'innerHTML': ' résultats par page' } },
                    ]
                })
            }
            
            // Contruction de la pagination + articles
            article_result.push({ 'element': 'div', 'attributs': { 'class': 'search-pagination' }, 'sub': paginationElts })
            article_result.push({ 'element': 'ul', 'attributs': { 'id': 'search-result' }, 'sub': articlesElts })
            article_result.push({ 'element': 'div', 'attributs': { 'class': 'search-pagination', 'style': 'margin-top: 20px' }, 'sub': paginationElts })

            // Contruction de la page
            var result_data = []

            // Si une recherche par texte existe, alors on l'affiche
            if (params['search'] !== '') {
                result_data.push({ 'element': 'span', 'attributs': { 'id': 'search-resume', 'innerHTML': 'Résultats pour votre recherche : "' + data.search + '"' } })
            }

            // Reste de la page
            result_data.push({
                'element': 'div', 'attributs': { 'id': 'search-bloc' }, 'sub': [
                    {
                        'element': 'div', 'attributs': { 'id': 'search-bloc2', 'style': 'display:flex' }, 'sub': [
                            {
                                'element': 'div', 'attributs': { 'id': 'search-list' }, 'sub': [
                                    {
                                        'element': 'div', 'attributs': { 'id': 'search-input-affine-bloc' }, 'sub': [
                                            { 'element': 'span', 'attributs': { 'id': 'search-input-affine-title', 'innerHTML': 'Affiner votre recherche' } },
                                            { 'element': 'input', 'attributs': { 'type': 'text', 'id': 'search-input-affine', 'name': 'search', 'placeholder': "Titre, artiste ...", 'value': params['affine'] } },
                                            {
                                                'element': 'button', 'attributs': { 'id': 'search-input-affine-btn', 'innerHTML': 'Ok' }, 'callback': {
                                                    'event': 'click',
                                                    'function': function () {
                                                        load('search', [], 'page', setURL())
                                                    }
                                                }
                                            },
                                        ]
                                    },
                                    { 'element': 'ul', 'attributs': {}, 'sub': categoriesElts }
                                ]
                            },
                            { 'element': 'div', 'attributs': { 'id': 'menuToggle' } }
                        ]
                    },
                    {
                        'element': 'div', 'attributs': { 'id': 'search-list-result' }, 'sub': article_result
                    }
                ]
            })
            var result = [{
                'element': 'div', 'attributs': { 'id': 'search', 'style': 'display:flex;flex-direction: column;' }, 'sub': result_data
            }]

            result_DOM = setDOMElement(result)

            // Event sur les bouton valider de la recherche par catégories/tags
            result_DOM.querySelectorAll('.search-tag-checkbox').forEach(function (c) {
                c.addEventListener("click", function () {
                    var div = document.createElement('div')
                    div.classList.add('valider-container')
                    var button = document.createElement('button')
                    button.innerHTML = 'Valider'
                    button.classList.add('valider')
                    button.addEventListener("click", function () {
                        load('search', [], 'page', setURL())
                    })
                    div.appendChild(button)
                    var parent = c.parentNode.parentNode.parentNode.parentNode
                    if (parent.lastChild.className != 'valider-container') {
                        c.parentNode.parentNode.parentNode.parentNode.appendChild(div)
                    }
                })
            });

            // Event sur les liens de la pagination
            result_DOM.querySelectorAll('.link').forEach(function (a) {
                a.addEventListener("click", function (e) {
                    e.preventDefault()
                    load(a.getAttribute('b-entity'), [], 'page', a.getAttribute('href'))
                })
            });

            if (data.list.articles.nb_result > 0) {
                // Event sur le nombre de résultat par page
                result_DOM.querySelector('#search-pagination-nb-result-by-page select').addEventListener("change", function () {
                    load('search', [], 'page', changeURL(null, null, null, this.value))
                });
            }

            result_DOM.querySelector('#search-input-affine').addEventListener("keypress", function (e) {
                if (e.key === 'Enter') {
                    load('search', [], 'page', setURL())
                }
            })

            result_DOM.querySelector('#menuToggle').addEventListener("click", function () {
                if (document.querySelector('#search-list').classList.contains('search-list-show')) {
                    document.querySelector('#search-list-result').classList.remove("search-list-result-hide")
                    document.querySelector('#menuToggle').classList.remove("menuToggle-show")
                    document.querySelector('#search-list').classList.remove("search-list-show")
                } else {
                    document.querySelector('#search-list-result').classList.add("search-list-result-hide")
                    document.querySelector('#menuToggle').classList.add("menuToggle-show")
                    document.querySelector('#search-list').classList.add("search-list-show")
                }
            })

            // Fini !!!
            document.querySelector('#search-input').value = params['search']
            document.querySelector('#content').innerHTML = ''
            document.querySelector('#content').appendChild(result_DOM)
            document.querySelector('title').innerHTML = 'Recherche par critères de drama anime et webtoon'
        }
    }
}

setURL = function () {
    let search = document.querySelector('#search-input').value
    let affine = document.querySelector('#search-input-affine').value
    let caseCoches = document.querySelectorAll('input[type="checkbox"]:checked')
    let resultbypage = new URL(document.location.href).searchParams.get('resultbypage')
    let type = new URL(document.location.href).searchParams.get('type')

    let url = 'index.html?search=' + search

    if (affine != '') {
        url += '&affine=' + affine
    }

    if (resultbypage != null) {
        url += '&resultbypage=' + resultbypage
    }

    if (resultbypage != null) {
        url += '&type=' + type
    }

    if (caseCoches != null) {
        url += '&categories[]='
        caseCoches.forEach(function (i) {
            url += i.id + '|'
        })
        url = url.substring(0, url.length - 1);
    }

    return url
}