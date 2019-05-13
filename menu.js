const getEdit = async function (id) {

    let [div, data] = await getMenu('http://127.0.0.1/api_blog/index.php', 'edit', 'POST', { 'id': id })

    var imported = document.createElement('script');
    imported.src = './edit.js';
    imported.charset = 'utf-8'
    //document.body.appendChild(imported);
    document.querySelector('#page').appendChild(imported)

    // Traitement
    div.querySelector('#title').setAttribute('value', data.title)
    div.querySelector('#article').innerHTML = data.content
    
    document.querySelector('#page').innerHTML = ''
    document.querySelector('#page').appendChild(div)

    saveEdit = setInterval(save, 30000);
}

const getAccueil = async function () {

    let [div, data] = await getMenu('http://127.0.0.1/api_blog/list.php', 'list')

    // Traitement
    var li1 = document.createElement('li')
    li1.id = 'article_' + data.articles[0].id
    li1.setAttribute('class', 'link edit')
    li1.innerHTML = data.articles[0].title

    var li2 = document.createElement('li')
    li2.id = 'article_' + data.articles[1].id
    li2.setAttribute('class', 'link edit')
    li2.innerHTML = data.articles[1].title

    div.querySelector('ul').innerHTML = ''
    div.querySelector('ul').appendChild(li1)
    div.querySelector('ul').appendChild(li2)


    div.querySelectorAll('.edit').forEach(a => {
        a.addEventListener("click", function () { getEdit(a.id.substr(8)) })
    })

    document.querySelector('#page').innerHTML = ''
    document.querySelector('#page').appendChild(div)
}