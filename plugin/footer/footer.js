var footer = function () {
    this.load = async function () {
        var DOM = await promise('plugin/footer/footer.html')

        document.querySelector('#footer-container').appendChild(DOM)
    }
}