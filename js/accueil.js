const load = async function () {
    history.pushState({ page: 'home' }, 'home', base)
    document.querySelector('#page_content').innerHTML = 'Accueil'
}