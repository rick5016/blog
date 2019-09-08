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

const setDOM = function (html) {
    var wrapper = document.createElement('div')
    wrapper.innerHTML = html
    return wrapper
}

const getDOM = function (wrapper) {
    return wrapper.firstChild
}

/**
 * Récupération du DOM d'une page HTML ou Récupération des données
 * Gère également le token de connexion
 * 
 * @param {string} url 
 * @param {string} method 
 * @param {abjet} data
 */
const promise = async function (url, method = 'GET', data = {}) {
    if (url.indexOf('.html') !== -1) {
        const dom = await fetch('./html/' + url).then(response => response.text())
        var wrapper = document.createElement('div')
        wrapper.innerHTML = dom
        return wrapper.firstChild
    } else {
        // Auth (Ne fonctionne pas sur hebergement mutualisé)
        /*var myHeaders = new Headers();
        if (localStorage.getItem('token')) {
            myHeaders.append("Authorization", 'Bearer ' + localStorage.getItem('token'));
        }*/

        // Gestions des arguments
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
            args = { method: method, body: form/*, headers: myHeaders, credentials: 'include' // Auth (Ne fonctionne pas sur hebergement mutualisé)*/ }
        }

        // Appel
        let result = await fetch('http://' + new URL(document.location.href).hostname + '/api_rest/www/' + url, args).then(response => response.text()).catch(error => console.error(error))

        // Gestion du résultat et de la connexion grâce au token + affichage d'un message d'erreur en cas de problème ou de retour d'erreur de l'api 
        // TODO : Le message de validation pourrai également être retourné par l'api
        if (result !== undefined) {
            try {
                result = JSON.parse(result)
                if (result.error !== 0) {
                    alerte(result.error, 'ko', 10)
                } else if (result.token != null && result.token != '') {
                    if (localStorage.hasOwnProperty('token') === false) {
                        // Connexion : reload de la page
                        localStorage.setItem('token', result.token)
                        document.location.reload(true)
                    } else {
                        // Regénération du token : Réactualisation du temps d'inactivité
                        localStorage.setItem('token', result.token)
                        clearInterval(intervalToken)
                        connexion_increment = 0
                        intervalToken = setInterval(function () { remainingTime() }, 1000)
                    }
                } else if (localStorage.getItem('token') != null) {
                    // L'api n'a pas renvoyé de nouveau token alors que nous sommes connecté : Ne devrai jamais arriver
                    alerte(error_messages.api_failed, 'ko', 10)
                }
                return result
            } catch (error) { // La gestion du résultat a échoué
                result.error = error_messages.api_failed
                document.querySelector('#page_content').innerHTML = ''
                if (debug) {
                    alerte(error + result, 'ko', 100)
                } else {
                    alerte(error_messages.api_failed, 'ko', 10)
                }
            }
        } else { // L'appel a échoué
            alerte(error_messages.api_failed, 'ko', 10)
        }
    }
}

/**
 * Charge le fichier JS et supprime les autres si necessaire
 * 
 * @param {string} name 
 * @param {string} link 
 */
const loadContent = function (menu, url = false) {
    if (url !== false) { // N'enregistre pas dans l'historique de navigation si on charge le contenu via les boutons de navigation du navigateur
        history.pushState({ page: menu }, menu, url)
    }

    if (document.querySelector('#' + menu + 'JS') == null) {
        let imported = document.createElement('script')
        imported.src = './js/' + menu + '.js'
        imported.charset = 'utf-8'
        imported.id = menu + 'JS'
        imported.setAttribute("class", "js");
        imported.onload = function () {
            var js = document.querySelectorAll('.js')
            js.forEach(function (script) {
                if (script.id !== imported.id) {
                    script.remove()
                }
            });
            let page = new Page()
            page.load()
        }
        document.querySelector('body').appendChild(imported)
    } else {
        let page = new Page()
        page.load()
    }
}

/**
 * Récupère le nom du menu, s'il n'existe pas alors on renvoie : accueil
 * 
 * Si param est de type URL, alors on cherche le menu dans l'url
 * Si param est un string, alors on compare param aux noms de menus
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

    return menus[0]
}

const init = async function () {
    let url = new URL(document.location.href)
    await loadTemplate()
    loadContent(getMenu(url), url)
}

init()

/**
 * Gestion de l'historique du navigateur
 * 
 * TODO : problème pour revenir au site précédent // Le probleme semble etre à charque rechargement de page
 * Je pense qu'au chargement d'une page le navigateur fait un pushState et moi j'en refait un (j'ai tester : ça déplace le bug)
 */
window.onpopstate = async function (e) {
    if (e.state !== null) {
        loadContent(getMenu(e.state.page))
    } else {
        console.log('Impossible de revnir en arrière') // TODO : ne devrai jamais arriver
    }
}