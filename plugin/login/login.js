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
            span.id = 'deconnexion-bloc'
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
                    load('inscription', [], 'page', 'index.html?inscription')
                })
                DOM.querySelector('#connexion').addEventListener("click", function (e) {
                    e.preventDefault()
                    let login = document.querySelector('#login').value
                    let password = document.querySelector('#password').value
                    connexion(login, password)
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
 * Gestion de la connexion
 * 
 */
const connexion = async function (login, password) {
    if (login != '' && password != '') {
        await promise('index.php', 'POST', { 'login': login, 'password': password })
    }
}