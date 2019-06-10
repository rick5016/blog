var base = '/blog/'
//var base = '/'
/**
 * Récupération des données
 * 
 * @param {string*} url 
 * @param {string} method 
 * @param {abjet} data 
 * @param {formElement} formElement 
 */
const promise = async function (url, method = 'GET', data = {}, formElement = null) {

    let args = {}
    if (method == 'POST') {
        if (formElement !== null) {
            var form = new FormData(formElement);
        } else {
            var form = new FormData();
        }
        for (var key in data) {
            form.append(key, data[key])
        }
        args = { method: method, body: form }
    }

    return await fetch('http://' + new URL(document.location.href).hostname + '/blog_api/' + url, args).then(response => response.text()).catch(error => console.error(error))
}

/**
 * Récupération du DOM d'une page HTML
 * 
 * @param {string} fileName 
 */
const getDOM = async function (fileName) {
    // HTML
    const dom = await fetch('./html/' + fileName).then(response => response.text())
    var wrapper = document.createElement('div')
    wrapper.innerHTML = dom
    return wrapper.firstChild
}

/**
 * Initialisation des données du template
 */
const loadTemplate = async function () {
    let DOM = await getDOM('template.html')

    let div = document.createElement('div')
    let a = document.createElement('a')

    // icône accueil
    div.setAttribute('class', 'link icon accueil')
    a.addEventListener("click", function (e) {
        e.preventDefault()
        history.pushState({ page: 'home' }, 'home', base)
        loadAccueil()
    })
    div.appendChild(a)
    DOM.querySelector('#icons').appendChild(div)

    if (localStorage.getItem('token') !== null) {
        // Bouton déco si logué
        let span = document.createElement('span')
        span.innerHTML = 'Déconnexion'
        span.addEventListener("click", deco)
        DOM.querySelector('#bloc_login').innerHTML = ''
        DOM.querySelector('#bloc_login').appendChild(span)

        // Bouton add si logué
        let div = document.createElement('div')
        div.setAttribute('class', 'link icon add')
        div.addEventListener("click", function () {
            history.pushState({ page: 'edit' }, 'edit', base + 'index.html?edit=new')
            loadEdit('new')
        })
        DOM.querySelector('#icons').appendChild(div)
    } else {
        // inscription / login
        if (DOM.querySelector('#inscription') != null && DOM.querySelector('#connexion') != null) {
            DOM.querySelector('#inscription').addEventListener("click", inscription)
            DOM.querySelector('#connexion').addEventListener("click", connexion)
        }

    }
    document.querySelector('body').appendChild(DOM)

    // Gestion des menus
    let json_data = await promise('index.php', 'POST', { 'find': 'page' })
    loadMenus('all', JSON.parse(json_data))

}

/**
 * Met à jour l'une des deux barres de menu (ou les deux)
 */
const loadMenus = async function (type = 'page', data = null) {

    if (data == null && (type == 'page' || type == 'article')) {
        let json_data = await promise('index.php', 'POST', { 'find': 'page', 'where': JSON.stringify({ 'type': type }) })
        var data = JSON.parse(json_data)
    }

    if (data !== false) {
        // Clear menu
        if (type == 'page') {
            document.querySelector('#pages').innerHTML = ''
        } else if (type == 'article') {
            document.querySelector('#list_article').innerHTML = ''
        } else {
            document.querySelector('#pages').innerHTML = ''
            document.querySelector('#list_article').innerHTML = ''
        }

        // Load menu
        for (var key in data) {
            let article = data[key]
            let li = document.createElement('li')
            let a = document.createElement('a')

            a.href = 'index.html?article=' + article.slug
            a.innerHTML = article.title
            a.addEventListener("click", function (e) {
                e.preventDefault()
                history.pushState({ page: 'article' }, 'article', base + 'index.html?article=' + article.slug)
                loadArticle()
            })

            // Article
            if (article.type == 'article') {
                a.setAttribute('class', 'link article')
                li.appendChild(a)
                document.querySelector('#list_article').appendChild(li)
            }

            // Lien fixe
            if (article.type == 'page') {
                a.setAttribute('class', 'link page item')
                li.appendChild(a)
                document.querySelector('#pages').appendChild(li)
            }
        }
    }
}

const inscription = async function () {
    let login = document.querySelector('#login').value
    let password = document.querySelector('#password').value
    if (login != '' && password != '') {
        let data = await promise('inscription.php', 'POST', { 'login': login, 'password': password })
        if (data !== false) {
            connexion()
        }
    }
}

const connexion = async function () {
    let login = document.querySelector('#login').value
    let password = document.querySelector('#password').value
    if (login != '' && password != '') {
        let data = JSON.parse(await promise('login.php', 'POST', { 'login': login, 'password': password }))

        if (data !== false && data.token != '') {
            localStorage.setItem('token', data.token);
            document.querySelector('#bloc_login').innerHTML = login
            document.location.reload(true);
        }
    }
}

const deco = function () {
    if (localStorage.getItem('token') !== null) {
        localStorage.removeItem('token')
        document.location.reload(true);
    }
}

const init = async function () {
    await loadTemplate()

    let url = new URL(document.location.href)
    if (url.searchParams.has('edit')) {
        loadEdit()
    } else if (url.searchParams.has('article')) {
        loadArticle()
    } else {
        loadAccueil()
    }
}

init()

/**
 * Gestion de l'historique du navigateur
 */
window.onpopstate = function (e) {
    if (e.state.page == 'edit') {
        editArticle()
    } else if (e.state.page == 'article') {
        loadArticle()
    } else {
        loadAccueil()
    }
}