var saveEdit

const wiziwig = function (e) {
    e.preventDefault()
    if (e.target.id == 'br') {
        baliseOpen = '<br />'
        baliseClose = ''
        var txtarea = document.getElementById("article")
        var start = txtarea.selectionStart
        var finish = txtarea.selectionEnd
        var allText = txtarea.value

        var sel = allText.substring(start, finish)
        var newText = allText.substring(0, start) + sel + "<br />" + allText.substring(finish, allText.length)
        
        txtarea.value = newText
    } else {
        var baliseOpen = e.target.id
        var baliseClose = baliseOpen
        if (e.target.id.substring(0, 5) == 'class') {
            baliseOpen = 'span class="' + e.target.id.substring(6) + '"'
            baliseClose = 'span'
        }
        var txtarea = document.getElementById("article")
        var start = txtarea.selectionStart
        var finish = txtarea.selectionEnd
        var allText = txtarea.value

        var sel = allText.substring(start, finish)
        var newText = allText.substring(0, start) + "<" + baliseOpen + ">" + sel + "</" + baliseClose + ">" + allText.substring(finish, allText.length)

        txtarea.value = newText
    }
    setPrevisu()
}

const setPrevisu = function () {
    let content = document.querySelector('#article').value

    var pos = content.indexOf("<BLOC_CODE>");
    while (pos > -1) {
        let openPosition = pos + 11
        let closePosition = content.indexOf("</BLOC_CODE>");
        content = content.substring(0, openPosition).replace('<BLOC_CODE>', '<code>') +
            '<div class="code"><pre>' + content.substring(openPosition, closePosition).replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre></div>' +
            content.substring(closePosition, content.length).replace('</BLOC_CODE>', '</code>')

        pos = content.indexOf("<BLOC_CODE>", pos + 1);
    }

    document.querySelector('#prev').innerHTML = content
}

const saveArticle = async function (id) {
    document.querySelector('#loader').style.display = null
    await promise('http://127.0.0.1/blog_api/save.php', 'POST', { 'id': id }, document.getElementById('form_article'))
    clearInterval(saveEdit)
    saveEdit = null
    document.querySelector('#loader').style.display = 'none'
}