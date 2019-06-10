var saveEdit

/**
 * Récupération du DOM et des données d'une page HTML
 * Enregistrement de la page courante dans localStorage
 * 
 * @param {string} url Url du WS
 * @param {array} page [pageHTML, pageJS] // TODO : A revoir
 * @param {string} method 
 * @param {objet} data { 'id': 1 }
 */
const getDataHTML = async function (url, page, method = 'GET', data = {}) {
    let json_data = await promise(url, method, data)
    let dom = await getDOM(page)

    return [dom, JSON.parse(json_data)]
}

/**
 * Menu accueil
 */
const loadAccueil = async function () {
    history.pushState({ page: 'home' }, 'home', base)
    document.querySelector('#page').innerHTML = 'Accueil'
    //document.querySelector('#page').appendChild(DOM)
    //clearInterval(saveEdit)
    /*let [DOM, data] = await getDataHTML('loadTemplate.php', ['accueil'])

    if (data !== false) {
        DOM.querySelector('ul').innerHTML = ''
        for (var key in data) {
            if (data[key].type == 'article') {
                let article = data[key]
                let a = document.createElement('a')
                a.id = 'article_' + article.id
                a.setAttribute('class', 'link article')
                a.innerHTML = article.title
                a.addEventListener("click", function (e) { loadArticle(e.target.id.substr(8)) })
                DOM.querySelector('ul').appendChild(a)
            }
        }
    }

    document.querySelectorAll('.article').forEach(link => {
        link.style.background = 'initial'
        link.style.boxShadow = 'none'
    })

    document.querySelector('#page').innerHTML = ''
    document.querySelector('#page').appendChild(DOM)

    document.querySelectorAll('.article').forEach(a => {
        a.addEventListener("click", function () { loadArticle(a.id.substr(8)) })
    })

    // Reset css menu
    document.querySelectorAll('.article').forEach(link => {
        link.style.background = 'initial'
        link.style.boxShadow = 'none'
    })
    document.querySelectorAll('.page').forEach(link => {
        link.style.color = '#ccc'
    })*/
}

/**
 * Menu article
 * 
 * @param {string} slug 
 */
const loadArticle = async function () {
    var slug = new URL(document.location.href).searchParams.get('article');

    clearInterval(saveEdit)
    let [DOM, data] = await getDataHTML('index.php', 'article.html', 'POST', { 'find': 'page', 'where': JSON.stringify({ 'slug': slug }), 'token': localStorage.getItem('token') })

    // Chargement du contenu de la page
    if (data !== false) {

        if (data[0] != null) {
            var article = data[0]
            let h1 = document.createElement('h1')
            h1.innerHTML = article.title

            // Vérification du droit d'édition
            if (article.edit !== false) {
                let modif = document.createElement('span')
                modif.setAttribute('class', 'link edit')
                modif.innerHTML = "modifier l'article"
                modif.addEventListener("click", function (e) {
                    history.pushState({ page: 'edit' }, 'edit', base + 'index.html?edit=' + article.slug)
                    loadEdit()
                })
                h1.appendChild(modif)
            }

            DOM.querySelector('#bloc_article').appendChild(h1)

            // Modification des balises du wiziwig
            let div = document.createElement('div')
            let content = article.content
            var pos = content.indexOf("<BLOC_CODE>");
            while (pos > -1) {
                let openPosition = pos + 11
                let closePosition = content.indexOf("</BLOC_CODE>");
                content = content.substring(0, openPosition).replace('<BLOC_CODE>', '<code>') +
                    '<div class="code"><pre>' + content.substring(openPosition, closePosition).replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre></div>' +
                    content.substring(closePosition, content.length).replace('</BLOC_CODE>', '</code>')

                pos = content.indexOf("<BLOC_CODE>", pos + 1);
            }
            div.innerHTML = content
            DOM.querySelector('#bloc_article').appendChild(div)

            // Chargement du DOM
            document.querySelector('#page').innerHTML = ''
            document.querySelector('#page').appendChild(DOM)

            // Chargement du css
            if (document.querySelector('#editCSS') != null) {
                document.querySelector('#editCSS').remove()
            }
            if (document.querySelector('#articleCSS') == null) {
                let link = document.createElement('link')
                link.rel = 'stylesheet'
                link.href = 'css/article.css'
                link.id = 'articleCSS'
                document.head.appendChild(link)
            }

            // Modification du style du menu selectionné
            document.querySelectorAll('.article').forEach(link => {
                link.style.background = 'initial'
                link.style.boxShadow = 'none'
            })
            document.querySelectorAll('.page').forEach(link => {
                link.style.color = '#ccc'
            })
            if (article.type == 'article') {
                document.querySelector("[href='index.html?article=" + article.slug + "']").style.background = '#fff'
                document.querySelector("[href='index.html?article=" + article.slug + "']").style.boxShadow = '0px 0px 5px #888, 0px 0px 5px #aaa'
            } else {
                document.querySelector("[href='index.html?article=" + article.slug + "']").style.color = '#fff'
            }
        } else {
            document.querySelector('#page').innerHTML = "L'article n'existe pas ou vous n'avez pas les bons droits."
        }
    } else {
        document.querySelector('#page').innerHTML = "Une erreur est survenue au chargement de l'article."
    }
}

