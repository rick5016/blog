var commentaire = function () {
    this.load = async function (params) {
        var DOM = await promise('plugin/commentaire/commentaire.html')

        if (params['where'] == undefined) {
            params['where'] = ''
        }

        var commentairesElts = []
        let commentaires = await promise('index.php', 'POST', {
            'findAll': 'commentaire',
            'page': params['page'],
            'nbResultByPage': params['resultbypage'],
            'where': params['where'],
        })

        if (params['accueil'] === 1) {
            DOM.querySelector('#title').innerHTML = 'Les commentaires'

        }

        // Construction des commentaires
        for (var keyCommentaire in commentaires.list) {
            let commentaire = commentaires.list[keyCommentaire]

            // Gestion des dates
            let date_created = new Date(commentaire.created)
            let date_created_Ymd_H = addZero(date_created.getDate()) + '/' + addZero(date_created.getMonth()) + '/' + addZero(date_created.getFullYear()) + ' à ' + addZero(date_created.getHours())
            let date_string = date_created_Ymd_H + ':' + addZero(date_created.getMinutes())
            if (commentaire.updated !== undefined) {
                let date_updated = new Date(commentaire.updated)
                let date_updated_Ymd_H = addZero(date_updated.getDate()) + '/' + addZero(date_updated.getMonth()) + '/' + addZero(date_updated.getFullYear()) + ' à ' + addZero(date_updated.getHours())
                if (date_created_Ymd_H != date_updated_Ymd_H) {
                    date_string += ' modifié le ' + date_updated_Ymd_H + ':' + addZero(date_updated.getMinutes())
                }
            }

            if (commentaire.publied !== 1 && commentaire.own !== true) {
                commentaire.content = '<i>En cours de modération.</i>'
            }
            let login = 'Anonyme'
            if (commentaire.user !== undefined && commentaire.user !== false) {
                login = commentaire.user.login
            }

            commentaireElt = []
            if (params['accueil'] === 1) {
                commentaireElt.push(
                    { 'element': 'img', 'attributs': { 'src': 'https://rick5016.net/img/vignette/' + commentaire.page.vignette, 'style': 'float:left;margin: 0px 10px 10px 0px;' } }
                )
                commentaireElt.push(
                    { 'element': 'a', 'attributs': { 'class': 'link', 'href': 'index.html?article=' + commentaire.page.slug, 'b-entity': 'article', 'innerHTML': commentaire.page.title } }
                )
            }
            commentaireElt.push(
                { 'element': 'div', 'attributs': { 'class': 'info', 'style': 'padding-bottom:10px;', 'innerHTML': 'Par <b><i>' + login + '</i></b> le ' + date_string } },
            )

            commentaireElt.push(
                { 'element': 'div', 'attributs': { 'id': 'commentaire-content-' + commentaire.id, 'class': 'commentaire-content', 'innerHTML': commentaire.content } }
            )
            if (commentaire.own === true) {
                if (commentaire.publied !== 1) {
                    commentaireElt.push({
                        'element': 'div', 'attributs': {}, 'sub': [
                            { 'element': 'div', 'attributs': { 'class': 'info', 'style': 'color:red', 'innerHTML': '<br><i>Votre commentaire est en cours de modération.' } },
                        ]
                    })
                }
                if (params['accueil'] !== 1) {
                    commentaireElt.push({
                        'element': 'div', 'attributs': {}, 'sub': [
                            { 'element': 'br', 'attributs': {} },
                            { 'element': 'a', 'attributs': { 'class': 'btnModify', 'style': 'cursor: pointer;', 'innerHTML': 'Modifier', 'id': 'm' + commentaire.id } },
                            { 'element': 'span', 'attributs': { 'innerHTML': ' - ' } },
                            { 'element': 'a', 'attributs': { 'class': 'btnDelete', 'style': 'cursor: pointer;', 'innerHTML': 'Suprimer', 'id': 'd' + commentaire.id } },
                        ]
                    })
                }
            }

            commentairesElts.push({
                'element': 'div', 'attributs': { 'id': 'commentaire' + commentaire.id, 'class': 'commentaire-container', 'style': "border: 1px solid #efefef;padding: 10px;margin: 10px" }, 'sub': commentaireElt
            })
        }

        // Inertion des commentaires dans le DOM
        if (commentairesElts.length > 0) {
            let = commentairesResultsElts = []
            commentairesResultsElts.push({ 'element': 'div', 'attributs': { 'class': 'pagination', 'style': 'margin-left: 10px;margin-top: 20px;' } })
            commentairesResultsElts.push({ 'element': 'div', 'attributs': { 'id': 'commentaires-container', 'style': 'width:100%' }, 'sub': commentairesElts })
            if (params['accueil'] !== 1) {
                commentairesResultsElts.push({
                    'element': 'div', 'attributs': { 'style': 'text-align:center' }, 'sub': [
                        { 'element': 'button', 'attributs': { 'class': 'button comment', 'innerHTML': 'Écrire un commentaire' } },
                    ]
                })
            }
            var result = [
                { 'element': 'div', 'attributs': { 'style': 'width: 100%;' }, 'sub': commentairesResultsElts }
            ]

            let resultDOM = setDOMElement(result)

            DOM.querySelector('#zeroCommentaire').innerHTML = ''
            DOM.querySelector('#zeroCommentaire').appendChild(resultDOM)
        }

        // Event d'ouverture de la popup pour écrire un commentaire
        DOM.querySelectorAll('.comment').forEach(function (comment) {
            comment.addEventListener("click", function (e) {
                e.preventDefault();
                // Affichage de l'avertissement si non connecté
                if (localStorage.getItem('token') == null) {
                    document.querySelector('#non_connecte').style.display = "block"
                }
                // Affichage de l'overlay
                document.querySelector('#commentaire-overlay').style.display = 'block';
                // Affichage de la popup de commentaire
                document.querySelector('#popup').style.display = 'block';
                // Edition du bouton de validation
                document.querySelector('#commentaireUpdate').style.display = 'none'
                document.querySelector('#commentaireSave').style.display = 'initial'
            })
        })

        // Event d'ouverture de la popup pour éditer un commentaire
        DOM.querySelectorAll('.btnModify').forEach(function (comment) {
            comment.addEventListener("click", function (e) {
                e.preventDefault();
                let id = comment.id.split('m')
                // Affichage de l'overlay
                document.querySelector('#commentaire-overlay').style.display = 'block';
                // Affichage de la popup de commentaire
                document.querySelector('#popup').style.display = 'block';
                // Envoie du texte à modifier
                document.querySelector('#commentaireInput').value = document.querySelector('#commentaire-content-' + id[1]).innerHTML
                // Edition du bouton de validation
                document.querySelector('#commentaireSave').style.display = 'none'
                document.querySelector('#commentaireUpdate').style.display = 'initial'

                // Envoie de l'ID
                document.querySelector('#commentaireId').value = id[1]
            })
        })

        // Event de fermeture de la popup de création/édition d'un commentaire
        DOM.querySelectorAll('.btnClose').forEach(function (close) {
            close.addEventListener("click", function () {
                load('article', [], 'page', document.location.pathname + document.location.search)
            })
        })

        DOM.querySelectorAll('.link').forEach(function (a) {
            a.addEventListener("click", function (e) {
                e.preventDefault()
                load(a.getAttribute('b-entity'), [], 'page', a.getAttribute('href'))
            })
        });

        // Event de suppression d'un commentaire
        DOM.querySelectorAll('.btnDelete').forEach(function (btnDelete) {
            btnDelete.addEventListener("click", function (e) {
                e.preventDefault()
                deleteCommentaire(btnDelete.id.split('d'))
            })
        })

        // Event du comptage du nombre de caractère restant lors de la création/édition d'un commentaire
        DOM.querySelector('#commentaireInput').addEventListener("input", function (e) {
            document.querySelector('#cara_restant').innerHTML = (240 - e.target.value.length)
        })

        // Event du chargement de la captcha à la validation de la création d'un commentaire
        DOM.querySelector('#commentaireSave').addEventListener("click", function (e) {
            e.preventDefault();
            loadCaptcha()
        })

        // Event du chargement de la captcha à la validation de la modification d'un commentaire
        DOM.querySelector('#commentaireUpdate').addEventListener("click", function (e) {
            e.preventDefault();
            loadCaptcha()
        })

        document.querySelector('#commentaires').innerHTML = ''
        document.querySelector('#commentaires').appendChild(DOM)

        // Chargement du plugin de la pagination
        if (commentairesElts.length > 0) {
            load('pagination', { 'data': commentaires, 'where': params['where'], 'page': params['page'], 'resultbypage': params['resultbypage'], 'accueil': params['accueil'], 'callback': callbackPagination, 'no-scroll': '1' }, 'plugin', false, true)
        }
    }
}

