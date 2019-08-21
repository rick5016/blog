var Page = function () {
    this.load = async function () {
        var serie = new URL(document.location.href).searchParams.get('serie')
        var saison = new URL(document.location.href).searchParams.get('saison')
        var DOM = await promise('serie.html')

        if (serie !== '' && (saison !== null && saison !== '')) { // episode
            /*
            Si l'id de la série et de la saison existent
                On parcours la liste de la saison (table episode)
                On affiche les champs de l'épisode
                Si edit existe :
                    On ajoute les champs necessaire pour ajouter un épisode à la liste
                    On ajoute une croix à chaque élément pour supprimer un épisode
            */
            DOM.querySelector('#serie').remove()
            DOM.querySelector('#saison').remove()

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
        } else if (serie !== '' && (saison === null || saison === '')) { // saison
            /*
            Si l'id de la série existe
                On parcours la liste des saisons (table saison)
                On affiche la liste avec un lien et l'id de la série + la saison
                Si edit existe :
                    On ajoute un champ int pour ajouter une saison à la liste
                    On ajoute une croix à chauqe éléméent de la liste pour supprimer une saison (suppression possible uniquement si elle n'a pas d'enfant)
            */
            DOM.querySelector('#serie').remove()
            DOM.querySelector('#episode').remove()

            let data = await promise('index.php', 'POST', {
                'find': 'saison',
                'where': {
                    'serie': serie
                }
            })
            if (data.error === 0) {
                // Liste des saisons
                for (var key in data.list) {
                    let saison = data.list[key]
                    let li = document.createElement('li')
                    let a = document.createElement('a')
                    a.href = 'index.html?serie=' + serie + '&saison=' + saison.saison
                    a.innerHTML = saison.saison
                    a.addEventListener("click", function (e) {
                        e.preventDefault()
                        loadContent('serie', base + 'index.html?serie=' + serie + '&saison=' + saison.saison)
                    })
                    li.appendChild(a)

                    // Bouton supprimer
                    if (localStorage.getItem('token') !== null) {
                        let delete_saison = document.createElement('a')
                        delete_saison.innerHTML = ' <span style="color:red;font-weight:bold">X</span>'
                        delete_saison.setAttribute('class', 'link')
                        delete_saison.addEventListener("click", function (e) {
                            e.preventDefault()
                            api('delete',
                                'saison',
                                {},
                                {
                                    'serie': serie,
                                    'saison': saison.saison
                                },
                                '',
                                'serie=' + serie + '&',
                                'serie'
                            )
                        })
                        li.appendChild(delete_saison)
                    }
                    DOM.querySelector('#list_saison').appendChild(li)
                }

                if (localStorage.getItem('token') !== null) {
                    // Ajout d'une saison
                    DOM.querySelector('#save_saison').addEventListener("click", function () {
                        api('save',
                            'saison',
                            {
                                'saison': document.querySelector('#title_saison').value,
                                'serie': serie
                            },
                            {},
                            'saison',
                            'serie=' + serie + '&',
                            'serie'
                        )
                    })

                    // modification des infos de la série
                    var modifyAll = DOM.querySelectorAll('.modify')
                    modifyAll.forEach(function (modify) {
                        modify.addEventListener("click", function () {
                            api('save',
                                'serie', // entite
                                {
                                    'title': document.querySelector('#serie_name').value,
                                    'slug': document.querySelector('#serie_name').value,
                                    'description': document.querySelector('#serie_desc').value
                                }, {
                                    'slug': serie,
                                },
                                'slug'
                            )
                        })
                    })
                } else {
                    var modifyAll = document.querySelectorAll('.modify')
                    modifyAll.forEach(function (modify) {
                        modify.remove()
                    })
                    DOM.querySelector('#form_saison').remove()
                }

                document.querySelector('#page_content').innerHTML = ''
                document.querySelector('#page_content').appendChild(DOM)
            }
        } else { // serie
            /*
                Si aucun param :
                    On va cherche tous les titres des séries (table série)
                    On affiche la liste avec un lien et l'id de la série
                    Si edit existe :
                        On ajoute un champ text pour ajouter une série à la liste
                        On ajoute une croix à chauqe éléméent de la liste pour supprimer une série (suppression possible uniquement si elle n'a pas d'enfant)
            */
            DOM.querySelector('#saison').remove()
            DOM.querySelector('#episode').remove()

            let data = await promise('index.php', 'POST', {
                'find': 'serie'
            })

            if (data.error === 0) {
                // Liste des séries
                for (var key in data.list) {
                    let serie = data.list[key]
                    let li = document.createElement('li')

                    let a = document.createElement('a')
                    a.href = 'index.html?serie=' + serie.slug
                    a.innerHTML = serie.title
                    a.addEventListener("click", function (e) {
                        e.preventDefault()
                        loadContent('serie', base + 'index.html?serie=' + serie.slug)
                    })
                    li.appendChild(a)

                    // Bouton supprimer
                    if (localStorage.getItem('token') !== null) {
                        let delete_serie = document.createElement('a')
                        delete_serie.innerHTML = ' <span style="color:red;font-weight:bold">X</span>'
                        delete_serie.setAttribute('class', 'link')
                        delete_serie.addEventListener("click", function (e) {
                            e.preventDefault()
                            api('delete',
                                'serie',
                                {},
                                { 'slug': serie.slug }
                            )
                        })
                        li.appendChild(delete_serie)
                    }
                    DOM.querySelector('#list_serie').appendChild(li)
                }

                // Ajout d'une série
                if (localStorage.getItem('token') !== null) {
                    DOM.querySelector('#save_serie').addEventListener("click", function () {
                        api('save',
                            'serie',
                            {
                                'title': document.querySelector('#title_serie').value,
                                'slug': document.querySelector('#title_serie').value
                            },
                            {},
                            'slug'
                        )
                    })
                } else {
                    DOM.querySelector('#form_serie').remove()
                }
            }
        }

        document.querySelector('#page_content').innerHTML = ''
        document.querySelector('#page_content').appendChild(DOM)
    }
}