var saveEdit

var edit = function () {
    this.load = async function () {
        if (localStorage.getItem('token') !== null) {
            var slug = new URL(document.location.href).searchParams.get('edit')
            var DOM = await promise('page/edit/edit.html')
            if (slug !== '') {
                let data = await promise('api.php', 'POST', {
                    'find': 'page',
                    'where': {
                        'slug': slug
                    }
                })

                if (data !== undefined && data.error === 0) {
                    if (data.list != null) {
                        var article = data.list[0]
                        if (article.own === true) {
                            DOM.querySelector('#title').setAttribute('value', article.title)
                            DOM.querySelector('#type').value = article.type
                            DOM.querySelector('#article').innerHTML = article.content
                        } else {
                            alerte(error_messages.edit_article_not_allowed, 'ko', 10)
                        }
                    } else {
                        alerte(error_messages.load_article_not_found, 'ko', 10)
                    }

                    // event Suppression
                    let suppr = document.createElement('span')
                    suppr.setAttribute('class', 'button delete')
                    suppr.innerHTML = "supprimer l'article"
                    suppr.addEventListener("click", function () {
                        if (confirm("Voulez-vous vraiment supprimer l'article ?")) {
                            deleteArticle()
                        }
                    })
                    DOM.appendChild(suppr)
                } else {
                    document.querySelector('#alerte').innerHTML = "L'article n'existe pas."
                    document.querySelector('#content').innerHTML = ""
                }
            }

            // event Sauvegarde
            if (slug != '') {
                DOM.querySelector('#save_article').addEventListener("click", function () {
                    updateArticle(true)
                })
            } else {
                DOM.querySelector('#save_article').innerHTML = "Créer l'article"
                DOM.querySelector('#save_article').addEventListener("click", function () {
                    saveArticle()
                })
            }

            // Chargement du DOM
            document.querySelector('#content').innerHTML = ''
            document.querySelector('#content').appendChild(DOM)

            //setPrevisu()
        } else {
            load('search')
        }
    }

    const deleteArticle = async function () {
        var slug = new URL(document.location.href).searchParams.get('edit')

        let data = await promise('api.php', 'POST', {
            'delete': 'page',
            'where': {
                'slug': slug,
            }
        })

        clearInterval(saveEdit)
        if (data.error === 0) {
            alerte("L'article a été supprimé de manière définitive.") // TODO : on recharge forcement la page, il faudrai revoir le système d'alerte pour ce genre de cas
            load('search')
        }
    }

    const updateArticle = async function (reload) {
        var slug = new URL(document.location.href).searchParams.get('edit')

        var error = ''
        let title = document.querySelector('#title').value
        if (title === '') {
            error = error_messages.save_article_title_required
        }
        let content = document.querySelector('#article').value
        if (content === '') {
            error = error_messages.save_article_content_required
        }
        if (error === '') {
            let data = await promise('api.php', 'POST', {
                'save': 'page',
                'values': {
                    'title': title,
                    'content': content,
                    'type': document.querySelector('#type').value
                }, 'where': {
                    'slug': slug,
                }
            })

            clearInterval(saveEdit)
            saveEdit = null
            if (data.error === 0) {
                if (reload) {
                    history.pushState({ page: 'edit' }, 'edit', 'index.html?edit=' + data.slug)
                    load('menu', [], 'plugin', false, true)
                }
                alerte(error_messages.update_article_valide, 'ok', 1)
            }
        } else {
            alerte(error, 'ko')
        }
    }

    const saveArticle = async function () {

        var error = ''
        let title = document.querySelector('#title').value
        if (title === '') {
            error = error_messages.save_article_title_required
        }
        let content = document.querySelector('#article').value
        if (content === '') {
            error = error_messages.save_article_content_required
        }
        if (error === '') {
            let data = await promise('api.php', 'POST', {
                'save': 'page',
                'values': {
                    'title': document.querySelector('#title').value,
                    'slug': document.querySelector('#title').value,
                    'content': document.querySelector('#article').value,
                    'type': document.querySelector('#type').value
                }
            })

            if (data.error === 0) {
                load('menu', [], 'plugin')
                load('edit', [], 'page', 'index.html?edit=' + data.slug)
                alerte(error_messages.save_article_valide, 'ok', 1)
            }
        } else {
            alerte(error, 'ko')
        }
    }
}