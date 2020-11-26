var reminder = function () {
    this.load = async function () {
        if (localStorage.getItem('token') === null) {
            document.querySelector('#page_content').innerHTML = 'Vous devez être connecté pour utiliser cette fonctionnalité'
        } else {
            var DOM = await promise('page/reminder/reminder.html')
            let data = await promise('index.php', 'POST', {
                'find': 'reminder',
            })

            if (data !== undefined && data.error === 0) {
                if (data.list.length > 0) {
                    for (var key in data.list) {
                        let reminder = data.list[key]

                        DOM = setDOMElement(DOM, [
                            {
                                'selector': '#reminder', 'element': 'li', 'attributs': {}, 'sub':
                                [
                                    {'element': 'p', 'attributs': { 'innerHTML': reminder.rim_date }},
                                    {'element': 'p', 'attributs': { 'innerHTML': reminder.rim_commentaire_1 }},
                                    {'element': 'p', 'attributs': { 'innerHTML': reminder.rim_commentaire_2 }},
                                    {'element': 'p', 'attributs': { 'innerHTML': reminder.rim_type }},
                                ]
                            }
                        ])
                    }

                }
            }

            // Chargement de l'article
            DOM = setDOMElement(DOM, [
                {
                    'selector': '#rim_submit',
                    'callback': {
                        'event': 'click',
                        'function': function () {
                            promise('index.php', 'POST', {
                                'save': 'reminder',
                                'values': {
                                    'rim_date': document.querySelector('#rim_date').value,
                                    'rim_commentaire_1': document.querySelector('#rim_commentaire_1').value,
                                    'rim_commentaire_2': document.querySelector('#rim_commentaire_2').value,
                                    'rim_type': document.querySelector('#rim_type').value
                                }
                            })
                        }
                    },
                    'connexion': true
                },
            ])


            document.querySelector('#page_content').innerHTML = ''
            document.querySelector('#page_content').appendChild(DOM)

        }
    }
}