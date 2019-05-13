const wiziwig = function (e) {
    console.log('wiziwig')
}
document.querySelectorAll('.wiziwig').forEach(w => {
    w.addEventListener("click", wiziwig)
})