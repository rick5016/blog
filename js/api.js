/**
 * Appel de l'api
 * 
 * @param {String} action uniquement save / delete pour l'instant
 * @param {String} entite Nom de la table et du menu qui sera chargé comme paramètre dans l'url
 * @param {Object} values Valeurs à sauvegarder ou updater (laisser vide pour un delete)
 * @param {Object} where Clause where
 * @param {String} propReturn Nom de la propriété de l'objet retourné à utilisé dans l'url (par défaut : 'slug')
 * @param {String} urlArgs Paramètre(s) à ajouter dans l'url (par défaut : aucun)
 * @param {String} page Nom de la page pour l'historique de navifation (par défaut elle est égale à l'entité)
 */
const api = async function (action, entite, values = [], where = [], propReturn = '', urlArgs = '', page = '') {
    if (page === '') {
        page = entite
    }
    var error = ''

    // TODO : gestion des erreurs
    /*if (title === '') {
        error = error_messages.save_article_title_required
    }*/

    if (error === '') {
        let data = await promise('index.php', 'POST', {
            [action]: entite,
            'values': values,
            'where': where
        })

        if (data.error === 0) {
            param = ''
            if (propReturn !== '') {
                param = data[propReturn]
            }
            await loadContent(page, base + 'index.html?' + urlArgs + entite + '=' + param)
            // TODO : gestion de la validation
            //alerte(error_messages.save_serie_valide, 'ok', 1)
            alerte('message de Validation', 'ok', 1)
        }
    } else {
        alerte(error, 'ko')
    }
}