/**
 * Initialisation du template
 * 
 * @param {string} menu nom du js à charger
 */
const loadTemplate = async function () {

    let DOM = await promise('template.html')

    let div = document.createElement('div')
    let a = document.createElement('a')

    // icône accueil
    div.setAttribute('class', 'link icon accueil')
    a.addEventListener("click", function (e) {
        e.preventDefault()
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
            document.querySelector('#pages').innerHTML = '<li><a href="./index.html?serie=" class="link page item serie">Séries TV</a></li>'
        } else if (type == 'article') {
            document.querySelector('#list_article').innerHTML = ''
        } else {
            document.querySelector('#pages').innerHTML = '<li><a href="./index.html?serie=" class="link page item serie">Séries TV</a></li>'
            document.querySelector('#list_article').innerHTML = ''
        }

        document.querySelector('.serie').addEventListener("click", function (e) {
            e.preventDefault()
            loadContent('serie', base + 'index.html?serie=')
        })

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