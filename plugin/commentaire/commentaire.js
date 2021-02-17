var commentaire = function () {
    this.load = async function (data) {
        let nb_result_by_page = (new URL(document.location.href).searchParams.get('resultbypage') != null) ? new URL(document.location.href).searchParams.get('resultbypage') : 10
        let page = (new URL(document.location.href).searchParams.get('page') != null) ? new URL(document.location.href).searchParams.get('page') : 1
        var article = data[0]
        var DOM = await promise('plugin/commentaire/commentaire.html')

        DOM.querySelector('#heade-title-end').innerHTML = ' - ' + article.title;

        var commentairesElts = []
        var paginationElts = []
        for (var keyCommentaire in article.commentaires.list) {
            let commentaire = article.commentaires.list[keyCommentaire]
            var date_created = new Date(commentaire.created)
            var updateDate = ''
            if (commentaire.created != commentaire.updated) {
                var date_updated = new Date(commentaire.updated)
                updateDate = ' modifié le ' + (date_updated.getDate() < 9 ? '0' + date_updated.getDate() : date_updated.getDate()) + '/' + (date_updated.getMonth() < 9 ? '0' + (date_updated.getMonth() + 1) : (date_updated.getMonth() + 1)) + '/' + date_updated.getFullYear()
            }

            commentairesElts.push({
                'element': 'div', 'attributs': { 'class': 'commentaire-container', 'style': "border: 1px solid #efefef;padding: 10px;width: 100%;margin: 10px;" }, 'sub': [
                    { 'element': 'div', 'attributs': { 'class': 'info', 'style': 'padding-bottom:10px;', 'innerHTML': 'Par <b><i>Anonyme</i></b> le ' + (date_created.getDate() < 9 ? '0' + date_created.getDate() : date_created.getDate()) + '/' + (date_created.getMonth() < 9 ? '0' + (date_created.getMonth() + 1) : (date_created.getMonth() + 1)) + '/' + date_created.getFullYear() + updateDate } },
                    { 'element': 'div', 'attributs': { 'class': 'commentaire-content', 'innerHTML': commentaire.content } }
                ]
            })
        }

        if (commentairesElts.length > 0) {
            let slug = new URL(document.location.href).searchParams.get('article')
            if (page > 3) {
                if (article.commentaires.nb_page > 5) {
                    paginationElts.push(
                        {
                            'element': 'div', 'attributs': { 'class': 'page' }, 'sub': [
                                {
                                    'element': 'a', 'attributs': { 'class': 'link', 'b-entity': 'article', 'href': 'index.html?article=' + slug }, 'sub': [
                                        { 'element': 'span', 'attributs': { 'class': 'search-pagination-prems' } }
                                    ]
                                }
                            ]
                        }
                    )
                }
            }

            // Pagination
            if (article.commentaires.nb_page > 1) {
                var nb_pagination = 0;
                var nb_page = page - 3
                if (nb_page < 1) nb_page = 0
                for (var i = (0 + nb_page); i < article.commentaires.nb_page; i++) {
                    nb_pagination++;
                    if (nb_pagination < 6) {
                        var selected = ''
                        if ((i + 1) == page) {
                            var selected = ' page-selected'
                        }
                        paginationElts.push(
                            {
                                'element': 'div', 'attributs': { 'class': 'page' }, 'sub': [
                                    { 'element': 'a', 'attributs': { 'class': 'link ' + selected, 'innerHTML': (i + 1), 'b-entity': 'article', 'href': 'index.html?article=' + slug + '&page=' + (i + 1) } }
                                ]
                            }
                        )
                    }
                }

                // Elément à droite de la pagination permettant d'aller à la dernière page
                if (page < (article.commentaires.nb_page - 2)) {
                    if (article.commentaires.nb_page > 5) {
                        paginationElts.push(
                            {
                                'element': 'div', 'attributs': { 'class': 'page' }, 'sub': [
                                    {
                                        'element': 'a', 'attributs': { 'class': 'link search-pagination-last-container', 'b-entity': 'article', 'href': 'index.html?article=' + slug + '&page=' + article.commentaires.nb_page }, 'sub':
                                            [
                                                { 'element': 'span', 'attributs': { 'class': 'search-pagination-last' } }
                                            ]
                                    }
                                ]
                            }
                        )
                    }
                }
            }

            // Commentaire en fin de pagination affichant le numéro des articles affiché à l'écran
            var max = page * nb_result_by_page
            if (article.commentaires.nb_result < max) {
                max = article.commentaires.nb_result
            }
            paginationElts.push(
                { 'element': 'div', 'attributs': { 'class': 'search-pagination-info', 'innerHTML': ((page * nb_result_by_page) - (nb_result_by_page - 1)) + ' - ' + max + ' sur ' + article.commentaires.nb_result + ' commentaire(s)' } }
            )
            var result = [
                {
                    'element': 'div', 'attributs': { 'style': 'width: 100%;' }, 'sub': [
                        { 'element': 'div', 'attributs': { 'id': 'commentaires-pagination' }, 'sub': paginationElts },
                        { 'element': 'div', 'attributs': { 'id': 'commentaires-container', 'style': 'width:100%' }, 'sub': commentairesElts },
                        { 'element': 'button', 'attributs': { 'class': 'button comment', 'innerHTML': 'Écrire un commentaire' } }
                    ]
                }
            ]

            let resultDOM = setDOMElement(result)

            // Event sur les liens de la pagination
            resultDOM.querySelectorAll('.link').forEach(function (a) {
                a.addEventListener("click", function (e) {
                    e.preventDefault()
                    load(a.getAttribute('b-entity'), ['no-scroll'], 'page', a.getAttribute('href'))
                })
            });

            DOM.querySelector('#zeroCommentaire').innerHTML = ''
            DOM.querySelector('#zeroCommentaire').appendChild(resultDOM)
        }

        // Fermeture des popup
        DOM.querySelectorAll('.btnClose').forEach(function (close) {
            close.addEventListener("click", function (e) {
                document.querySelector('#overlay').style.display = 'none';
            })
        })

        // Ouverture de la popup pour écrire un commentaire
        DOM.querySelectorAll('.comment').forEach(function (comment) {
            comment.addEventListener("click", function (e) {
                document.querySelector('#succes').style.display = 'none'
                document.querySelector('#captcha').style.display = 'none'
                e.preventDefault();
                if (localStorage.getItem('token') !== null) {

                } else {
                    document.querySelector('#non_connecte').style.display = "block"
                }
                document.querySelector('#overlay').style.display = 'block';
                document.querySelector('#popup').style.display = 'block';
            })
        })

        // Comptage du nombre de caractère restant
        DOM.querySelector('#commentaireInput').addEventListener("input", function (e) {
            document.querySelector('#cara_restant').innerHTML = (240 - e.target.value.length)
        })

        // Sauvegarde
        DOM.querySelector('#valider').addEventListener("click", function (e) {
            e.preventDefault();
            valideCaptcha()
        })

        // Sauvegarde
        DOM.querySelector('#commenaireSave').addEventListener("click", function (e) {
            e.preventDefault();
            saveCommentaire()
        })

        document.querySelector('#commentaires').appendChild(DOM)

    }
}
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    document.querySelector('#' + data).style['margin-left'] = (ev.layerX - 25) + 'px';
    document.querySelector('#' + data).style['margin-top'] = (ev.layerY - 25) + 'px';
}

