const load = async function () {
    var slug = new URL(document.location.href).searchParams.get('article')

    let [DOM, data] = await getDataHTML('index.php', 'article.html', 'POST', {
        'find': 'page',
        'where': {
            'slug': slug
        }
    })

    if (data.error === 0) {
        if (data.list !== undefined) {
            var article = data.list[0]

            // Chargement de l'article
            DOM = article_setTitle(DOM, article)
            DOM = article_setContent(DOM, article)
            setDOM(DOM)

            // Chargement du css
            //removeCSS('edit')
            addCSS('article')

            // Modification du style du menu selectionné
            setStyleMenu(article)

        } else {
            alerte(error_messages.load_article_not_found, 'ko', 10)
        }
    }
}

const article_setTitle = function (DOM, article) {
    // Title
    let h1 = document.createElement('h1')
    h1.innerHTML = article.title

    // Vérification du droit d'édition
    if (article.own) {
        let modif = document.createElement('span')
        modif.setAttribute('class', 'link edit')
        modif.innerHTML = "modifier l'article"
        modif.addEventListener("click", function (e) {
            e.preventDefault()
            loadContent('edit', base + 'index.html?edit=' + article.slug)
        })
        h1.appendChild(modif)
    }
    DOM.querySelector('#bloc_article').appendChild(h1)

    return DOM
}

const article_setContent = function (DOM, article) {
    let div = document.createElement('div')
    let content = article.content_parsdown
    div.innerHTML = content
    DOM.querySelector('#bloc_article').appendChild(div)

    return DOM
}

const setDOM = function (DOM) {
    document.querySelector('#page_content').innerHTML = ''
    document.querySelector('#page_content').appendChild(DOM)
}

const setStyleMenu = function (article) {
    document.querySelectorAll('.article').forEach(link => {
        link.style.background = 'initial'
        link.style.boxShadow = 'none'
    })
    document.querySelectorAll('.page').forEach(link => {
        link.style.color = '#ccc'
    })
    if (article.type == 'article') {
        document.querySelector("[href='index.html?article=" + article.slug + "']").style.background = '#fff'
        document.querySelector("[href='index.html?article=" + article.slug + "']").style.boxShadow = '0px 0px 5px #888, 0px 0px 5px #aaa'
    } else {
        document.querySelector("[href='index.html?article=" + article.slug + "']").style.color = '#fff'
    }
}