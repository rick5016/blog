var article = function () {
    this.load = async function (elm) {
        var slug = new URL(document.location.href).searchParams.get('article')
        var DOM = await promise('page/article/article.html')
        let data = await promise('index.php', 'POST', {
            'find': 'page',
            'where': {
                'slug': slug
            }
        })
        
        if (data !== undefined && data.error === 0) {
            if (data.list.length > 0) {
                var article = data.list[0]

            // Chargement de l'article
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

            document.querySelector('#page_content').innerHTML = ''
            document.querySelector('#page_content').appendChild(article_DOM)

            } else {
                alerte(error_messages.load_article_not_found, 'ko', 10)
            }
        }
    }
}