const valideCaptcha = async function () {
    var captchas = []
    document.querySelectorAll('.captcha').forEach(function (elt) {
        captchas.push({ 'id': elt.id, 'x': elt.style.left, 'y': elt.style.top })
    })

    let data = await promise('api.php', 'POST', {
        'save': 'Commentairetmp',
        'values': {
            'width': window.innerWidth,
            'coords': JSON.stringify(captchas)
        }
    })

    if (data.valid !== undefined) {
        document.querySelector('#captcha').style.display = 'none'
        if (data.valid === true) {
            document.querySelector('#commentaireInput').value = ''
            document.querySelector('#cara_restant').innerHTML = '240'
            document.querySelector('#succes-title').innerHTML = 'Votre commentaire a bien été enregistré !'
            document.querySelector('#succes-content').innerHTML = '<br>Votre commentaire a été soumis <b>anonymement</b> et <b style="color:red">ne peux pas être modifié ni supprimé</b>.<br>Celui-ci doit passer la modération avant d\'être affiché sur le site.'
        } else if (data.valid === 'surcharge') {
            document.querySelector('#succes-title').innerHTML = 'Le site est surchargé.'
            document.querySelector('#succes-content').innerHTML = '<br>Votre commentaire n\'a pas été soumis, veuillez recommencer l\'opération plus tard.'
        } else {
            document.querySelector('#succes-title').innerHTML = 'Vous n\'avez pas réussi à valider la captcha.'
            document.querySelector('#succes-content').innerHTML = '<br>Votre commentaire n\'a pas été soumis, veuillez recommencer l\'opération.'
        }
        document.querySelector('#succes').style.display = 'block'
    } else {
        saveCommentaire(data)
    }
}


