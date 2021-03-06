var form = function () {
    this.load = async function (params) {
        var DOM = await promise('plugin/form/form.html')


        for (var key in params) {
            var param = params[key]

            /* Exemple :

                <form action="" method="post" name="ID" id="ID">
                    Libellé :
                    <input type="date" name="ID" id="ID" style="STYLE"><br><br>
                    Libellé :
                    <textarea name="ID" id="ID" style="STYLE"></textarea><br><br>
                    Libellé :
                    <input type="text" name="ID" id="ID"><br><br>
                    <div id="ID" class="button">Envoyer</div>
                </form>

            */

            // Element à connaitre :
            var input = param.input
            var type = param.type
            var id = param.id
            var style = param.style
            var callback = param.callback


            let article_DOM = setDOMElement(DOM, [
                { 'selector': 'h1', 'attributs': { 'innerHTML': article.title } },
                {
                    'selector': '.modifier_article', 'attributs': { 'innerHTML': "modifier l'article" },
                    'multiple': false,
                    'callback': {
                        'event': 'click',
                        'function': function () {
                            load('edit', [], 'page', 'index.html?edit=' + article.slug)
                        }
                    },
                    'connexion': true
                },
                { 'selector': '#article_content', 'attributs': { 'innerHTML': article.content_parsdown } },
            ])
        }

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