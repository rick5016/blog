var host = (window.location.hostname === '127.0.0.1') ? window.location.hostname + ':8081' : window.location.hostname
var base = (window.location.hostname === '127.0.0.1') ? '/' : '/blog/'
var www = (window.location.hostname === '127.0.0.1') ? '' : ''
var intervalToken, intervalAlert
var connexion_increment = 0
var connexion_duration_sec = 60 * 60

const DEBUG_PROD = false
var debug = (window.location.hostname === '127.0.0.1') ? true : (DEBUG_PROD ? true : false)
var menus = ['accueil', 'article', 'edit', 'serie', 'reminder']

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
 * Récupération du DOM d'une page HTML ou Récupération des données
 * Gère également le token de connexion
 * 
 * @param {string} url 
 * @param {string} method 
 * @param {abjet} data
 */
const promise = async function (url, method = 'GET', data = {}) {
    if (url.indexOf('.html') !== -1) {
        const dom = await fetch('./' + url).then(response => response.text())
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
        let result = await fetch('http://' + host + '/api_rest/' /*+ www */ + url, args).then(response => response.text()).catch(error => console.error(error))

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
 * Charge un plugin ou une page
 * 
 * @param {string} name 
 * @param {string page|plugin} type 
 * @param {string} url 
 * @param {bool} loadByTemplate 
 */
const load = function (name, data = [], type = 'page', url = false, loadByTemplate = false) {
    // Gestion de la navigation du navigateur
    if (url !== false) {
        history.pushState({ page: name }, name, url)
    }
    
    addCSS(name, type)
    // Chargement de la page ou du plugin
    if (document.querySelector('#' + name + 'JS') == null) {
        let imported = document.createElement('script')
        imported.src = './' + type + '/' + name + '/' + name + '.js'
        imported.charset = 'utf-8'
        imported.id = name + 'JS'
        //imported.type = 'module'
        imported.onload = function () {
            obj = new window[name]()
            //obj.load(document.querySelector('#page_content'))
            obj.load(data)
        }
        document.querySelector('body').appendChild(imported)
    } else {
        /*function myMove(elem) {
            document.querySelector('body').style['overflow-x'] = 'hidden'
            //elem.classList.remove('fadeIn');
            //elem.classList.toggle('fadeOut');
            var width = elem.offsetWidth
            elem.style['width'] = width + "px"; 
            var pos = 0;
            var id = setInterval(frame, 1);
            function frame() {
                //console.log(pos)
                if (pos > width) {
                    clearInterval(id);
                    elem.remove()
                    document.querySelector('body').style['overflow'] = 'auto'
                } else {
                    pos+= 1; 
                    elem.style['margin-left'] = pos + "px"; 
                }
            }
        }
        myMove(document.querySelector('#page_content'))*/
        //document.querySelector('#page_content')

        //var newElt = document.createElement('div')
        /*newElt.class = 'fadeOut'
        newElt.id = 'page_content_new'*/
        obj = new window[name]()
        obj.load(data)
    }

    // Réinitialisation du css du plugin menu
    if (loadByTemplate === false) {
        new menu().setStyleMenu()
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

const init = function () {
    let obj = new template()
    obj.load()
}

init()

/**
 * Gestion de la navigation du navigateur
 */
window.onpopstate = function (e) {
    if (e.state !== null) {
        load(getMenu(e.state.page))
    } else {
        console.log('Impossible de revenir en arrière')
    }
}

/**
 * Ajoute un fichier CSS au DOM
 * 
 * @param {string} name 
 */
const addCSS = function (name, type = 'page') {
    let link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = type + '/' + name + '/' + name + '.css'
    link.id = name + 'CSS'
    document.head.appendChild(link)
}

/**
 * Set le html avec les paramètres
 * 
 * @param {String} html 
 * @param {Array} params 
 */
const setDOMElement = function (DOM, params) {
    let div = document.createElement('div')
    //console.log(DOM)
    //console.log(params)
    div.appendChild(DOM)

    for (var key in params) {
        let param = params[key]
        if (param.connexion !== undefined) {
            if (localStorage.getItem('token') === null) {
                continue
            }
        }
        
        // Création d'un élément
        if (param.element !== undefined) {
            var element = document.createElement(param.element)
            attrParam(element, param)
            // Création d'un sous élément
            if (param.sub !== undefined) {
                for (var keySub in param.sub) {
                    let element2 = document.createElement(param.sub[keySub].element)
                    attrParam(element2, param.sub[keySub])
                    element.appendChild(element2)
                }
            }
            div.querySelector(param.selector).appendChild(element)
        } else {
            // Attribution des paramètres
            if (param.multiple !== undefined && param.multiple === true) { // Sur tous les éléments
                div.querySelectorAll(param.selector).forEach(function (obj) {
                    attrParam(obj, param)
                });
            } else { // Sur un seul élément
                attrParam(div.querySelector(param.selector), param)
            }
        }
    }

    return div.firstChild
}

const attrParam = function (element,  param) {
    for (var attribut in param.attributs) {
        if (param.attributs[attribut] !== null) {
            if (attribut != 'innerHTML') {
                element.setAttribute(attribut, param.attributs[attribut])
            } else {
                element.innerHTML = param.attributs[attribut]
            }
        }
    }
    if (param.callback !== undefined) {
        element.addEventListener(param.callback.event, param.callback.function)
    }
}


/**
 * Remplacement du contenu de la page par un autre
 * 
 * @param {DOM} DOM 
 */
const setContent = function (DOM) {
    document.querySelector('#page_content').innerHTML = ''
    document.querySelector('#page_content').appendChild(DOM)
}