const saveCommentaire = async function (data) {
    var content = document.querySelector('#commentaireInput').value
    if (content === '') {
        document.querySelector('#commentaireInput').previousElementSibling.style.display = 'block'
    } else {
        document.querySelector('#commentaireInput').previousElementSibling.style.display = 'none'
        if (data === undefined) {
            var data = await promise('api.php', 'POST', {
                'save': 'Commentairetmp',
                'values': {
                    'width': window.innerWidth,
                    'content': content,
                    'article': new URL(document.location.href).searchParams.get('article')
                }
            })
        }

        if (data.error === 0) {
            document.querySelector('#popup').style.display = 'none'
            document.querySelector('#captcha').style.display = 'block'
            if (data.valid === 'surcharge') {
                document.querySelector('#captcha-title').innerHTML = 'Le site est surchargé.'
                document.querySelector('#captcha-content').innerHTML = '<br>Votre commentaire n\'a pas été soumis, veuillez recommencer l\'opération plus tard.'
            } else {
                var x = 0
                var y = 0

                let img = document.createElement('img')
                img.src = 'img/tmp/' + data.picture
                img.addEventListener("drop", function (e) {
                    e.preventDefault();
                    var data = e.dataTransfer.getData("text");
                    document.querySelector('#' + data).style['margin-top'] = '0px'
                    document.querySelector('#' + data).style['margin-left'] = '0px'
                    document.querySelector('#' + data).style.left = (e.layerX - x) + 'px';
                    document.querySelector('#' + data).style.top = (e.layerY - y) + 'px';
                })
                img.addEventListener("dragover", function (e) {
                    e.preventDefault();
                })
                img.addEventListener("dragstart", function (e) {
                    e.preventDefault();
                })
                document.querySelector('#captcha_picture').innerHTML = ''
                document.querySelector('#captcha_picture').appendChild(img)

                let margin = 100;
                document.querySelector('#piece').innerHTML = ''
                for (var key in data.captcha) {
                    let captcha = data.captcha[key]
                    let img2 = document.createElement('div')
                    img2.id = captcha['id']
                    img2.classList.add("captcha")
                    img2.style['background-image'] = "url('img/tmp/" + captcha['id'] + ".png')"
                    img2.style.position = 'absolute'
                    img2.style['z-index'] = '2'
                    img2.style['margin-top'] = '25px'
                    img2.style['margin-left'] = margin + 'px'
                    margin += 200
                    img2.style.width = captcha['largeur'] + 'px'
                    img2.style.height = captcha['longueur'] + 'px'
                    img2.style.border = '1px solid #fff'
                    img2.addEventListener("dragstart", function (e) {
                        document.querySelector('#' + e.target.id).style['z-index'] = -1
                        e.dataTransfer.setData("text", e.target.id);
                        x = e.layerX
                        y = e.layerY
                    })
                    img2.addEventListener("dragend", function (e) {
                        document.querySelector('#' + e.target.id).style['z-index'] = 2
                    })
                    img2.draggable = true
                    document.querySelector('#piece').appendChild(img2)
                }

                document.querySelector('#captcha_essai').innerHTML = data.try;
                document.querySelector('#overlay').style.display = 'block';
            }
        }
    }
}

const updateCommentaire = async function (reload) {
    var slug = new URL(document.location.href).searchParams.get('edit')

    var error = ''
    let title = document.querySelector('#title').value
    if (title === '') {
        error = error_messages.save_article_title_required
    }
    let content = document.querySelector('#article').value
    if (content === '') {
        error = error_messages.save_article_content_required
    }
    if (error === '') {
        let data = await promise('api.php', 'POST', {
            'save': 'page',
            'values': {
                'title': title,
                'content': content,
                'type': document.querySelector('#type').value
            }, 'where': {
                'slug': slug,
            }
        })

        clearInterval(saveEdit)
        saveEdit = null
        if (data.error === 0) {
            if (reload) {
                history.pushState({ page: 'edit' }, 'edit', 'index.html?edit=' + data.slug)
                load('menu', [], 'plugin', false, true)
            }
            alerte(error_messages.update_article_valide, 'ok', 1)
        }
    } else {
        alerte(error, 'ko')
    }
}