const loadCaptcha = async function (data) {
    // Affichage de l'erreur si le commentaire est vide
    if (document.querySelector('#commentaireInput').value === '') {
        document.querySelector('#commentaireInput').previousElementSibling.style.display = 'block'
    } else {
        document.querySelector('#commentaireInput').previousElementSibling.style.display = 'none'

        // Récupération de la captcha
        var data = await promise('index.php', 'POST', {
            'save': 'captcha',
            'width': window.innerWidth,
        })

        if (data.error === 0) {
            // On cache la popup de modification du commentaire
            document.querySelector('#commentaire-overlay').style.display = 'none'
            // Appel du plugin captcha
            load('captcha', [callbackCaptcha, data], 'plugin', false, true)
        }
    }
}

const callbackCaptcha = async function () {
    var captchas = []
    // Récupération des coordonnées des captchas
    document.querySelectorAll('.captcha').forEach(function (elt) {
        captchas.push({ 'id': elt.id, 'x': elt.style.left, 'y': elt.style.top })
    })
    // Récupération du commentaire
    var content = document.querySelector('#commentaireInput').value
    // Récupération de l'id du commentaire
    var id = document.querySelector('#commentaireId').value

    // Validation des captchas et enregistrement/modification du commentaire
    let data = await promise('index.php', 'POST', {
        'save': 'commentaire',
        'values': {
            'content': content,
            'page': new URL(document.location.href).searchParams.get('article')
        },
        'id': id,
        'width': window.innerWidth,
        'coords': JSON.stringify(captchas)
    })

    if (data.valid !== undefined) {
        if (data.valid === true) {
            document.querySelector('#commentaireInput').value = ''
            document.querySelector('#cara_restant').innerHTML = '240'
            document.querySelector('#succes-title').innerHTML = 'Votre commentaire a bien été enregistré !'
            if (localStorage.getItem('token') === null) {
                document.querySelector('#succes-content').innerHTML = '<br>Votre commentaire a été soumis <b>anonymement</b> et <b style="color:red">ne peux pas être modifié ni supprimé</b>.<br>Celui-ci doit passer la modération avant d\'être affiché sur le site.'
            } else {
                document.querySelector('#succes-content').innerHTML = '<br>Celui-ci doit passer la modération avant d\'être affiché sur le site.'
            }
        } else if (data.valid === 'surcharge') {
            document.querySelector('#succes-title').innerHTML = 'Le site est surchargé.'
            document.querySelector('#succes-content').innerHTML = '<br>Votre commentaire n\'a pas été soumis, veuillez recommencer l\'opération plus tard.'
        } else {
            document.querySelector('#succes-title').innerHTML = 'Vous n\'avez pas réussi à valider la captcha.'
            document.querySelector('#succes-content').innerHTML = '<br>Votre commentaire n\'a pas été soumis, veuillez recommencer l\'opération.'
        }
        document.querySelector('#commentaire-overlay').style.display = 'block';
        document.querySelector('#succes').style.display = 'block';
        document.querySelector('#popup').style.display = 'none';
    }

    return data
}

const callbackPagination = async function (where, page, resultbypage, accueil) {
    load('commentaire', { 'where': where, 'page': page[1], 'resultbypage': resultbypage, 'accueil': accueil, 'no-scroll': '1' }, 'plugin', false, true)
}

const deleteCommentaire = async function (id) {
    let data = await promise('index.php', 'POST', {
        'delete': 'commentaire',
        'where': {
            'id': id[1],
        }
    })

    if (data.error === 0) {
        document.querySelector('#commentaire' + id[1]).innerHTML = '<i style="color:red">Votre commentaire a été supprimé.</i>'
    }
}

function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}