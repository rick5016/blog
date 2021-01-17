var menu = function () {
    this.load = async function () {
        //let data = await promise('api.php', 'POST', { 'find': 'page', 'order': 'id desc', 'where': { 'type': 'page' } })

        /*if (data !== undefined && data !== false) {
            var pages = []
            for (var key in data.list) {
                let article = data.list[key]

                pages.push({
                    'element': 'li', 'attributs': {'style': 'background-color: #f46036;width:100%'}, 'sub':
                    [
                        {
                            'element': 'a', 'attributs': { 'href': 'index.html?article=' + article.slug, 'innerHTML': article.title, 'class': 'link page item nav'}, 'callback': {
                                'event': 'click',
                                'function': function (e) {
                                    e.preventDefault()
                                    load('article', [], 'page', 'index.html?article=' + article.slug)
                                }
                            }
                        }
                    ]
                })

                pages.push({
                    'element': 'li', 'attributs': {'class': 'transition-orange'}
                })
            }
            var page_data = [{ 'element': 'ul', 'attributs': { 'id': 'pages' }, 'sub': pages }]

            if (document.querySelector('#pages') !== null) {
                document.querySelector('#pages').remove()
            }
            pages.pop()
            pages.push({
                'element': 'li', 'attributs': {'class': 'transition-fonce'}
            })
            pages.push({
                'element': 'li', 'attributs': {'style': 'background-color: #353535;width:100%'}, 'sub':
                    [
                        {
                            'element': 'a', 'attributs': { 'href': 'index.html?article=', 'innerHTML': 'Autres', 'class': 'link page item nav'}, 'callback': {
                                'event': 'click',
                                'function': function (e) {
                                    e.preventDefault()
                                    load('article', [], 'page', 'index.html?article=')
                                }
                            }
                        }
                    ]
            })
            document.querySelector('nav').appendChild(setDOMElement(page_data))
        }*/
    }
}