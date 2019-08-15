//var base = '/blog/'
var base = '/'
var intervalToken, intervalAlert
var connexion_increment = 0
var connexion_duration_sec = 60 * 60

const DEBUG_PROD = false
var debug = (window.location.hostname === '127.0.0.1') ? true : (DEBUG_PROD ? true : false)
var menus = ['accueil', 'article', 'edit', 'serie']

var error_messages = {
    'api_failed': 'Une erreur est survenue.',
    'connexion_timout': 'Inactivité detectée, vous allez être déconnecté dans %s secondes.',
    'load_article_not_found': "L'article demandé est introuvable.",
    'edit_article_not_allowed': "Vous ne pouvez pas modifier cet article.",
    'save_article_valide': "L’article a été enregistré.",
    'save_article_title_required': 'Le titre de l’article est obligatoire.',
    'save_article_content_required': 'Le contenu de l’article est obligatoire.',
    'update_article_valide': "L’article a été mis à jour.",
}
/**
 * Récupération des données + gestion du token de connexion
 * 
 * @param {string} url 
 * @param {string} method 
 * @param {abjet} data
 */
const promise = async function (url, method = 'GET', data = {}) {

    // Cache l'alerte
    /*document.querySelector('#alerte').removeAttribute('class')
    document.querySelector('#alerte').innerHTML = ''
    clearTimeout(intervalAlert)*/

    /*var myHeaders = new Headers();
    if (localStorage.getItem('token')) {
        myHeaders.append("Authorization", 'Bearer ' + localStorage.getItem('token'));
    }*/
    let args = {}
    if (method == 'POST') {
        var form = new FormData()
        form.append('token', localStorage.getItem('token'))

        for (var key in data) {
            if (typeof data[key] === 'object') {
                for (var arrayKey in data[key]) {
                    form.append(key + '[' + arrayKey + ']', data[key][arrayKey])
                }
            } else {
                form.append(key, data[key])
            }
        }
        args = { method: method, body: form/*, headers: myHeaders, credentials: 'include'*/ }
    }

    let result = await fetch('http://' + new URL(document.location.href).hostname + '/api_rest/' + url, args).then(response => response.text()).catch(error => console.error(error))

    if (result !== undefined) {
        try {
            result = JSON.parse(result)
            if (result.error !== 0) {
                alerte(result.error, 'ko', 10)
            } else if (result.token != null && result.token != '') {
                if (localStorage.hasOwnProperty('token') === false) {
                    // Connexion
                    localStorage.setItem('token', result.token)
                    document.location.reload(true)
                } else {
                    // Regénération du token
                    localStorage.setItem('token', result.token)
                    clearInterval(intervalToken)
                    connexion_increment = 0
                    intervalToken = setInterval(function () { remainingTime() }, 1000)
                }
            } else if (localStorage.getItem('token') != null) {
                // L'api n'a pas renvoyé de nouveau token alors que nous sommes connecté
                alerte(error_messages.api_failed, 'ko', 10)
            }
        } catch (error) {
            result.error = error_messages.api_failed
            document.querySelector('#page_content').innerHTML = ''
            if (debug) {
                alerte(error + result, 'ko', 100)
            } else {
                alerte(error_messages.api_failed, 'ko', 10)
            }
        }

        return result
    } else {
        alerte(error_messages.api_failed, 'ko', 10)
    }
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
 * Récupération du DOM et des données d'une page HTML
 * 
 * @param {string} url Url du WS
 * @param {string} page fileName.html
 * @param {string} method GET/POST
 * @param {objet} data { 'id': 1 }
 */
const getDataHTML = async function (url, page, method = 'GET', params = {}) {
    let data = await promise(url, method, params)
    let dom = await getDOM(page)

    return [dom, data]
}

/**
 * Initialisation du template
 * 
 * @param {string} menu nom du js à charger
 */
const loadTemplate = async function (menu) {

    let DOM = await getDOM('template.html')

    let div = document.createElement('div')
    let a = document.createElement('a')

    // icône accueil
    div.setAttribute('class', 'link icon accueil')
    a.addEventListener("click", function (e) {
        e.preventDefault()
        history.pushState({ page: 'home' }, 'home', base)
        loadContent('accueil', base)
    })
    div.appendChild(a)
    DOM.querySelector('#icons').appendChild(div)

    if (localStorage.getItem('token') !== null) {
        // Bouton déco si logué
        let span = document.createElement('span')
        span.innerHTML = 'Déconnexion'
        span.addEventListener("click", deconnexion)
        DOM.querySelector('#bloc_login').innerHTML = ''
        DOM.querySelector('#bloc_login').appendChild(span)

        // Bouton add article si logué
        let div = document.createElement('div')
        div.setAttribute('class', 'link icon add')
        div.addEventListener("click", function (e) {
            e.preventDefault()
            loadContent('edit', base + 'index.html?edit=')
        })
        DOM.querySelector('#icons').appendChild(div)
    } else {
        // formulaire inscription / login si pas logué
        if (DOM.querySelector('#inscription') != null && DOM.querySelector('#connexion') != null) {
            DOM.querySelector('#inscription').addEventListener("click", inscription)
            DOM.querySelector('#connexion').addEventListener("click", connexion)
        }
    }
    document.querySelector('body').appendChild(DOM)

    // Chargement du fichier JS du contenu
    addJS(menu)

    // Gestion des menus
    let data = await promise('index.php', 'POST', { 'find': 'page' })
    loadMenus('all', data)

}

/**
 * Met à jour l'une des deux barres de menu (ou les deux)
 */
const loadMenus = async function (type = 'page', data = null) {
    if (data == null && (type == 'page' || type == 'article')) {
        data = await promise('index.php', 'POST', {
            'find': 'page',
            'where': {
                'type': type
            }
        })
    }

    if (data !== false) {
        // Clear menu : TODO : ajouter le menu des séries TV autrement
        if (type == 'page') {
            document.querySelector('#pages').innerHTML = '<li><a href="index.html?serie=" class="link page item">Séries TV</a></li>'
        } else if (type == 'article') {
            document.querySelector('#list_article').innerHTML = ''
        } else {
            document.querySelector('#pages').innerHTML = '<li><a href="index.html?serie=" class="link page item">Séries TV</a></li>'
            document.querySelector('#list_article').innerHTML = ''
        }

        // Load menu
        for (var key in data.list) {
            let article = data.list[key]
            let li = document.createElement('li')
            let a = document.createElement('a')

            a.href = 'index.html?article=' + article.slug
            a.innerHTML = article.title
            a.addEventListener("click", function (e) {
                e.preventDefault()
                loadContent('article', base + 'index.html?article=' + article.slug)
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

/**
 * TODO : gestion de l'inscription
 * 
 */
const inscription = async function () {
    let login = document.querySelector('#login').value
    let password = document.querySelector('#password').value
    if (login != '' && password != '') {
        let data = await promise('index.php', 'POST', { 'login': login, 'password': password, 'inscription': true })
        if (data !== false) {
            connexion()
        }
    }
}

/**
 * Gestion de la connexion
 * 
 */
const connexion = async function () {
    let login = document.querySelector('#login').value
    let password = document.querySelector('#password').value
    if (login != '' && password != '') {
        await promise('index.php', 'POST', { 'login': login, 'password': password })
    }
}

/**
 * Gestion de la déconnexion
 * 
 * 2 Appels possible : bouton déconnexion et inactivité
 */
const deconnexion = function () {
    clearInterval(intervalToken)
    localStorage.removeItem('token')
    document.location.reload(true)
}

/**
 * Gestion de l'inactivité
 * 
 * Abouti à une déconnexion au bout de x seconde (voir param connexion_duration_sec)
 */
const remainingTime = function () {
    connexion_increment++
    if (connexion_increment > (connexion_duration_sec - (60 * 10))) {

        document.querySelector('#alerte').setAttribute('class', 'ko')
        document.querySelector('#alerte').innerHTML = 'Inactivité detectée, vous allez être déconnecté dans ' + (connexion_duration_sec - connexion_increment) + ' secondes.'
    }
    if (connexion_increment === connexion_duration_sec) {
        deconnexion();
    }
}

/**
 * Affiche une alerte (ok ou ko) pendant x temps
 * 
 * @param {string} $message 
 * @param {string : ok | ko} etat 
 * @param {int} duree 
 */
const alerte = function ($message, etat = 'ok', duree = 5) {
    document.querySelector('#alerte').setAttribute('class', etat)
    document.querySelector('#alerte').innerHTML = $message
    clearTimeout(intervalAlert)
    intervalAlert = setTimeout(function () {
        document.querySelector('#alerte').removeAttribute('class')
        document.querySelector('#alerte').innerHTML = ''

    }, duree * 1000);
}

/**
 * Ajoute un fichier JS au DOM
 * 
 * @param {string} name 
 */
const addJS = async function (name) {
    if (document.querySelector('#' + name + 'JS') == null) {
        let imported = document.createElement('script')
        imported.src = './js/' + name + '.js'
        imported.charset = 'utf-8'
        imported.id = name + 'JS'
        document.querySelector('body').appendChild(imported)
    }
}

/**
 * Ajoute un fichier CSS au DOM
 * 
 * @param {string} name 
 */
const addCSS = async function (name) {
    let link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'css/' + name + '.css'
    link.id = name + 'CSS'
    document.head.appendChild(link)

}

/**
 * event click : si le JS est le bon, alors on ne recharge pas la page
 * 
 * @param {string} name 
 * @param {string} link 
 */
const loadContent = function (name, url) {
    history.pushState({ page: name }, name, url)
    if (document.querySelector('#' + name + 'JS') == null) {
        window.location.href = url;
    }

    load()
}

/**
 * Récupère le nom du menu, s'il n'existe pas alors on renvoie : accueil
 * 
 * Si param est de type URL, alors on cherche le menu dans l'url
 * Si param est un string, alors on compare la pram aux noms de menus
 * 
 * @param {URL | string} param 
 */
const getMenu = function (param) {
    if (param instanceof URL) {
        for (var key in menus) {
            let menu = menus[key]
            if (param.searchParams.has(menu)) {
                return menu
            }
        }
    } else {
        if (menus.indexOf(param) !== -1) {
            return param
        }
    }

    return 'accueil'
}

const init = async function () {
    let url = new URL(document.location.href)
    let menu = getMenu(url)
    await loadTemplate(menu)
    loadContent(menu, url)
}

init()

/**
 * Gestion de l'historique du navigateur
 * 
 * TODO : problème pour revenir au site précédent // Le probleme semble etre à charque rechargement de page
 */
window.onpopstate = async function (e) {
    if (e.state !== null) {
        addJS(getMenu(e.state.page))
        load()
    }
}