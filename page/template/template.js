var template = function () {
    this.load = async function () {
        // Chargement du HTML et du CSS
        var DOM = await promise('page/template/template.html')
        addCSS('template', 'page')

        // Logo Totoro
        var img = document.createElement('img')
        img.src = 'img\\totoro\\totoro_' + ((Math.floor(Math.random() * Math.floor(6))) + 1) + '_60.png'
        DOM.querySelector('#logo').appendChild(img)

        // Gestion du scroll
        var scrollPos = 0;
        window.addEventListener('scroll', function(){
            if (scrollPos < -99) {
                DOM.querySelector('header').classList.add("header-scroll")
                DOM.querySelector('#nav-btn').classList.add("nav-btn-scroll")
                DOM.querySelector('#logo-container').classList.add("logo-container-scroll")
                DOM.querySelector('#rick5016-sub').classList.add("rick5016-sub-scroll")
                DOM.querySelector('#logo img').classList.add("img-scroll")
                DOM.querySelector('#search-container').classList.add("search-container-scroll")
                DOM.querySelector('#search-input').classList.add("search-input-scroll")
                DOM.querySelector('#search-icone').classList.add("search-icone-scroll")
                DOM.querySelector('#connexion-titre').classList.add("connexion-titre-scroll")
                DOM.querySelector('#connexion-container').classList.add("connexion-container-scroll")
                DOM.querySelector('#connexion-svg').classList.add("connexion-svg-scroll")
                DOM.querySelector('#connexion-bloc').classList.add("connexion-bloc-scroll")
                DOM.querySelector('nav').classList.add("nav-scroll")
            } else {
                DOM.querySelector('header').classList.remove("header-scroll")
                DOM.querySelector('#nav-btn').classList.remove("nav-btn-scroll")
                DOM.querySelector('#logo-container').classList.remove("logo-container-scroll")
                DOM.querySelector('#rick5016-sub').classList.remove("rick5016-sub-scroll")
                DOM.querySelector('#logo img').classList.remove("img-scroll")
                DOM.querySelector('#search-container').classList.remove("search-container-scroll")
                DOM.querySelector('#search-input').classList.remove("search-input-scroll")
                DOM.querySelector('#search-icone').classList.remove("search-icone-scroll")
                DOM.querySelector('#connexion-titre').classList.remove("connexion-titre-scroll")
                DOM.querySelector('#connexion-container').classList.remove("connexion-container-scroll")
                DOM.querySelector('#connexion-svg').classList.remove("connexion-svg-scroll")
                DOM.querySelector('#connexion-bloc').classList.remove("connexion-bloc-scroll")
                DOM.querySelector('nav').classList.remove("nav-scroll")
                DOM.querySelector('#menu-container').style.display = 'none'
            }
            scrollPos = (document.body.getBoundingClientRect()).top;
        });

        // Retrait du bouton d'ajout d'article si non connecté
        if (localStorage.getItem('token') === null) {
            DOM.querySelector('#add').remove()
        }

        // Affichage du menu déroulant
        DOM.querySelector('#nav-btn').addEventListener("click", function (e) {
            if (DOM.querySelector('#menu-container').style.display == 'none') {
                DOM.querySelector('#menu-container').style.display = 'block'
            } else {
                DOM.querySelector('#menu-container').style.display = 'none'
            }
        })

        // Chargement du plugin nav + menu déroulant
        load('menu', [], 'plugin', false, true)

        // Chargement du plugin connexion
        load('login', [], 'plugin', false, true)

        // Chargement du contenu
        let url = new URL(document.location.href)
        load(getMenu(url), [], 'page', url.href, true)
        
        // Gestion des liens présent directement dans le template
        DOM.querySelectorAll('a[b-entity]').forEach(function (a) {
            a.addEventListener("click", function (e) {
                e.preventDefault()
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