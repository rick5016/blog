//var api_url = 'http://rick5016.net/blog_api/'
var api_url = 'http://127.0.0.1/blog_api/'

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

    return await fetch(api_url + url, args).then(response => response.text()).catch(error => console.error(error))
}

/**
 * Récupération du DOM d'une page HTML
 * 
 * @param {string} fileName 
 */
const getDOM = async function (fileName) {
    // HTML
    const dom = await fetch('./html/' + fileName[0] + '.html').then(response => response.text())
    var wrapper = document.createElement('div')
    wrapper.innerHTML = dom
    return wrapper.firstChild
}

const deco = function () {
    if (localStorage.getItem('token') !== null) {
        localStorage.removeItem('token')
        document.location.reload(true);
    }
}

/**
 * Initialisation des données du template
 */
const loadTemplate = async function () {
    let [DOM, data] = await getDataHTML('loadTemplate.php', ['template'])

    if (data !== false) {
        let div = document.createElement('div')
        div.setAttribute('class', 'link icon accueil')
        div.addEventListener("click", loadAccueil)
        DOM.querySelector('#icons').appendChild(div)
        if (localStorage.getItem('token') !== null) {
            let span = document.createElement('span')
            span.innerHTML = 'Déconnexion'
            span.addEventListener("click", deco )
            DOM.querySelector('#bloc_login').innerHTML = ''
            DOM.querySelector('#bloc_login').appendChild(span)
            let div = document.createElement('div')
            div.setAttribute('class', 'link icon add')
            div.addEventListener("click", function () { loadEdit('new') })
            DOM.querySelector('#icons').appendChild(div)
        }

        // Articles
        for (var key in data) {
            if (data[key].type == 'article') {
                let article = data[key]
                let li = document.createElement('li')
                li.id = 'article_' + article.id
                li.setAttribute('class', 'link article')
                li.innerHTML = article.title
                li.addEventListener("click", function (e) { loadArticle(e.target.id.substr(8)) })
                DOM.querySelector('#list_article').appendChild(li)
            }
        }

        // Pages fixes
        for (var key in data) {
            if (data[key].type == 'page') {
                let page = data[key]
                let li = document.createElement('li')
                li.id = 'article_' + page.id
                li.setAttribute('class', 'link page item')
                li.innerHTML = page.title
                li.addEventListener("click", function (e) { loadArticle(e.target.id.substr(8)) })
                DOM.querySelector('#pages').appendChild(li)
            }
        }
    }
    document.querySelector('body').appendChild(DOM)

    // inscription / login
    if (document.querySelector('#inscription') != null && document.querySelector('#connexion') != null) {
        document.querySelector('#inscription').addEventListener("click", inscription)
        document.querySelector('#connexion').addEventListener("click", connexion)
    }
}

/**
 * Initialisation des données du template
 */
const updateTemplate = async function () {

    let data = await promise('loadTemplate.php', 'POST', { 'token': localStorage.getItem('token') })

    if (data !== false) {
        data = JSON.parse(data)
        document.querySelector('#icons').innerHTML = ''
        let div = document.createElement('div')
        div.setAttribute('class', 'link icon accueil')
        div.addEventListener("click", loadAccueil)
        document.querySelector('#icons').appendChild(div)
        if (localStorage.getItem('token') !== null) {
            let div = document.createElement('div')
            div.setAttribute('class', 'link icon add')
            div.addEventListener("click", function () { loadEdit('new') })
            document.querySelector('#icons').appendChild(div)
        }

        // Articles
        document.querySelector('#list_article').innerHTML = ''
        for (var key in data) {
            if (data[key].type == 'article') {
                let article = data[key]
                let li = document.createElement('li')
                li.id = 'article_' + article.id
                li.setAttribute('class', 'link article')
                li.innerHTML = article.title
                li.addEventListener("click", function (e) { loadArticle(e.target.id.substr(8)) })
                document.querySelector('#list_article').appendChild(li)
            }
        }

        // Pages fixes
        document.querySelector('#pages').innerHTML = ''
        for (var key in data) {
            if (data[key].type == 'page') {
                let page = data[key]
                let li = document.createElement('li')
                li.id = 'article_' + page.id
                li.setAttribute('class', 'link page item')
                li.innerHTML = page.title
                li.addEventListener("click", function (e) { loadArticle(e.target.id.substr(8)) })
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

const init = async function () {
    loadTemplate()

    // Récupération de la page courante sinon load accueil
    let page = localStorage.getItem('page');
    if (page == 'article' && localStorage.getItem('data') !== null) { // article
        loadMenu('article', (JSON.parse(localStorage.getItem('data'))))
    }
    if (page == 'edit' && localStorage.getItem('data') !== null) { // edit
        loadMenu('edit', JSON.parse(localStorage.getItem('data')))
    } else {
        loadMenu('accueil');
    }
}

init()




