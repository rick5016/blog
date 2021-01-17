var login = function () {
    this.load = async function () {
        var DOM = await promise('plugin/login/login.html')

        // Affichage du bloc de connexion
        DOM.querySelector('#connexion-btn').addEventListener("click", function () {
            if (document.querySelector('#connexion-bloc').style.display == 'none') {
                document.querySelector('#connexion-bloc').style.display = "block";
            } else {
                document.querySelector('#connexion-bloc').style.display = "none";
            }
        })

        if (localStorage.getItem('token') !== null) {
            // Bouton déconnexion si logué
            let span = document.createElement('span')
            span.innerHTML = 'Déconnexion'
            span.addEventListener("click", deconnexion)
            DOM.querySelector('#connexion-bloc').innerHTML = ''
            DOM.querySelector('#connexion-bloc').appendChild(span)
            
            document.querySelector('#connexion-container').appendChild(DOM)
        } else {
            // Gestion des evenements
            if (DOM.querySelector('#inscription') != null && DOM.querySelector('#connexion') != null) {
                DOM.querySelector('#inscription').addEventListener("click", function (e) {
                    e.preventDefault()
                    //inscription()
                })
                DOM.querySelector('#connexion').addEventListener("click", function (e) {
                    e.preventDefault()
                    connexion()
                })
            }

            document.querySelector('#connexion-container').appendChild(DOM)
        }

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
 * TODO : gestion de l'inscription
 * 
 */
const inscription = async function () {
    let login = document.querySelector('#login').value
    let password = document.querySelector('#password').value
    if (login != '' && password != '') {
        let data = await promise('api.php', 'POST', { 'login': login, 'password': password, 'inscription': true })
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
        await promise('api.php', 'POST', { 'login': login, 'password': password })
    }
}