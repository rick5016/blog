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

    localStorage.setItem('page', page[0]);
    localStorage.setItem('data', JSON.stringify(data));

    return [dom, JSON.parse(json_data)]
}

/**
 * Chargement d"un menu
 * 
 * @param {string} menuName 
 * @param {JSon} data 
 */
const loadMenu = function (menuName, data = null) {

    if (menuName == 'accueil') {
        loadAccueil()
    } else if (menuName == 'article') {
        loadArticle(data.id)
    } else if (menuName == 'edit') {
        loadEdit(data.id)
    }
}

/**
 * Menu accueil
 */
const loadAccueil = async function () {
    //clearInterval(saveEdit)
    let [DOM, data] = await getDataHTML('loadTemplate.php', ['accueil'])

    if (data !== false) {
        DOM.querySelector('ul').innerHTML = ''
        for (var key in data) {
            if (data[key].type == 'article') {
                let article = data[key]
                let li = document.createElement('li')
                li.id = 'article_' + article.id
                li.setAttribute('class', 'link article')
                li.innerHTML = article.title
                li.addEventListener("click", function (e) { loadArticle(e.target.id.substr(8)) })
                DOM.querySelector('ul').appendChild(li)
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
    })
}

/**
 * Menu article
 * 
 * @param {int} id 
 */
const loadArticle = async function (id) {
    clearInterval(saveEdit)
    let [DOM, data] = await getDataHTML('article.php', ['article'], 'POST', { 'id': id, 'token': localStorage.getItem('token') })

    // Chargement du contenu de la page
    if (data !== false) {
        var article = data.article
        let h1 = document.createElement('h1')
        h1.innerHTML = article.title

        // Vérification du droit d'édition
        if (data.edit !== false) {
            // Modifier
            let modif = document.createElement('span')
            modif.id = 'article_' + article.id
            modif.setAttribute('class', 'link edit')
            modif.innerHTML = "modifier l'article"
            modif.addEventListener("click", function (e) { loadEdit(e.target.id.substr(8)) })
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
    }

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
        document.querySelector('#article_' + id).style.background = '#fff'
        document.querySelector('#article_' + id).style.boxShadow = '0px 0px 5px #888, 0px 0px 5px #aaa'
    } else {
        document.querySelector('#article_' + id).style.color = '#fff'
    }
}

/**
 * Menu edit
 * 
 * @param {int} id 
 */
const loadEdit = async function (id) {
    // Chargement du JS
    if (document.querySelector('#editJS') == null) {
        let imported = document.createElement('script')
        imported.src = './js/edit.js'
        imported.charset = 'utf-8'
        imported.id = 'editJS'
        await document.querySelector('body').appendChild(imported)
    }
    let [DOM, article] = await getDataHTML('edit.php', ['edit', 'edit'], 'POST', { 'id': id, 'token': localStorage.getItem('token') })

    if (article !== false) {
        // Chargement
        DOM.querySelector('#title').setAttribute('value', article.title)
        DOM.querySelector('#article').innerHTML = article.content

        // Suppression
        let suppr = document.createElement('span')
        suppr.id = 'article_' + article.id
        suppr.setAttribute('class', 'link delete')
        suppr.innerHTML = "supprimer l'article"
        suppr.addEventListener("click", function (e) {
            if (confirm("Voulez-vous vraiment supprimer l'article ?")) {
                deleteArticle(e.target.id.substr(8))
            }
        })
        DOM.appendChild(suppr)

        // Prévisualisation
        DOM.querySelector('#prev_button').addEventListener("click", function () {
            if (DOM.querySelector('#prev').style.display == 'none') {
                DOM.querySelector('#bloc_article').style.height = 'calc(100vh - 230px - 40vh)'
                DOM.querySelector('#prev').style.display = null
            } else {
                DOM.querySelector('#bloc_article').style.height = 'calc(100vh - 220px)'
                DOM.querySelector('#prev').style.display = 'none'
            }
        })

        // Wiziwig
        DOM.querySelectorAll('.wiziwig').forEach(w => {
            w.addEventListener("click", wiziwig)
        })
    }

    // Sauvegarde
    if (id != 'new') {
        DOM.querySelector('#save_article').addEventListener("click", function () {
            updateArticle(id, true)
        })
        DOM.querySelector('#article').addEventListener("keyup", function () {
            setPrevisu()
            if (saveEdit == null) {
                saveEdit = setInterval(function () { updateArticle(id) }, 5000)
            }
        })
        DOM.querySelector('#title').addEventListener("keyup", function () {
            if (saveEdit == null) {
                saveEdit = setInterval(function () { updateArticle(id, true) }, 5000)
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
}