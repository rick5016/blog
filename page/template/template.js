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
            if (scrollPos < -99 && document.documentElement.scrollTop != 0) {
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
                DOM.querySelector('#menu-container').classList.add("menu-container-scroll")
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
                DOM.querySelector('#menu-container').classList.remove("menu-container-scroll")
                DOM.querySelector('nav').classList.remove("nav-scroll")
                DOM.querySelector('#menu-container').style.display = 'none'
            }
            scrollPos = (document.body.getBoundingClientRect()).top;
        });

        // Affichage du menu déroulant
        DOM.querySelector('.other').addEventListener("click", function () {
            if (document.querySelector('#menu-container').style.display == 'none') {
                document.querySelector('#menu-container').style.display = 'block'
            } else {
                document.querySelector('#menu-container').style.display = 'none'
            }
        })

        // Retrait du bouton d'ajout d'article si non connecté
        if (localStorage.getItem('token') === null) {
            DOM.querySelector('#add').remove()
        } else {
            let user = await promise('index.php', 'POST', {
                'find': 'user'
            })
            if (user.roles.search('ADMIN') === -1) {
                DOM.querySelector('#add').remove()
            }
        }

        // Affichage du menu déroulant
        DOM.querySelector('#nav-btn').addEventListener("click", function (e) {
            if (DOM.querySelector('#menu-container').style.display == 'none') {
                DOM.querySelector('#menu-container').style.display = 'block'
            } else {
                DOM.querySelector('#menu-container').style.display = 'none'
            }
        })
        DOM.querySelectorAll('#menu-title li').forEach(function (li) {
            li.addEventListener("mouseover", function () {
                document.querySelectorAll('#menu-content .article-content').forEach(function (div) {
                    div.style.display = 'none'
                })
                document.querySelector('#' + li.getAttribute('id') + '-content').style.display = 'block'
            })
        });

        document.querySelector('body').addEventListener("click", function (elt) {
            if (document.querySelector('#connexion-bloc').style.display !== 'none' && elt.target.classList[0] != 'connexion-event') {
                document.querySelector('#connexion-bloc').style.display = 'none'
            }

            if (document.querySelector('#menu-container').style.display !== 'none' && elt.target.id != 'menu' && !elt.target.classList.contains('other') && elt.target.id != 'nav-btn') {
                document.querySelector('#menu-container').style.display = 'none'
            }
        });

        // Chargement du plugin nav + menu déroulant
        load('menu', [], 'plugin', false, true)

        // Chargement du plugin connexion
        load('login', [], 'plugin', false, true)

        // Chargement du plugin footer
        load('footer', [], 'plugin', false, true)

        // Chargement du contenu
        let url = new URL(document.location.href)
        load(getMenu(url), [], 'page', url.href, true)
        
        // Gestion des liens présent directement dans le template
        DOM.querySelectorAll('a[b-entity]').forEach(function (a) {
            a.addEventListener("click", function (e) {
                document.querySelector('#menu-container').style.display = 'none'
                e.preventDefault()
                load(a.getAttribute('b-entity'), [], 'page', a.getAttribute('href'))
            })
        });

        // Event sur la loupe via la barre de recherche
        DOM.querySelector('#search-icone').addEventListener("click", function () {
            load('search', [], 'page', changeURL(document.querySelector('#search-input').value))
        })
        DOM.querySelector('#search-input').addEventListener("keypress", function (e) {
            if (e.key === 'Enter') {
                load('search', [], 'page', changeURL(document.querySelector('#search-input').value))
            }
        })

        document.querySelector('body').appendChild(DOM)
    }
}

changeURL = function (searchReplace = null, affineReplace = null, categorieReplace = null, resultbypageReplace = null, pageReplace = null, typeReplace = null) {
    let search       = new URL(document.location.href).searchParams.get('search')
    let affine       = new URL(document.location.href).searchParams.get('affine')
    let categories   = new URL(document.location.href).searchParams.get('categories[]')
    let resultbypage = new URL(document.location.href).searchParams.get('resultbypage')
    let type         = new URL(document.location.href).searchParams.get('type')

    let url = 'index.html?search='
    
    // search
    if (searchReplace !== null) {
        url += searchReplace
    } else if (search !== null) {
        url += search
    }

    // affine
    if (affineReplace !== null) {
        url += '&affine=' + affineReplace
    } else if (affine !== null) {
        url += '&affine=' + affine
    }

    // categories
    if (categories != null) {
        url += '&categories[]='
        let result = categories
        if (categorieReplace === '') {
            result = ''
        } else if (categorieReplace != null) {
            if (categories.indexOf('|') != -1) {
                result = categories.replace(categorieReplace + '|', '')
                if (categories == result) {
                    result = categories.replace('|' + categorieReplace, '')
                }
            } else {
                result = categories.replace(categorieReplace, '')
            }
        }
        url += result
    }

    // page
    if (pageReplace !== null) {
        url += '&page=' + pageReplace
    }

    // resultbypage
    if (resultbypageReplace !== null) {
        url += '&resultbypage=' + resultbypageReplace
    } else if (resultbypage !== null) {
        url += '&resultbypage=' + resultbypage
    }

    // type
    if (typeReplace !== null) {
        url += '&type=' + typeReplace
    } else if (type !== null) {
        url += '&type=' + type
    }

    return url
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