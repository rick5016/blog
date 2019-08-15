const load = async function () {
    var serie = new URL(document.location.href).searchParams.get('serie')
    var saison = new URL(document.location.href).searchParams.get('saison')

    if (serie !== '' && (saison !== null || saison !== '')) {
        /*
        Si l'id de la série et de la saison existent
            On parcours la liste de la saison (table episode)
            On affiche les champs de l'épisode
            Si edit existe :
                On ajoute les champs necessaire pour ajouter un épisode à la liste
                On ajoute une croix à chaque élément pour supprimer un épisode
        */
        let data = await promise('index.php', 'POST', {
            'find': 'episode',
            'where': {
                'serie': serie,
                'saison': saison
            }
        })
        if (data.error === 0) {
            let wrapper = document.createElement('ul')
            for (var key in data) {
                let serie = data[key]
                let li = document.createElement('li')
                let a = document.createElement('a')

                a.href = 'index.html?serie=' + serie.slug
                a.innerHTML = serie.title
                a.addEventListener("click", function (e) {
                    e.preventDefault()
                    loadContent('serie', base + 'index.html?serie=' + serie.slug)
                })

                li.appendChild(a)
                wrapper.appendChild(li)
            }
            document.querySelector('#page').appendChild(wrapper)
        }
    } else if (serie !== '' && (saison === null || saison === '')) {
        /*
        Si l'id de la série existe
            On parcours la liste des saisons (table saison)
            On affiche la liste avec un lien et l'id de la série + la saison
            Si edit existe :
                On ajoute un champ int pour ajouter une saison à la liste
                On ajoute une croix à chauqe éléméent de la liste pour supprimer une saison (suppression possible uniquement si elle n'a pas d'enfant)
        */
        let data = await promise('index.php', 'POST', {
            'find': 'saison',
            'where': {
                'serie': serie
            }
        })
        if (data.error === 0) {
            let wrapper = document.createElement('ul')
            for (var key in data) {
                let serie = data[key]
                let li = document.createElement('li')
                let a = document.createElement('a')

                a.href = 'index.html?serie=' + serie.slug
                a.innerHTML = serie.title
                a.addEventListener("click", function (e) {
                    e.preventDefault()
                    history.pushState({ page: 'serie' }, 'serie', base + 'index.html?serie=' + serie.slug)
                    loadSerie()
                })

                li.appendChild(a)
                wrapper.appendChild(li)
            }
            document.querySelector('#page').appendChild(wrapper)
        }
    } else {
        /*
            Si aucun param :
                On va cherche tous les titres des séries (table série)
                On affiche la liste avec un lien et l'id de la série
                Si edit existe :
                    On ajoute un champ text pour ajouter une série à la liste
                    On ajoute une croix à chauqe éléméent de la liste pour supprimer une série (suppression possible uniquement si elle n'a pas d'enfant)
        */
        let data = await promise('index.php', 'POST', {
            'find': 'serie'
        })

        if (data.error === 0) {
            if (data.list !== undefined) {
                let wrapper = document.createElement('ul')
                for (var key in data.list) {
                    let serie = data.list[key]
                    let li = document.createElement('li')
                    let a = document.createElement('a')

                    a.href = 'index.html?serie=' + serie.slug
                    a.innerHTML = serie.title
                    a.addEventListener("click", function (e) {
                        e.preventDefault()
                        history.pushState({ page: 'serie' }, 'serie', base + 'index.html?serie=' + serie.slug)
                        loadSerie()
                    })

                    li.appendChild(a)
                    if (localStorage.getItem('token') !== null && serie.own) {
                        // TODO : on ajoute un bouton de suppression
                    }
                    wrapper.appendChild(li)
                }
                document.querySelector('#page').appendChild(wrapper)
            }
            if (localStorage.getItem('token') !== null) {

                let form = document.createElement('form')
                form.action = ''
                form.method = 'post'
                form.name = 'form_serie'
                form.id = 'form_serie'

                let div = document.createElement('div')
                div.setAttribute('class', 'flex')

                let input = document.createElement('input')
                input.type = 'text'
                input.name = 'title'
                input.id = 'title'
                div.appendChild(input)
                let submit = document.createElement('div')
                submit.id = 'save_serie'
                submit.setAttribute('class', 'button')
                submit.innerHTML = 'Ajouter une série'
                div.appendChild(submit)

                form.appendChild(div)
                document.querySelector('#page').appendChild(form)

                document.querySelector('#save_serie').addEventListener("click", function () {
                    saveSerie(true)
                })

            }
        }
    }
}

const saveSerie = async function (reload) {
    //document.querySelector('#loader').style.display = null

    var error = ''
    let title = document.querySelector('#title').value
    if (title === '') {
        error = error_messages.save_article_title_required
    }

    if (error === '') {
        let data = await promise('index.php', 'POST', {
            'save': 'serie',
            'values': {
                'title': document.querySelector('#title').value,
                'slug': document.querySelector('#title').value
            }
        })

        if (data.error === 0) {
            loadContent('serie', base + 'index.html?serie=' + data.slug)
            alerte(error_messages.save_serie_valide, 'ok', 1)
            //document.querySelector('#loader').style.display = 'none'
        }
    } else {
        //document.querySelector('#loader').style.display = 'none'
        alerte(error, 'ko')
    }
}