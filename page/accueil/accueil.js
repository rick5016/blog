var accueil = function () {
    this.load = async function () {

        var data = await promise('index.php', 'POST', {
            'findAll': 'pagetag',
            'accueil': '1'
        })
        var selectionElts = []
        if (data !== false && data.list !== undefined) {
            // Parcours des catégories
            for (var keyCategorie in data.list.categories.list) {
                let categorie = data.list.categories.list[keyCategorie]
                if (categorie.categorie == 'type') {
                    for (var keyTag in categorie.tags.list) {
                        let tag = categorie.tags.list[keyTag]
                        // TODO : il faudrai récupérer l'image du dernier article pour chaque type
                        selectionElts.push({
                            'entity': 'search',
                            'href': 'index.html?search=&categories[]=type:' + tag.slug,
                            'img': '/img/article/' + tag.slug + '_presentation_' + tag.lastArticle.slug + '.jpg',
                            'title': tag.tag,
                            'sub-title': tag.count + ' articles'
                        })
                    }
                }
            }
        }
        var result = [{
            'element': 'div', 'attributs': { 'id': 'bloc-accueil' }, 'sub': [
                { 'element': 'div', 'attributs': { 'id': 'slide' } },
                {
                    'element': 'div', 'attributs': { 'style': 'display: flex;flex-direction: row;flex-wrap: wrap;column-gap: 20px;' }, 'sub': [
                        {
                            'element': 'div', 'attributs': { 'id': 'accueil-commentaires', 'style': 'background-color:#e4e4e4' }, 'sub': [
                                { 'element': 'div', 'attributs': { 'id': 'commentaires' } },
                            ]
                        },
                        {
                            'element': 'div', 'attributs': { 'id': 'accueil-commentaires' }, 'sub': [
                                { 'element': 'h2', 'attributs': { 'innerHTML': 'Statistiques du site', 'style': 'text-align: center;' } },
                                { 'element': 'div', 'attributs': { 'innerHTML': 'prochainement', 'style': 'text-align: center;' } },
                            ]
                        },
                    ]
                }
            ]
        }]
        var test = { 'list': selectionElts }

        let inscription_DOM = setDOMElement(result)

        document.querySelector('#content').innerHTML = ''
        document.querySelector('#content').appendChild(inscription_DOM)

        load('commentaire', { 'page': 1, 'resultbypage': 5, 'accueil': 1 }, 'plugin', false, true)
        load('slide', test, 'plugin', false, true)
    }
}