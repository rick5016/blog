var template = function () {
    this.load = async function () {
        var DOM = await promise('page/template/template.html')
        addCSS('template', 'page')

        // Retrait du bouton d'ajout d'article si non connecté
        if (localStorage.getItem('token') === null) {
            DOM.querySelector('.add').remove()
        }

        // Plugins
        load('menu', [], 'plugin', false, true)
        load('login', [], 'plugin', false, true)

        // Contenu
        let url = new URL(document.location.href)
        load(getMenu(url), [], 'page', url.href, true)
        
        // Gestion des liens présent directement dans le template
        DOM.querySelectorAll('.link').forEach(function (a) {
            a.addEventListener("click", function (e) {
                e.preventDefault()
                //load('article', 'page', 'index.html?article=' + article.slug)
                load(a.getAttribute('b-entity'), [], 'page', a.getAttribute('href'))
            })
        });

        document.querySelector('body').appendChild(DOM)
    }
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