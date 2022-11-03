let gameState = {
    cookies: 0,
    CPS: 0,
    clickAmount: 1,
    cursorsOwned: 0,
    cursorCPS: 0.1,
    clicks: 0,
    grandmasOwned: 0,
    grandmaCPS: 1,
    farmsOwned: 0,
    farmCPS: 8,
    minesOwned: 0,
    mineCPS: 47,
    factoriesOwned: 0,
    factoryCPS: 260
}

function numberWithCommas(x) { //Function from https://stackoverflow.com/a/2901298
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function returnCursorPrice() {
    return parseInt(Math.floor(10 + gameState.cursorsOwned * 2 * (gameState.cursorsOwned / 10)))
}

function returnGrandmaPrice() {
    return parseInt(Math.floor(100 + gameState.grandmasOwned * 2 * (gameState.grandmasOwned / 8)))
}

function returnFarmPrice() {
    return parseInt(Math.floor(1100 + gameState.farmsOwned * 2 * (gameState.farmsOwned / 6)))
}

function returnMinePrice() {
    return parseInt(Math.floor(12000 + gameState.minesOwned * 2 * (gameState.minesOwned / 4)))
}

function returnFactoryPrice() {
    return parseInt(Math.floor(130_000 + gameState.factoriesOwned * 2 * (gameState.factoriesOwned / 2)))
}

function isCursorAffordable() {
    const cursorPrice = returnCursorPrice()
    return gameState.cookies >= cursorPrice
}

function isGrandmaAffordable() {
    const grandmaPrice = returnGrandmaPrice()
    return gameState.cookies >= grandmaPrice
}

function isFarmAffordable() {
    const farmPrice = returnFarmPrice()
    return gameState.cookies >= farmPrice
}

function isMineAffordable() {
    const minePrice = returnMinePrice()
    return gameState.cookies >= minePrice
}

function isFactoryAffordable() {
    const factoryPrice = returnFactoryPrice()
    return gameState.cookies >= factoryPrice
}

function buyCursor() {
    let cursorPrice = returnCursorPrice()
    if (isCursorAffordable()) {
        updateCookies(-cursorPrice)
        gameState.cursorsOwned += 1
        refreshCursorValues()
        calculateCPS()
    }
    //If the cursor is not affordable, do not do anything.
}

function buyGrandma() {
    let grandmaPrice = returnGrandmaPrice()
    if (isGrandmaAffordable()) {
        updateCookies(-grandmaPrice)
        gameState.grandmasOwned += 1
        refreshGrandmaValues()
        calculateCPS()
    }
    //If the grandma is not affordable, do not do anything.
}

function buyFarm() {
    let farmPrice = returnFarmPrice()
    if (isFarmAffordable()) {
        updateCookies(-farmPrice)
        gameState.farmsOwned += 1
        refreshFarmValues()
        calculateCPS()
    }
    //If the farm is not affordable, do not do anything.
}

function buyMine() {
    let minePrice = returnMinePrice()
    if (isMineAffordable()) {
        updateCookies(-minePrice)
        gameState.minesOwned += 1
        refreshMineValues()
        calculateCPS()
    }
    //If the mine is not affordable, do not do anything.
}

function buyFactory() {
    let factoryPrice = returnFactoryPrice()
    if (isFactoryAffordable()) {
        updateCookies(-factoryPrice)
        gameState.factoriesOwned += 1
        refreshFactoryValues()
        calculateCPS()
    }
    //If the factory is not affordable, do not do anything.
}



function calculateCPS() {
    let cps = 0;
    cps += gameState.cursorsOwned * gameState.cursorCPS
    cps += gameState.grandmasOwned * gameState.grandmaCPS
    cps += gameState.farmsOwned * gameState.farmCPS
    cps += gameState.minesOwned * gameState.mineCPS
    cps += gameState.factoriesOwned * gameState.factoryCPS
    gameState.CPS = cps;
    document.getElementById('cps-amount').textContent = `${cps.toFixed(1)} CPS`
}

function updateBuyItemContainersBasedOnAffordability() {
    const cursor = document.getElementById('buy-cursor-container')
    const grandma = document.getElementById('buy-grandma-container')
    const farm = document.getElementById('buy-farm-container')
    const mine = document.getElementById('buy-mine-container')
    const factory = document.getElementById('buy-factory-container')
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
    if (!isFarmAffordable()) {
        farm.classList.add('not-affordable')
    } else {
        farm.classList.remove('not-affordable')
    }
    if (!isMineAffordable()) {
        mine.classList.add('not-affordable')
    } else {
        mine.classList.remove('not-affordable')
    }
    if (!isFactoryAffordable()) {
        factory.classList.add('not-affordable')
    } else {
        factory.classList.remove('not-affordable')
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
    message.style.top = `${e.clientY - 30}px`
    message.style.left = `${e.clientX + (Math.random() * 30) - 30}px`
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

//Adds 1/20th of the Cookies Per Second to the cookies amount every 1/20th of a second.
//The reason 1/20th of the CPS is getting added every 1/20th of a second is because it makes the game feel smoother and more responsive.
//Instead of updating the cookie count once every second, it updates it 20 times a second.
//This makes the game look and feel smoother and faster.
const CPSInterval = setInterval(() => {
    updateCookies(gameState.CPS / 20)
}, 50)

window.addEventListener('beforeunload', (e) => { //Save game state when closing tab / quitting browser etc.
    localStorage.setItem('gameState', JSON.stringify(gameState))
})

function refreshCursorValues() {
    document.getElementById('cursor-amount').textContent = gameState.cursorsOwned
    const cursorPrice = returnCursorPrice()
    document.getElementById('cursor-price').textContent = `${numberWithCommas(cursorPrice)} Cookies`
}

function refreshGrandmaValues() {
    document.getElementById('grandma-amount').textContent = gameState.grandmasOwned
    const grandmaPrice = returnGrandmaPrice()
    document.getElementById('grandma-price').textContent = `${numberWithCommas(grandmaPrice)} Cookies`
}

function refreshFarmValues() {
    document.getElementById('farm-amount').textContent = gameState.farmsOwned
    const farmPrice = returnFarmPrice()
    document.getElementById('farm-price').textContent = `${numberWithCommas(farmPrice)} Cookies`
}

function refreshMineValues() {
    document.getElementById('mine-amount').textContent = gameState.minesOwned
    const minePrice = returnMinePrice()
    document.getElementById('mine-price').textContent = `${numberWithCommas(minePrice)} Cookies`
}

function refreshFactoryValues() {
    document.getElementById('factory-amount').textContent = gameState.factoriesOwned
    const factoryPrice = returnFactoryPrice()
    document.getElementById('factory-price').textContent = `${numberWithCommas(factoryPrice)} Cookies`
}

window.onload = () => { //Get saved game state and load it
    const previousGameState = localStorage.getItem('gameState')
    if (previousGameState) {
        //If a value isn't present in localStorage gameState but is meant to be in the game's gameState, fill it in here.
        //Values should only not be present if there has been an update to the game and localStorage hasn't been updated to have the new values yet.
        gameState = {...gameState, ...JSON.parse(previousGameState)}
        updateCookies(0) //Display amount of cookies and update item affordability
        calculateCPS() //Update CPS
        refreshCursorValues()
        refreshGrandmaValues()
        refreshFarmValues()
        refreshMineValues()
        refreshFactoryValues()
    }
}