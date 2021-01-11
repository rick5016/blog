var search_barre = function () {
    this.load = async function (data) {
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

        searchSelection = [];
        var hideRedumeSearch = ''
        if (paramsURL['search'] == '') {
            hideRedumeSearch = 'display:none'
        }
        
        if (data !== undefined && data !== false) {
            var categories = []

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
                        })
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

                // On créer la catégorie et on y met les tags
                categories.push({
                    'element': 'div', 'attributs': {}, 'sub':
                    [
                        {'element': 'div', 'attributs': {'class': 'search-categorie', 'innerHTML': categorie.categorie}},
                        {'element': 'div', 'attributs': {'class': 'search-tag-list'}, 'sub':tags},
                    ]
                })
            }
            
            var search_list = [
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
            console.log(search_list)
            /*search_list.push({'element': 'ul', 'attributs': {}, 'sub': categories})
            search_list.push({'element': 'button', 'attributs': {'innerHTML': 'Valider'}})*/

            search_list_DOM = setDOMElement(search_list)

            search_list_DOM.querySelectorAll('.link').forEach(function (a) {
                a.addEventListener("click", function (e) {
                    e.preventDefault()
                    load(a.getAttribute('b-entity'), [], 'page', a.getAttribute('href'))
                })
            });

            console.log(search_list_DOM)
            document.querySelector('#search-list').innerHTML = ''
            document.querySelector('#search-list').appendChild(search_list_DOM)
        }
    }
}