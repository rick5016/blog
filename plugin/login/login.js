var login = function () {
    this.load = async function () {
        var DOM = await promise('plugin/login/login.html')

        if (localStorage.getItem('token') !== null) {
            // Bouton déco si logué
            let span = document.createElement('span')
            span.innerHTML = 'Déconnexion'
            span.addEventListener("click", deconnexion)
            DOM.innerHTML = ''
            DOM.appendChild(span)
        } else {
            //DOM.querySelector('.add').remove()
            // formulaire inscription / login si pas logué
            if (DOM.querySelector('#inscription') != null && DOM.querySelector('#connexion') != null) {
                DOM.querySelector('#inscription').addEventListener("click", function (e) {
                    e.preventDefault()
                    inscription()
                })
                DOM.querySelector('#connexion').addEventListener("click", function (e) {
                    e.preventDefault()
                    connexion()
                })
            }
        }

        //return DOM
        document.querySelector('#bloc_login').appendChild(DOM)
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