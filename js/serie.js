var Page = function () {
    this.load = async function () {
        var serie = new URL(document.location.href).searchParams.get('serie')
        var saison = new URL(document.location.href).searchParams.get('saison')
        var DOM = await promise('serie.html')

        if (serie !== '' && (saison !== null && saison !== '')) { // Episode
            DOM.querySelectorAll('.add_serie').forEach(function (elt) {
                elt.remove()
            });
            DOM.querySelectorAll('.add_saison').forEach(function (elt) {
                elt.remove()
            });
            let navSaison = DOM.querySelector('#navSaison')
            navSaison.href = 'index.html?serie=' + serie + '&saison='
            navSaison.addEventListener("click", function (e) {
                e.preventDefault()
                loadContent('serie', base + 'index.html?serie=' + serie + '&saison=')
            })
            DOM.querySelector('.serie').addEventListener("click", function (e) {
                e.preventDefault()
                loadContent('serie', base + 'index.html?serie=')
            })

            let data = await promise('index.php', 'POST', {
                'find': 'episode',
                'where': {
                    'serie': serie,
                    'saison': saison
                }
            })
            if (data.error === 0) {
                // Série
                DOM.querySelector('#list').appendChild(await serieDisplay(serie))

                // Saison
                DOM.querySelector('#list').appendChild(await saisonDisplay(serie, saison))

                // Liste
                for (var key in data.list) {
                    DOM.querySelector('#list').appendChild(await episodeDisplay(serie, saison, data.list[key]))
                }

                // Event : Ajouter un épisode
                if (localStorage.getItem('token') !== null) {
                    DOM.querySelector('#save_episode').addEventListener("click", function () {
                        api('save',
                            'episode',
                            {
                                'episode': document.querySelector('#num_episode').value,
                                'title': document.querySelector('#title_episode').value,
                                'saison': saison,
                                'serie': serie
                            },
                            {},
                            '',
                            'serie=' + serie + '&saison=' + saison + '&',
                            'serie'
                        )
                    })
                } else {
                    DOM.querySelectorAll('.add_episode').forEach(function (elt) {
                        elt.remove()
                    });
                }

                document.querySelector('#page_content').innerHTML = ''
                document.querySelector('#page_content').appendChild(DOM)
            }
        } else if (serie !== '' && (saison === null || saison === '')) { // Saison
            DOM.querySelectorAll('.add_serie').forEach(function (elt) {
                elt.remove()
            });
            DOM.querySelectorAll('.add_episode').forEach(function (elt) {
                elt.remove()
            });
            DOM.querySelector('#navEpisode').remove()
            DOM.querySelector('#navSaison').remove()
            DOM.querySelector('#navSaisonCurrent').style.display = 'initial'

            DOM.querySelector('.serie').addEventListener("click", function (e) {
                e.preventDefault()
                loadContent('serie', base + 'index.html?serie=')
            })

            let data = await promise('index.php', 'POST', {
                'find': 'saison',
                'where': {
                    'serie': serie
                }
            })
            if (data.error === 0) {
                // Série
                DOM.querySelector('#list').appendChild(await serieDisplay(serie))

                // Liste
                for (var key in data.list) {
                    DOM.querySelector('#list').appendChild(await saisonDisplay(serie, data.list[key]))
                }

                // Event : Ajouter une saison
                if (localStorage.getItem('token') !== null) {
                    DOM.querySelector('#save_saison').addEventListener("click", function () {
                        api('save',
                            'saison',
                            {
                                'saison': document.querySelector('#title_saison').value,
                                'serie': serie
                            },
                            {},
                            'saison',
                            'serie=' + serie + '&',
                            'serie'
                        )
                    })
                } else {
                    DOM.querySelectorAll('.add_saison').forEach(function (elt) {
                        elt.remove()
                    });
                }

                document.querySelector('#page_content').innerHTML = ''
                document.querySelector('#page_content').appendChild(DOM)
            }
        } else { // Séries
            DOM.querySelectorAll('.add_saison').forEach(function (elt) {
                elt.remove()
            });
            DOM.querySelectorAll('.add_episode').forEach(function (elt) {
                elt.remove()
            });
            DOM.querySelector('#navigation').remove()

            let data = await promise('index.php', 'POST', {
                'find': 'serie'
            })

            if (data.error === 0) {
                // Liste
                for (var key in data.list) {
                    DOM.querySelector('#list').appendChild(await serieDisplay(data.list[key])) // Liste
                }

                // Event : Ajouter une série
                if (localStorage.getItem('token') !== null) {
                    DOM.querySelector('#save_serie').addEventListener("click", function () {
                        api('save',
                            'serie',
                            {
                                'title': document.querySelector('#title_serie').value,
                                'slug': document.querySelector('#title_serie').value
                            },
                            {},
                            'slug'
                        )
                    })
                } else {
                    DOM.querySelectorAll('.add_serie').forEach(function (elt) {
                        elt.remove()
                    });
                }
            }
        }

        // Spoil
        DOM.querySelectorAll('.showSpoil').forEach(function (spoil) {
            spoil.addEventListener("click", function () {
                if (spoil.children[0].style.display === 'none') {
                    spoil.children[0].setAttribute('style', 'display:initial;cursor:pointer;text-decoration:underline')
                    spoil.children[1].setAttribute('style', 'display:none;cursor:pointer')
                } else {
                    spoil.children[0].setAttribute('style', 'display:none')
                    spoil.children[1].setAttribute('style', 'display:initial;cursor:pointer')
                }
            })
        });

        document.querySelector('#page_content').innerHTML = ''
        document.querySelector('#page_content').appendChild(DOM)
    }

    function setSpoil(txt) {
        if (txt !== null) {
            let start = txt.search("spoil")
            let finish = txt.search('/spoil')

            if (start != -1 && finish != -1) {
                var selection = txt.substring((start + 6), (finish - 1))
                return txt.substring(0, (start - 1)) + '<span class="showSpoil"><span class="showSpoilLink" style="text-decoration:underline;cursor:pointer;">Voir le spoil</span><span class="spoil" style="display:none;">' + selection + '</span></span>' + txt.substring((finish + 7), txt.length)
            }
        }
        return txt
    }

    var element_episode =
        '<li class="episode" style="list-style-type: none; display: flex;" id="">' + // id épisode
        '<figure><img class="cover" src="" alt="" width="300"></figure>' + // cover
        '<div style="padding-left: 20px;">' +
        '<h2 style="float: left;"><span class="number"></span> - <span class="title"></span></h1>' + // number + title
        '<a class="edit" style="text-decoration: none;"><span style="color: blue;">edit</span></a>' + // edit
        '<br style="clear: both;">' +
        '<span class="description"></span>' + // description
        '</div>' +
        '</li>'

    var element_episode_edit =
        '<li style="list-style-type: none; display: flex;">' +
        '<figure><a href=""><img class="cover" src="" alt="" width="300"></a></figure>' + // cover
        '<div style="padding-left: 20px;">' +
        '<input class="number" type="number" name="number" style="width:40px"> - <input class="title" type="text" name="title">' + // number + title
        '<a class="delete"><span style="color: red; font-weight: bold">X</span></a>' + // delete
        '<br style="clear: both;">' +
        'Modifier l\'image: <input type="file" class="img" name="img" accept="image/png, image/jpeg">' + // file
        '<br style="clear: both;">' +
        '<div>' +
        '<textarea class="description" name="serie_desc" rows="8" cols="90" placeholder="Description de l\'épisode"></textarea>' + // description
        '<div class="button edit" class="button">Modifier l\'épisode</div>' + // validation
        '</div>' +
        '</div>' +
        '</li>'

    const episodeDisplay = async function (serie, saison, episode) {
        let element = getElement(element_episode, [
            {
                'selector': '.cover', 'attributs': {
                    'src': 'http://' + new URL(document.location.href).hostname + '/api_rest/www/img/' + episode.img,
                    'alt': episode.title,
                }
            },
            { 'selector': 'li', 'attributs': { 'id': 'episode' + episode.id } },
            { 'selector': '.number', 'attributs': { 'innerHTML': episode.episode } },
            { 'selector': '.title', 'attributs': { 'innerHTML': episode.title } },
            { 'selector': '.description', 'attributs': { 'innerHTML': parseMd(setSpoil(episode.description)) } },
            {
                'selector': '.edit', 'attributs': {},
                'multiple': false,
                'callback': {
                    'event': 'click',
                    'function': function (e) {
                        e.preventDefault()
                        episodeEdit(serie, saison, episode)
                    }
                },
                'connexion': true
            },
        ])

        if (localStorage.getItem('token') === null) {
            element.querySelector('.edit').remove()
        }
        return element
    }

    const episodeEdit = async function (serie, saison, episode) {
        let element = getElement(element_episode_edit, [
            {
                'selector': '.cover', 'attributs': {
                    'src': 'http://' + new URL(document.location.href).hostname + '/api_rest/www/img/' + episode.img,
                    'alt': episode.title,
                }
            },
            { 'selector': '.number', 'attributs': { 'value': episode.episode } },
            { 'selector': '.title', 'attributs': { 'value': episode.title } },
            { 'selector': '.description', 'attributs': { 'innerHTML': episode.description } },
            {
                'selector': '.delete', 'attributs': {},
                'multiple': false,
                'callback': {
                    'event': 'click',
                    'function': function (e) {
                        e.preventDefault()
                        episodeDelete(serie, saison, episode)
                    }
                },
                'connexion': true
            },
            {
                'selector': '.edit', 'attributs': {},
                'multiple': false,
                'callback': {
                    'event': 'click',
                    'function': function (e) {
                        e.preventDefault()
                        let element = document.querySelector('#episode' + episode.id)
                        let img = ''
                        if (element.querySelector('.img').files[0] !== undefined) {
                            img = document.querySelector('.img').files[0]
                        }
                        api('save',
                            'episode',
                            {
                                'episode': element.querySelector('.number').value,
                                'title': element.querySelector('.title').value,
                                'description': element.querySelector('.description').value,
                                'img': img
                            },
                            {
                                'id': episode.id
                            },
                            'saison',
                            'serie=' + serie + '&saison=' + saison,
                            'serie'
                        )
                    }
                },
                'connexion': true
            },
        ])

        document.querySelector('#episode' + episode.id).innerHTML = ''
        document.querySelector('#episode' + episode.id).appendChild(element)
    }

    const episodeDelete = async function (serie, saison, episode) {
        if (confirm("Voulez-vous vraiment supprimer cet épisode ?")) {
            api('delete', 'episode', {}, { 'id': episode.id }, '', 'serie=' + serie + '&saison=' + saison + '&', 'serie')
        }
    }

    var element_saison =
        '<li class="saison" style="list-style-type: none;margin: 15px 0 30px 0;text-align: center" id="">' + // id saison
        '<a class="link" href=""><h1 class="title"></h1></a>' + // number
        '<a class="edit" style="text-decoration: none;"><span style="color: blue;">edit</span></a>' + // edit
        '<br style="clear: both;">' +
        '<span class="description"></span>' + // description
        '</li>'

    var element_saison_edit =
        '<li class="saison" style="list-style-type: none" id="">' + // id saison
        '<h1 class="title">Saison </h1> <input class="number" type="number" name="saison_number" style="width:40px">' + // number
        '<a class="delete"><span style="color: red; font-weight: bold">X</span></a>' + // delete
        '<br style="clear: both;">' +
        '<div>' +
        '<textarea class="description" name="serie_desc" rows="8" cols="90" placeholder="Description de la saison"></textarea>' + // description
        '<div class="button edit_saison" class="button">Modifier la saison</div>' + // validation
        '</div>' +
        '</li>'

    const saisonDisplay = async function (serie, saison) {
        if (serie instanceof Object === false) {
            let data = await promise('index.php', 'POST', {
                'find': 'serie',
                'where': {
                    'slug': serie
                }
            })
            serie = data.list[0]
        }
        if (saison instanceof Object === false) {
            let data = await promise('index.php', 'POST', {
                'find': 'saison',
                'where': {
                    'serie': serie.id,
                    'saison': saison
                }
            })
            saison = data.list[0]
        }
        let element = getElement(element_saison, [
            { 'selector': 'li', 'attributs': { 'id': 'saison' + saison.id } },
            {
                'selector': '.link', 'attributs': { 'href': 'index.html?serie=' + serie.slug + '&saison=' + saison.saison, 'style': 'text-decoration: none;color: #000;' },
                'multiple': false,
                'callback': {
                    'event': 'click',
                    'function': function (e) {
                        e.preventDefault()
                        loadContent('serie', base + 'index.html?serie=' + serie.slug + '&saison=' + saison.saison)
                    }
                }
            },
            { 'selector': '.title', 'attributs': { 'innerHTML': 'Saison ' + saison.saison } },
            { 'selector': '.description', 'attributs': { 'innerHTML': saison.description } },
            {
                'selector': '.edit', 'attributs': {},
                'multiple': false,
                'callback': {
                    'event': 'click',
                    'function': function (e) {
                        e.preventDefault()
                        saisonEdit(serie, saison)
                    }
                },
                'connexion': true
            },
        ])

        if (localStorage.getItem('token') === null) {
            element.querySelector('.edit').remove()
        }
        return element
    }

    const saisonEdit = async function (serie, saison) {
        let element = getElement(element_saison_edit, [
            { 'selector': '.number', 'attributs': { 'value': saison.saison } },
            { 'selector': '.description', 'attributs': { 'innerHTML': saison.description } },
            {
                'selector': '.delete', 'attributs': {},
                'multiple': false,
                'callback': {
                    'event': 'click',
                    'function': function (e) {
                        e.preventDefault()
                        saisonDelete(serie, saison)
                    }
                },
                'connexion': true
            },
            {
                'selector': '.edit_saison', 'attributs': {},
                'multiple': false,
                'callback': {
                    'event': 'click',
                    'function': function (e) {
                        e.preventDefault()
                        let element = document.querySelector('#saison' + saison.id)
                        api('save',
                            'saison',
                            {
                                'saison': element.querySelector('.number').value,
                                'description': element.querySelector('.description').value,
                            },
                            {
                                'id': saison.id
                            },
                            'saison',
                            'serie=' + serie.slug,
                            'serie'
                        )
                    }
                },
                'connexion': true
            },
        ])

        document.querySelector('#saison' + saison.id).innerHTML = ''
        document.querySelector('#saison' + saison.id).appendChild(element)
    }

    const saisonDelete = async function (serie, saison) {
        let data = await promise('index.php', 'POST', {
            'find': 'episode',
            'where': {
                'serie': serie,
                'saison': saison.id
            }
        })

        if (confirm("Voulez-vous vraiment supprimer cette saison ?")) {
            if (data.list.length > 0) {
                if (confirm("Il existe des épisodes pour cette saison, la supprimer supprimera également tous les épisodes")) {
                    api('delete', 'saison', {}, { 'id': saison.id }, '', 'serie=' + serie + '&', 'serie')
                }
            } else {
                api('delete', 'saison', {}, { 'id': saison.id }, '', 'serie=' + serie + '&', 'serie')
            }
        }
    }

    var element_serie =
        '<li class="serie" style="list-style-type: none; display: flex;" id="">' + // id serie
        '<figure><a class="link" href=""><img class="cover" src="" alt="" width="200"></a></figure>' + // cover
        '<div style="padding-left: 20px;">' +
        '<a class="link" href="" style="float: left; text-decoration: none; color: rgb(0, 0, 0);"><h1 class="title"></h1></a>' + // title
        '<a class="edit" style="text-decoration: none;"><span style="color: blue;">edit</span></a>' + // edit
        '<br style="clear: both;">' +
        '<span class="description"></span>' + // description
        '</div>' +
        '</li>'

    var element_serie_edit =
        '<li style="list-style-type: none; display: flex;">' +
        '<figure><a href=""><img class="cover" src="" alt="" width="200"></a></figure>' + // cover
        '<div style="padding-left: 20px;">' +
        '<input class="title" type="text" name="serie_name">' + // title
        '<a class="delete"><span style="color: red; font-weight: bold">X</span></a>' + // delete
        '<br style="clear: both;">' +
        'Modifier l\'image: <input type="file" class="serie_img" name="serie_img" accept="image/png, image/jpeg">' + // file
        '<br style="clear: both;">' +
        '<textarea class="description" name="serie_desc" rows="8" cols="90" placeholder="Description de la série"></textarea>' + // description
        '<div class="button edit_serie" class="button">Modifier la série</div>' + // validation
        '</div>' +
        '</li>'

    const serieDisplay = async function (serie) {
        if (serie instanceof Object === false) {
            let data = await promise('index.php', 'POST', {
                'find': 'serie',
                'where': {
                    'slug': serie
                }
            })
            serie = data.list[0]
        }
        let element = getElement(element_serie, [
            { 'selector': 'li', 'attributs': { 'id': serie.slug } },
            {
                'selector': '.link', 'attributs': { 'href': 'index.html?serie=' + serie.slug },
                'multiple': true,
                'callback': {
                    'event': 'click',
                    'function': function (e) {
                        e.preventDefault()
                        loadContent('serie', base + 'index.html?serie=' + serie.slug)
                    }
                }
            },
            {
                'selector': '.cover', 'attributs': {
                    'src': 'http://' + new URL(document.location.href).hostname + '/api_rest/www/img/' + serie.img,
                    'alt': serie.title,
                }
            },
            { 'selector': '.title', 'attributs': { 'innerHTML': serie.title } },
            { 'selector': '.description', 'attributs': { 'innerHTML': serie.description } },
            {
                'selector': '.edit', 'attributs': {},
                'multiple': false,
                'callback': {
                    'event': 'click',
                    'function': function (e) {
                        e.preventDefault()
                        serieEdit(serie)
                    }
                },
                'connexion': true
            },
        ])

        if (localStorage.getItem('token') === null) {
            element.querySelector('.edit').remove()
        }
        return element
    }

    const serieEdit = async function (serie) {
        let element = getElement(element_serie_edit, [
            {
                'selector': '.cover', 'attributs': {
                    'src': 'http://' + new URL(document.location.href).hostname + '/api_rest/www/img/' + serie.img,
                    'alt': serie.title,
                }
            },
            { 'selector': '.title', 'attributs': { 'value': serie.title } },
            { 'selector': '.description', 'attributs': { 'innerHTML': serie.description } },
            {
                'selector': '.delete', 'attributs': {},
                'multiple': false,
                'callback': {
                    'event': 'click',
                    'function': function (e) {
                        e.preventDefault()
                        serieDelete(serie)
                    }
                },
                'connexion': true
            },
            {
                'selector': '.edit_serie', 'attributs': {},
                'multiple': false,
                'callback': {
                    'event': 'click',
                    'function': function (e) {
                        e.preventDefault()
                        let element = document.querySelector('#' + serie.slug)
                        let img = ''
                        if (element.querySelector('.serie_img').files[0] !== undefined) {
                            img = document.querySelector('.serie_img').files[0]
                        }
                        api('save',
                            'serie',
                            {
                                'title': element.querySelector('.title').value,
                                'description': element.querySelector('.description').value,
                                'img': img,
                            },
                            {
                                'slug': serie.slug,
                            },
                            'slug',
                            'serie=' + serie.slug,
                            'serie'
                        )
                    }
                },
                'connexion': true
            },
        ])

        document.querySelector('#' + serie.slug).innerHTML = ''
        document.querySelector('#' + serie.slug).appendChild(element)
    }

    const serieDelete = async function (serie) {
        let data = await promise('index.php', 'POST', {
            'find': 'saison',
            'where': {
                'serie': serie.slug
            }
        })

        if (confirm("Voulez-vous vraiment supprimer cette série ?")) {
            if (data.list.length > 0) {
                if (confirm("Il existe des saisons pour cette série, la supprimer supprimera également toutes les saisons ainsi que leurs épisodes")) {
                    api('delete', 'serie', {}, { 'slug': serie.slug })
                }
            } else {
                api('delete', 'serie', {}, { 'slug': serie.slug })
            }
        }
    }

    const getElement = function (html, params) {
        let element = setDOM(html)

        for (var key in params) {
            let param = params[key]
            if (param.connexion !== undefined) {
                if (localStorage.getItem('token') === null) {
                    continue
                }
            }

            if (param.multiple !== undefined && param.multiple === true) {
                element.querySelectorAll(param.selector).forEach(function (obj) {
                    for (var attribut in param.attributs) {
                        if (param.attributs[attribut] !== null) {
                            if (attribut != 'innerHTML') {
                                obj.setAttribute(attribut, param.attributs[attribut])
                            } else {
                                obj.innerHTML = param.attributs[attribut]
                            }
                        }
                    }
                    if (param.callback !== undefined) {
                        obj.addEventListener(param.callback.event, param.callback.function)
                    }
                });
            } else {
                for (var attribut in param.attributs) {
                    if (param.attributs[attribut] !== null) {
                        if (attribut != 'innerHTML') {
                            element.querySelector(param.selector).setAttribute(attribut, param.attributs[attribut])
                        } else {
                            element.querySelector(param.selector).innerHTML = param.attributs[attribut]
                        }
                    }
                }
                if (param.callback !== undefined) {
                    element.querySelector(param.selector).addEventListener(param.callback.event, param.callback.function)
                }
            }
        }

        return getDOM(element)
    }

    function parseMd(md) {
        if (md !== null) {
            //ul
            md = md.replace(/^\s*\n\*/gm, '<ul>\n*');
            md = md.replace(/^(\*.+)\s*\n([^\*])/gm, '$1\n</ul>\n\n$2');
            md = md.replace(/^\*(.+)/gm, '<li>$1</li>');

            //ol
            md = md.replace(/^\s*\n\d\./gm, '<ol>\n1.');
            md = md.replace(/^(\d\..+)\s*\n([^\d\.])/gm, '$1\n</ol>\n\n$2');
            md = md.replace(/^\d\.(.+)/gm, '<li>$1</li>');

            //blockquote
            md = md.replace(/^\>(.+)/gm, '<blockquote>$1</blockquote>');

            //h
            md = md.replace(/[\#]{6}(.+)/g, '<h6>$1</h6>');
            md = md.replace(/[\#]{5}(.+)/g, '<h5>$1</h5>');
            md = md.replace(/[\#]{4}(.+)/g, '<h4>$1</h4>');
            md = md.replace(/[\#]{3}(.+)/g, '<h3>$1</h3>');
            md = md.replace(/[\#]{2}(.+)/g, '<h2>$1</h2>');
            md = md.replace(/[\#]{1}(.+)/g, '<h1>$1</h1>');

            //alt h
            md = md.replace(/^(.+)\n\=+/gm, '<h1>$1</h1>');
            md = md.replace(/^(.+)\n\-+/gm, '<h2>$1</h2>');

            //images
            md = md.replace(/\!\[([^\]]+)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1" />');

            //links
            md = md.replace(/[\[]{1}([^\]]+)[\]]{1}[\(]{1}([^\)\"]+)(\"(.+)\")?[\)]{1}/g, '<a href="$2" title="$4">$1</a>');

            //font styles
            md = md.replace(/[\*\_]{2}([^\*\_]+)[\*\_]{2}/g, '<b>$1</b>');
            md = md.replace(/[\*\_]{1}([^\*\_]+)[\*\_]{1}/g, '<i>$1</i>');
            md = md.replace(/[\~]{2}([^\~]+)[\~]{2}/g, '<del>$1</del>');

            //pre
            md = md.replace(/^\s*\n\`\`\`(([^\s]+))?/gm, '<pre class="$2">');
            md = md.replace(/^\`\`\`\s*\n/gm, '</pre>\n\n');

            //code
            md = md.replace(/[\`]{1}([^\`]+)[\`]{1}/g, '<code>$1</code>');

            //p
            md = md.replace(/^\s*(\n)?(.+)/gm, function (m) {
                return /\<(\/)?(h\d|ul|ol|li|blockquote|pre|img)/.test(m) ? m : '<p>' + m + '</p>';
            });

            //strip p from pre
            md = md.replace(/(\<pre.+\>)\s*\n\<p\>(.+)\<\/p\>/gm, '$1$2');
        }
        return md;
    }
}