/**
 * Menu edit
 * 
 * @param {string} slug 
 */
const loadEdit = async function () {
    if (localStorage.getItem('token') !== null) {
        var slug = new URL(document.location.href).searchParams.get('edit');

        // Chargement du JS
        if (document.querySelector('#editJS') == null) {
            let imported = document.createElement('script')
            imported.src = './js/edit.js'
            imported.charset = 'utf-8'
            imported.id = 'editJS'
            await document.querySelector('body').appendChild(imported)
        }

        if (slug != 'new') {
            var [DOM, data] = await getDataHTML('index.php', 'edit.html', 'POST', { 'find': 'page', 'where': JSON.stringify({ 'slug': slug }), 'token': localStorage.getItem('token') })
        } else {
            var DOM = await getDOM('edit.html')
        }

        // Chargement du contenu de la page
        if (data !== undefined && data !== false) { // Aucune erreur

            if (data[0] != null) { // L'article existe
                var article = data[0]

                if (article.edit !== false) { // Vérification du droit d'édition

                    // Chargement
                    DOM.querySelector('#title').setAttribute('value', article.title)
                    DOM.querySelector('#article').innerHTML = article.content

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
                    document.querySelector('#page').innerHTML = "Vous n'avez pas les bons droits."
                }
            } else {
                document.querySelector('#page').innerHTML = "L'article n'existe pas ou vous n'avez pas les bons droits."
            }
        } else if (slug != 'new') {
            document.querySelector('#page').innerHTML = "Une erreur est survenue au chargement de l'article."
        }

        // event Prévisualisation
        DOM.querySelector('#prev_button').addEventListener("click", function () {
            if (DOM.querySelector('#prev').style.display == 'none') {
                DOM.querySelector('#bloc_article').style.height = 'calc(100vh - 230px - 40vh)'
                DOM.querySelector('#prev').style.display = null
            } else {
                DOM.querySelector('#bloc_article').style.height = 'calc(100vh - 220px)'
                DOM.querySelector('#prev').style.display = 'none'
            }
        })

        // event Wiziwig
        DOM.querySelectorAll('.wiziwig').forEach(w => {
            w.addEventListener("click", wiziwig)
        })

        // event Sauvegarde
        if (slug != 'new') {
            DOM.querySelector('#save_article').addEventListener("click", function () {
                updateArticle(true)
            })
            DOM.querySelector('#article').addEventListener("keyup", function () {
                setPrevisu()
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
        if (document.querySelector('#page') != null) {
            document.querySelector('#page').innerHTML = ''
            document.querySelector('#page').appendChild(DOM)
        }

        // Chargement du css
        if (document.querySelector('#articleCSS') != null) {
            document.querySelector('#articleCSS').remove()
        }
        let link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'css/edit.css'
        link.id = 'editCSS'
        document.head.appendChild(link)

        setPrevisu()
    } else {
        loadAccueil()
    }
}