var pages = [];
var saveEdit

const promise = async function (url, method = 'GET', data = {}, formElement = null) {

    let args = {}
    if (method == 'POST') {
        if (formElement !== null) {
            var form = new FormData(formElement);
        } else {
            var form = new FormData();
            for (var key in data) {
                form.append(key, data[key])
            }
        }
        args = { method: method, body: form }
    }

    return await fetch(url, args).then(response => response.text()).catch(error => console.error(error))
}
const getDOM = async function (fileName) {
    if (pages[fileName] != null) {
        return pages[fileName]
    } else {
        const dom = await fetch('./' + fileName + '.html').then(response => response.text())
        var wrapper = document.createElement('div')
        wrapper.innerHTML = dom
        return wrapper.firstChild
    }
}
/*const wiziwig = function (e) {
    e.preventDefault()
    let baliseOpen = 'span'
    let baliseClose = 'span'
    let balise = 'span'
    if (e.target.id == 'btnCenter') {
        baliseOpen += ' class="center"'
    }

    var txtarea = document.getElementById("article")
    var start = txtarea.selectionStart
    var finish = txtarea.selectionEnd
    var allText = txtarea.value

    var sel = allText.substring(start, finish)
    var newText = allText.substring(0, start) + "<" + baliseOpen + ">" + sel + "</" + baliseClose + ">" + allText.substring(finish, allText.length)

    txtarea.value = newText
}*/

const getMenu = async function (url, page, method = 'GET', data = {}) {
    clearInterval(saveEdit);

    // Chargement des données
    const json_data = await promise(url, method, data)

    // Chargement du DOM
    let div = await getDOM(page)

    pages[page] = div
    localStorage.setItem('page', page);

    localStorage.setItem('data', JSON.stringify(data));

    return [div, JSON.parse(json_data)]
}

const save = async function () {

    const json_data = await promise('http://127.0.0.1/api_blog/save.php', 'POST', {}, document.getElementById('save_article'))

    /*var form = new FormData(document.getElementById('save_article'));
    const json_data = await fetch(
        'http://127.0.0.1/api_blog/save.php',
        { method: 'POST', body: form }
    ).then(response => response.text())
        .catch(error => console.error(error))*/
    console.log(json_data)
}



let page = localStorage.getItem('page');
if (page == 'edit' && localStorage.getItem('data') !== null) {
    getEdit(JSON.parse(localStorage.getItem('data')).id)
} else {
    getAccueil();
}

document.querySelector('.accueil').addEventListener("click", getAccueil)



