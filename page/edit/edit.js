var saveEdit

var edit = function () {
    this.load = async function () {
        if (localStorage.getItem('token') !== null) {
            var slug = new URL(document.location.href).searchParams.get('edit')
            var DOM = await promise('page/edit/edit.html')
            if (slug !== '') {
                let data = await promise('index.php', 'POST', {
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
                    suppr.setAttribute('class', 'link delete')
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

            // event Prévisualisation : TODO : A revoir
            /*DOM.querySelector('#prev_button').addEventListener("click", function () {
                if (DOM.querySelector('#prev').style.display == 'none') {
                    DOM.querySelector('#bloc_article').style.height = 'calc(100vh - 230px - 40vh)'
                    DOM.querySelector('#prev').style.display = null
                } else {
                    DOM.querySelector('#bloc_article').style.height = 'calc(100vh - 220px)'
                    DOM.querySelector('#prev').style.display = 'none'
                }
            })*/

            // event Wiziwig
            DOM.querySelectorAll('.wiziwig').forEach(w => {
                w.addEventListener("click", wiziwig)
            })

            // event Sauvegarde
            if (slug != '') {
                DOM.querySelector('#save_article').addEventListener("click", function () {
                    updateArticle(true)
                })
                DOM.querySelector('#article').addEventListener("keyup", function () {
                    //setPrevisu()
                    if (saveEdit == null) {
                        saveEdit = setInterval(function () { updateArticle() }, 5000)
                    }
                })
                DOM.querySelector('#title').addEventListener("keyup", function () {
                    if (saveEdit == null) {
                        saveEdit = setInterval(function () { updateArticle(true) }, 5000)
                    }
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
            load('accueil')
        }
    }

    const wiziwig = function (e) {
        e.preventDefault()
        var id = e.target.id

        if (id.substr(0, 2) == 'w1' || id.substr(0, 2) == 'w2') {

            var txtarea = document.getElementById("article")
            var start = txtarea.selectionStart
            var finish = txtarea.selectionEnd
            var allText = txtarea.value
            var selection = allText.substring(start, finish)

            var markdown = id.substr(3, 10)
            if (markdown.substr(0, 2) === 'lo') {
                markdown = ' '.repeat(markdown.charAt(2)) + '1. '
            } else if (markdown.substr(0, 4) === 'link') {
                if (selection == '') {
                    selection = 'link text'
                }
                var markdown = '[' + selection + '](http:// "link title")'
                selection = ''
            } else if (markdown.substr(0, 3) === 'img') {
                if (selection == '') {
                    selection = 'Alt text'
                }
                var markdown = '![' + selection + '](http:// "Image title")'
                selection = ''
            } else if (markdown.substr(0, 2) === 'bq') {
                markdown = '>'.repeat(markdown.charAt(2)) + ' '
            } else if (markdown.charAt(0) === 'h') {
                markdown = '#'.repeat(markdown.charAt(1)) + ' '
            } else if (markdown.charAt(0) === '-') {
                markdown = "---\n"
            } else if (markdown.charAt(0) === 'n') {
                markdown = "\n\n"
            } else if (markdown.charAt(0) === 'l') {
                markdown = ' '.repeat(markdown.charAt(1)) + '+ '
            } else if (markdown.charAt(0) === 't') {
                markdown = '\n| Value | Option (Right aligned) | Description (center)|\n'
                markdown += '| ----- | -----:| :----------:|\n'
                markdown += '| data   | 1 | Lorem ipsum dolor sit amet |\n'
                markdown += '| engine | 3 | Consectetur adipiscing elit |\n'
                markdown += '| ext    | 2 | Integer molestie lorem at massa |\n'
            }

            if (id.substr(0, 2) == 'w1') {
                var setTextMarkdown = markdown + selection
            } else {
                var setTextMarkdown = selection + markdown
            }

            var newText = allText.substring(0, start) + setTextMarkdown + allText.substring(finish, allText.length)

            txtarea.value = newText
        } else {

            var txtarea = document.getElementById("article")
            var start = txtarea.selectionStart
            var finish = txtarea.selectionEnd
            var allText = txtarea.value

            var selection = allText.substring(start, finish)

            var markdown = id.substr(3, 10)
            if (markdown.substr(0, 2) === 'bc') {
                var markdown = '```\n'
                var markdown2 = '\n```'
            } else if (markdown.charAt(0) === 'b') {
                var markdown = '**'
            } else if (markdown.charAt(0) === 'i') {
                var markdown = '__'
            } else if (markdown.charAt(0) === 's') {
                var markdown = '~~'
            } else if (markdown.charAt(0) === 'c') {
                var markdown = '`'
            }

            if (markdown2 === undefined) {
                var markdown2 = markdown
            }
            var newText = allText.substring(0, start) + markdown + selection + markdown2 + allText.substring(finish, allText.length)

            txtarea.value = newText
        }
        //setPrevisu()
    }

    /*const setPrevisu = function () {
        let content = document.querySelector('#article').value
    
        var pos = content.indexOf("<BLOC_CODE>")
        while (pos > -1) {
            let openPosition = pos + 11
            let closePosition = content.indexOf("</BLOC_CODE>")
            content = content.substring(0, openPosition).replace('<BLOC_CODE>', '<code>') +
                '<div class="code"><pre>' + content.substring(openPosition, closePosition).replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre></div>' +
                content.substring(closePosition, content.length).replace('</BLOC_CODE>', '</code>')
    
            pos = content.indexOf("<BLOC_CODE>", pos + 1)
        }
    
        document.querySelector('#prev').innerHTML = content
    }*/

    const deleteArticle = async function () {
        var slug = new URL(document.location.href).searchParams.get('edit')
        document.querySelector('#loader').style.display = null

        let data = await promise('index.php', 'POST', {
            'delete': 'page',
            'where': {
                'slug': slug,
            }
        })

        clearInterval(saveEdit)
        document.querySelector('#loader').style.display = 'none'
        if (data.error === 0) {
            alerte("L'article a été supprimé de manière définitive.") // TODO : on recharge forcement la page, il faudrai revoir le système d'alerte pour ce genre de cas
            load('accueil')
        }
    }

    const updateArticle = async function (reload) {
        var slug = new URL(document.location.href).searchParams.get('edit')
        document.querySelector('#loader').style.display = null

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
            let data = await promise('index.php', 'POST', {
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
                document.querySelector('#loader').style.display = 'none'
            }
        } else {
            document.querySelector('#loader').style.display = 'none'
            alerte(error, 'ko')
        }
    }

    const saveArticle = async function () {
        document.querySelector('#loader').style.display = null

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
            let data = await promise('index.php', 'POST', {
                'save': 'page',
                'values': {
                    'title': document.querySelector('#title').value,
                    'slug': document.querySelector('#title').value,
                    'content': document.querySelector('#article').value,
                    'type': document.querySelector('#type').value
                }
            })

            if (data.error === 0) {

                //loadMenus(data.type)
                load('menu', [], 'plugin')
                load('edit', [], 'page', 'index.html?edit=' + data.slug)
                //loadContent('edit', base + 'index.html?edit=' + data.slug)
                alerte(error_messages.save_article_valide, 'ok', 1)
                document.querySelector('#loader').style.display = 'none'
            }
        } else {
            document.querySelector('#loader').style.display = 'none'
            alerte(error, 'ko')
        }
    }
}