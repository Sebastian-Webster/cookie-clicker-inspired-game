let gameState = {
    cookies: 0,
    CPS: 0,
    clickAmount: 1,
    cursorsOwned: 0,
    cursorCPS: 0.1,
    clicks: 0,
    grandmasOwned: 0,
    grandmaCPS: 1
}

function numberWithCommas(x) { //Function from https://stackoverflow.com/a/2901298
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function returnCursorPrice() {
    return parseInt(Math.floor(10 + gameState.cursorsOwned * 2 * (gameState.cursorsOwned / 10)))
}

function returnGrandmaPrice() {
    return parseInt(Math.floor(100 + gameState.grandmasOwned * 2 * (gameState.grandmasOwned / 10)))
}

function isCursorAffordable() {
    const cursorPrice = returnCursorPrice()
    return gameState.cookies >= cursorPrice
}

function isGrandmaAffordable() {
    const grandmaPrice = returnGrandmaPrice()
    return gameState.cookies >= grandmaPrice
}

function buyCursor() {
    let cursorPrice = returnCursorPrice()
    if (isCursorAffordable()) {
        updateCookies(-cursorPrice)
        gameState.cursorsOwned += 1
        document.getElementById('cursor-amount').textContent = gameState.cursorsOwned
        cursorPrice = returnCursorPrice()
        document.getElementById('cursor-price').textContent = `${cursorPrice} Cookies`
        calculateCPS()
    }
    //If the cursor is not affordable, do not do anything.
}

function buyGrandma() {
    let grandmaPrice = returnGrandmaPrice()
    if (isGrandmaAffordable()) {
        updateCookies(-grandmaPrice)
        gameState.grandmasOwned += 1
        document.getElementById('grandma-amount').textContent = gameState.grandmasOwned
        grandmaPrice = returnGrandmaPrice()
        document.getElementById('grandma-price').textContent = `${grandmaPrice} Cookies`
        calculateCPS()
    }
    //If the cursor is not affordable, do not do anything.
}

function calculateCPS() {
    let cps = 0;
    cps += gameState.cursorsOwned * gameState.cursorCPS
    cps += gameState.grandmasOwned * gameState.grandmaCPS
    gameState.CPS = cps;
    document.getElementById('cps-amount').textContent = `${cps.toFixed(1)} CPS`
}

function updateBuyItemContainersBasedOnAffordability() {
    const cursor = document.getElementById('buy-cursor-container')
    const grandma = document.getElementById('buy-grandma-container')
    if (!isCursorAffordable()) {
        cursor.classList.add('not-affordable')
    } else {
        cursor.classList.remove('not-affordable')
    }
    if (!isGrandmaAffordable()) {
        grandma.classList.add('not-affordable')
    } else {
        grandma.classList.remove('not-affordable')
    }
}

function updateCookies(amount) {
    gameState.cookies += amount;
    const flooredCookies = Math.floor(gameState.cookies)
    const cookieNumberWithCommas = numberWithCommas(flooredCookies)
    document.title = `${cookieNumberWithCommas} Cookies`
    document.getElementById('cookie-amount').textContent = `${cookieNumberWithCommas} Cookies`
    updateBuyItemContainersBasedOnAffordability()
}

function clickCookie(e) {
    console.log(e)
    console.log('Mouse X:', e.clientX)
    console.log('Mouse Y:', e.clientY)
    gameState.clicks += 1
    const addedCookiesTemplate = document.getElementById('added-cookies-from-click')
    const message = addedCookiesTemplate.content.querySelector('h2').cloneNode(true)
    const id = `${gameState.clicks.toString()}-add-cookies-message`;
    message.textContent = `+${gameState.clickAmount} Cookies`
    message.style.position = 'absolute'
    message.style.top = `${e.clientY}px`
    message.style.left = `${e.clientX + (Math.random() * 30)}px`
    message.style.zIndex = 2
    message.id = id
    console.log(message)
    document.body.appendChild(message)
    updateCookies(gameState.clickAmount)
    setTimeout(() => {
        const node = document.getElementById(id)
        node.remove()
    }, 2000);
}

document.getElementById('cookie-image').addEventListener('click', clickCookie)

const CPSInterval = setInterval(() => {
    updateCookies(gameState.CPS / 10)
}, 100)