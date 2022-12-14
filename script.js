let gameState = {
    cookies: 0,
    CPS: 0,
    clickAmount: 1,
    clickAmountMultiplier: 1,
    buyMultiplier: 1,
    cursorsOwned: 0,
    cursorCPS: 0.1,
    cursorCPSMultiplier: 1,
    nonCursorBuildingsCursorCPSMultiplier: 0,
    clicks: 0,
    grandmasOwned: 0,
    grandmaCPS: 1,
    grandmaCPSMultiplier: 1,
    farmsOwned: 0,
    farmCPS: 8,
    farmCPSMultiplier: 1,
    minesOwned: 0,
    mineCPS: 47,
    mineCPSMultiplier: 1,
    factoriesOwned: 0,
    factoryCPS: 260,
    factoryCPSMultiplier: 1,
    banksOwned: 0,
    bankCPS: 1400,
    bankCPSMultiplier: 1,
    templesOwned: 0,
    templeCPS: 7800,
    templeCPSMultiplier: 1,
    upgradesApplied: []
}
const defaultGameState = structuredClone(gameState)

let timeTabUnfocused;
let currentlyHoveringOverItem;
let CPSInterval;
let goldenCookieTimeout;
let goldenCookieVisible;
let fadeOutGoldenCookieTimeout;
let hideGoldenCookieTimeout;
let goldenCookieCPSMultiplier = 1;

const upgrades = [
    {
        name: 'Reinforced Index Finger',
        description: 'The mouse and cursors are <b>twice</b> as efficient.',
        quote: 'prod prod',
        price: 100,
        requirements: {
            cursorsOwned: 1
        },
        benefits: {
            multiply: {
                clickAmountMultiplier: 2,
                cursorCPSMultiplier: 2
            }
        },
        imageSrc: 'images/upgrades/cursor/ReinforcedIndexFinger.webp',
        id: 0
    },
    {
        name: 'Carpal Tunnel Prevention Cream',
        description: 'The mouse and cursors are <b>twice</b> as efficient.',
        quote: 'it... it hurts to click...',
        price: 500,
        requirements: {
            cursorsOwned: 1
        },
        benefits: {
            multiply: {
                clickAmountMultiplier: 2,
                cursorCPSMultiplier: 2
            }
        },
        imageSrc: 'images/upgrades/cursor/CarpalTunnelPreventionCream.webp',
        id: 1
    },
    {
        name: 'Ambidextrous',
        description: 'The mouse and cursors are <b>twice</b> as efficient.',
        quote: 'Look ma, both hands!',
        price: 10_000,
        requirements: {
            cursorsOwned: 10
        },
        benefits: {
            multiply: {
                clickAmountMultiplier: 2,
                cursorCPSMultiplier: 2
            }
        },
        imageSrc: 'images/upgrades/cursor/Ambidextrous.webp',
        id: 2
    },
    {
        name: 'Thousand Fingers',
        description: 'The mouse and cursors gain <b>+0.1</b> cookies per non-cursor item owned',
        quote: 'clickity',
        price: 100_000,
        requirements: {
            cursorsOwned: 25
        },
        benefits: {
            add: {
                nonCursorBuildingsCursorCPSMultiplier: 0.1
            }
        },
        imageSrc: 'images/upgrades/cursor/ThousandFingers.webp',
        id: 3
    },
    {
        name: 'Million Fingers',
        description: 'Multiplies the gain from Thousand Fingers by <b>5</b>',
        quote: 'clickityclickity',
        price: 10_000_000,
        requirements: {
            cursorsOwned: 50
        },
        upgradeRequirements: [3],
        benefits: {
            multiply: {
                nonCursorBuildingsCursorCPSMultiplier: 5
            }
        },
        imageSrc: 'images/upgrades/cursor/MillionFingers.webp',
        id: 4
    },
    {
        name: 'Billion Fingers',
        description: 'Multiplies the gain from Thousand Fingers by <b>10</b>',
        quote: 'clickityclickityclickity',
        price: 100_000_000,
        requirements: {
            cursorsOwned: 100
        },
        upgradeRequirements: [3],
        benefits: {
            multiply: {
                nonCursorBuildingsCursorCPSMultiplier: 10
            }
        },
        imageSrc: 'images/upgrades/cursor/BillionFingers.webp',
        id: 5
    },
    {
        name: 'Trillion Fingers',
        description: 'Multiplies the gain from Thousand Fingers by <b>20</b>',
        quote: 'clickityclickityclickityclickity',
        price: 1_000_000_000,
        requirements: {
            cursorsOwned: 150
        },
        upgradeRequirements: [3],
        benefits: {
            multiply: {
                nonCursorBuildingsCursorCPSMultiplier: 20
            }
        },
        imageSrc: 'images/upgrades/cursor/TrillionFingers.webp',
        id: 6
    },
    {
        name: 'Quadrillion Fingers',
        description: 'Multiplies the gain from Thousand Fingers by <b>20</b>',
        quote: 'clickityclickityclickityclickityclickity',
        price: 10_000_000_000,
        requirements: {
            cursorsOwned: 200
        },
        upgradeRequirements: [3],
        benefits: {
            multiply: {
                nonCursorBuildingsCursorCPSMultiplier: 20
            }
        },
        imageSrc: 'images/upgrades/cursor/QuadrillionFingers.webp',
        id: 7
    },
    {
        name: 'Quintillion Fingers',
        description: 'Multiplies the gain from Thousand Fingers by <b>20</b>',
        quote: "man, just go click click click click click, it's real easy, man.",
        price: 10_000_000_000_000, //10 trillion
        requirements: {
            cursorsOwned: 250
        },
        upgradeRequirements: [3],
        benefits: {
            multiply: {
                nonCursorBuildingsCursorCPSMultiplier: 20
            }
        },
        imageSrc: 'images/upgrades/cursor/QuintillionFingers.webp',
        id: 8
    }
]
let upgradesBeingRendered = []

function randomIntFromInterval(min, max) { // Function from https://stackoverflow.com/a/7228322
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

function checkAvailableUpgrades() {
    //Get an array of upgrades the player has not unlocked
    //by searching through the upgrades array and seeing if the upgrade's id
    //is found in gameState.upgradesApplied
    const upgradesToGet = upgrades.filter(upgrade => !gameState.upgradesApplied.includes(upgrade.id))
    const availableUpgrades = []
    for (const upgrade of upgradesToGet) {
        //Get the requirements of the upgrade
        let requirementsMet = true;
        for ([requirementKey, requirementValue] of Object.entries(upgrade.requirements)) {
            if (gameState[requirementKey] >= requirementValue) {
                //Requirement is met
            } else {
                //Requirement is not met
                requirementsMet = false;
                break;
            }
        }
        if (upgrade.upgradeRequirements) {
            for (const requiredUpgrade of upgrade.upgradeRequirements) {
                if (gameState.upgradesApplied.includes(requiredUpgrade)) {
                    //Requirement is met
                } else {
                    requirementsMet = false;
                    break;
                }
            }
        }
        if (!requirementsMet) {
            //Skip adding this upgrade to the availableUpgrades array as it's requirements
            //have not been met
            continue;
        }
        //If all requirements have been met
        //add upgrade to the available upgrades array
        availableUpgrades.unshift(upgrade)
    }
    //Check the affordability for all available upgrades
    checkUpgradesAffordability(availableUpgrades)
}

function checkUpgradesAffordability(upgrades) {
    //Checks affordability for an array of upgrades and then renders the upgrades

    //Sort upgrades by price
    upgrades.sort((a, b) => a.price - b.price)

    //Return a new array with the upgrades
    //Each upgrade in the array will have an affordable property
    //And it's value will be true if the player can afford it
    //And false if the player can't afford it
    const upgradesWithAffordabilityAdded = upgrades.map(upgrade => {
        const affordable = gameState.cookies >= upgrade.price
        upgrade.affordable = affordable
        return upgrade
    })

    //Now render the upgrades
    renderUpgrades(upgradesWithAffordabilityAdded)
}

function renderUpgrades(upgrades) {
    const newUpgradesToRender = upgrades.filter(upgrade => !upgradesBeingRendered.includes(upgrade.id))
    const upgradeTemplate = document.getElementById('upgrade-template')
    const upgradesContainer = document.getElementById('buy-upgrades-container')
    const alreadyRenderedUpgrades = upgradesBeingRendered.map(upgradeId => upgrades[upgrades.findIndex(upgrade => upgrade.id === upgradeId)])
    if (alreadyRenderedUpgrades.length) {
        for (const upgrade of alreadyRenderedUpgrades) {
            if (!upgrade) break;
            const upgradeElement = document.getElementById(`upgrade-id-${upgrade.id}`)
            if (upgradeElement) {
                const affordable = gameState.cookies >= upgrade.price
                if (affordable) {
                    upgradeElement.classList.remove('not-affordable')
                } else {
                    upgradeElement.classList.add('not-affordable')
                }
            }
        }
    }
    if (newUpgradesToRender.length) {
        for (const upgrade of newUpgradesToRender) {
            const upgradeDiv = upgradeTemplate.content.querySelector('div').cloneNode(true)
            const id = `upgrade-id-${upgrade.id}`
            upgradeDiv.style.backgroundImage = `url(${upgrade.imageSrc})`
            upgradeDiv.id = id;
            upgradeDiv.setAttribute('onclick', `buyUpgrade("${id}")`)
            console.log(upgrade.affordable)
            if (upgrade.affordable) {
                upgradeDiv.classList.remove('not-affordable')
            } else {
                upgradeDiv.classList.add('not-affordable')
            }
            upgradesContainer.appendChild(upgradeDiv)
            upgradesBeingRendered.push(upgrade.id)
            upgradeDiv.addEventListener('mouseenter', (e) => handleHoverOverUpgrades(e, id))
            upgradeDiv.addEventListener('mouseleave', handleHoverLeaveUpgrades)
        }
    }
}

function buyUpgrade(upgradeBuyContainerId) {
    const upgradeId = parseInt(upgradeBuyContainerId.split('-')[2])
    const upgradeToBuy = upgrades[upgradeId]
    const affordable = gameState.cookies >= upgradeToBuy.price
    const benefits = upgradeToBuy.benefits
    const upgradeBuyContainer = document.getElementById(upgradeBuyContainerId)
    if (affordable) {
        console.log('Affordable')
        if (benefits.multiply) {
            for (const [key, value] of Object.entries(benefits.multiply)) {
                gameState[key] *= value
            }
        }
        if (benefits.add) {
            for (const [key, value] of Object.entries(benefits.add)) {
                gameState[key] += value
            }
        }
        //Benefits have been added, so now remove upgrade
        upgradesBeingRendered.splice(upgradesBeingRendered.findIndex(upgradeID => upgradeID === upgradeId), 1) //Removes the upgrade from the upgradesBeingRendered array
        gameState.upgradesApplied.push(upgradeId) //Add the upgrade to the upgradesApplied array
        upgradeBuyContainer.remove() //Remove upgrade buy container as it has been bought
        removeUpgradeInfoContainer() //Remove upgrade info container as the upgrade has been bought
        updateCookies(-upgradeToBuy.price)//Take away cost of upgrade from cookie amount
        calculateCPS() //Recalculate CPS
        console.log(document.querySelectorAll('.upgrade-item:hover'))
    }

    //If the upgrade is not affordable, do nothing.
}

function returnNonCursorObjects() {
    return gameState.grandmasOwned +
    gameState.farmsOwned +
    gameState.minesOwned +
    gameState.factoriesOwned +
    gameState.banksOwned +
    gameState.templesOwned
}

function removeElementChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.lastChild)
    }
}

function stopRenderingAllUpgrades() {
    const upgradeContainer = document.getElementById('buy-upgrades-container')
    removeElementChildren(upgradeContainer)
    upgradesBeingRendered = []
}

function numberWithCommas(x) { //Function from https://stackoverflow.com/a/2901298
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function returnCursorPrice() {
    //Initial price is 10
    return Math.floor(10 * gameState.buyMultiplier + ((gameState.cursorsOwned + 1) * gameState.buyMultiplier) * 2 * ((gameState.cursorsOwned + gameState.buyMultiplier) / 10))
}

function returnGrandmaPrice() {
    //Initial price is 100
    return Math.floor(100 * gameState.buyMultiplier + ((gameState.grandmasOwned + 1) * gameState.buyMultiplier) * 2 * ((gameState.grandmasOwned + gameState.buyMultiplier) / 8))
}

function returnFarmPrice() {
    //Initial price is 1,100
    return Math.floor(1100 * gameState.buyMultiplier + ((gameState.farmsOwned + 1) * gameState.buyMultiplier) * 2 * ((gameState.farmsOwned + gameState.buyMultiplier) / 6))
}

function returnMinePrice() {
    //Initial price is 12,000
    return Math.floor(12000 * gameState.buyMultiplier + ((gameState.minesOwned + 1) * gameState.buyMultiplier) * 2 * ((gameState.minesOwned + gameState.buyMultiplier) / 4))
}

function returnFactoryPrice() {
    //Initial price is 130,000
    return Math.floor(129_999 * gameState.buyMultiplier + ((gameState.factoriesOwned + 1) * gameState.buyMultiplier) * 2 * ((gameState.factoriesOwned + gameState.buyMultiplier) / 2))
}

function returnBankPrice() {
    //Initial price is 1,400,000
    return Math.floor(1_399_996 * gameState.buyMultiplier + (((gameState.banksOwned + 1) * gameState.buyMultiplier) * 2 * ((gameState.banksOwned + gameState.buyMultiplier) * 2)))
}

function returnTemplePrice() {
    //Initial price is 20 million
    return Math.floor(19_999_992 * gameState.buyMultiplier + (((gameState.templesOwned + 1) * gameState.buyMultiplier) * 2 * ((gameState.templesOwned + gameState.buyMultiplier) * 4)))
}

function returnCursorCPS() {
    return (gameState.cursorCPS * gameState.cursorCPSMultiplier + (gameState.nonCursorBuildingsCursorCPSMultiplier * returnNonCursorObjects())) * goldenCookieCPSMultiplier
}

function returnGrandmaCPS() {
    return gameState.grandmaCPS * gameState.grandmaCPSMultiplier * goldenCookieCPSMultiplier
}

function returnFarmCPS() {
    return gameState.farmCPS * gameState.farmCPSMultiplier * goldenCookieCPSMultiplier
}

function returnMineCPS() {
    return gameState.mineCPS * gameState.mineCPSMultiplier * goldenCookieCPSMultiplier
}

function returnFactoryCPS() {
    return gameState.factoryCPS * gameState.factoryCPSMultiplier * goldenCookieCPSMultiplier
}

function returnBankCPS() {
    return gameState.bankCPS * gameState.bankCPSMultiplier * goldenCookieCPSMultiplier
}

function returnTempleCPS() {
    return gameState.templeCPS * gameState.templeCPSMultiplier * goldenCookieCPSMultiplier
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

function isBankAffordable() {
    const bankPrice = returnBankPrice()
    return gameState.cookies >= bankPrice
}

function isTempleAffordable() {
    const templePrice = returnTemplePrice()
    return gameState.cookies >= templePrice
}

function buyCursor() {
    let cursorPrice = returnCursorPrice()
    if (isCursorAffordable()) {
        updateCookies(-cursorPrice)
        gameState.cursorsOwned += gameState.buyMultiplier
        refreshCursorValues()
        calculateCPS()
    }
    //If the cursor is not affordable, do not do anything.
}

function buyGrandma() {
    let grandmaPrice = returnGrandmaPrice()
    if (isGrandmaAffordable()) {
        updateCookies(-grandmaPrice)
        gameState.grandmasOwned += gameState.buyMultiplier
        refreshGrandmaValues()
        calculateCPS()
    }
    //If the grandma is not affordable, do not do anything.
}

function buyFarm() {
    let farmPrice = returnFarmPrice()
    if (isFarmAffordable()) {
        updateCookies(-farmPrice)
        gameState.farmsOwned += gameState.buyMultiplier
        refreshFarmValues()
        calculateCPS()
    }
    //If the farm is not affordable, do not do anything.
}

function buyMine() {
    let minePrice = returnMinePrice()
    if (isMineAffordable()) {
        updateCookies(-minePrice)
        gameState.minesOwned += gameState.buyMultiplier
        refreshMineValues()
        calculateCPS()
    }
    //If the mine is not affordable, do not do anything.
}

function buyFactory() {
    let factoryPrice = returnFactoryPrice()
    if (isFactoryAffordable()) {
        updateCookies(-factoryPrice)
        gameState.factoriesOwned += gameState.buyMultiplier
        refreshFactoryValues()
        calculateCPS()
    }
    //If the factory is not affordable, do not do anything.
}

function buyBank() {
    let bankPrice = returnBankPrice()
    if (isBankAffordable()) {
        updateCookies(-bankPrice)
        gameState.banksOwned += gameState.buyMultiplier
        refreshBankValues()
        calculateCPS()
    }
    //If the bank is not affordable, do not do anything.
}

function buyTemple() {
    let templePrice = returnTemplePrice()
    if (isTempleAffordable()) {
        updateCookies(-templePrice)
        gameState.templesOwned += gameState.buyMultiplier
        refreshTempleValues()
        calculateCPS()
    }
    //If the temple is not affordable, do not do anything.
}



function calculateCPS() {
    let cps = 0;
    cps += gameState.cursorsOwned * returnCursorCPS()
    cps += gameState.grandmasOwned * returnGrandmaCPS()
    cps += gameState.farmsOwned * returnFarmCPS()
    cps += gameState.minesOwned * returnMineCPS()
    cps += gameState.factoriesOwned * returnFactoryCPS()
    cps += gameState.banksOwned * returnBankCPS()
    cps += gameState.templesOwned * returnTempleCPS()
    gameState.CPS = cps;
    document.getElementById('cps-amount').textContent = `${numberWithCommas(cps.toFixed(1))} CPS`
    if (currentlyHoveringOverItem) {
        //If the player bought an item, and is hovering over that item, update the preview CPS values.
        handleHoverOverItems(currentlyHoveringOverItem)
    }
}

function updateBuyItemContainersBasedOnAffordability() {
    const cursor = document.getElementById('buy-cursor-container')
    const grandma = document.getElementById('buy-grandma-container')
    const farm = document.getElementById('buy-farm-container')
    const mine = document.getElementById('buy-mine-container')
    const factory = document.getElementById('buy-factory-container')
    const bank = document.getElementById('buy-bank-container')
    const temple = document.getElementById('buy-temple-container')
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
    if (!isBankAffordable()) {
        bank.classList.add('not-affordable')
    } else {
        bank.classList.remove('not-affordable')
    }
    if (!isTempleAffordable()) {
        temple.classList.add('not-affordable')
    } else {
        temple.classList.remove('not-affordable')
    }
}

function updateCookies(amount) {
    gameState.cookies += amount;
    const flooredCookies = Math.floor(gameState.cookies)
    const cookieNumberWithCommas = numberWithCommas(flooredCookies)
    document.title = `${cookieNumberWithCommas} Cookies`
    document.getElementById('cookie-amount').textContent = `${cookieNumberWithCommas} Cookies`
    updateBuyItemContainersBasedOnAffordability()
    checkAvailableUpgrades()
}

function clickCookie(e) {
    gameState.clicks += 1
    const clickAmount = (gameState.clickAmount * gameState.clickAmountMultiplier + (gameState.nonCursorBuildingsCursorCPSMultiplier * returnNonCursorObjects())) * goldenCookieCPSMultiplier
    const addedCookiesTemplate = document.getElementById('added-cookies-from-click')
    const message = addedCookiesTemplate.content.querySelector('h2').cloneNode(true)
    const id = `${gameState.clicks.toString()}-add-cookies-message`;
    message.textContent = `+${numberWithCommas(clickAmount.toFixed(1))}`
    message.style.position = 'absolute'
    message.style.top = `${e.clientY - 30}px`
    message.style.left = `${e.clientX + (Math.random() * 30) - 30}px`
    message.style.zIndex = 2
    message.id = id
    document.body.appendChild(message)
    updateCookies(clickAmount)
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
function startCPSInterval() {
    return setInterval(() => {
        updateCookies(gameState.CPS / 20)
    }, 50)
}

function handleWindowBlur() {
    if (CPSInterval) {
        //Pause CPS Timer
        clearInterval(CPSInterval)
        CPSInterval = undefined;
    }
    document.title = 'Cookie Clicker'
    timeTabUnfocused = Date.now()
    document.getElementById('cookie-amount').textContent = 'Game Unfocused'
    document.getElementById('cps-amount').textContent = 'CPS is still being added'
    if (goldenCookieTimeout) {
        clearTimeout(goldenCookieTimeout)
        goldenCookieTimeout = undefined;
    }
}

function handleWindowFocus() {
    addCookieFromUnfocusedPeriod(false)
    if (!goldenCookieTimeout) {
        goldenCookieTimeout = returnGoldenCookieSetTimeout()
    }
}

function addCookieFromUnfocusedPeriod(browserClosing) {
    if (timeTabUnfocused) {
        const millisecondsAwayFromGame = Date.now() - timeTabUnfocused;
        const secondsAwayFromGame = millisecondsAwayFromGame / 1000;
        timeTabUnfocused = undefined;
        updateCookies(gameState.CPS * secondsAwayFromGame)
        if (!browserClosing) {
            if (!CPSInterval) {
                CPSInterval = startCPSInterval()
            }
            calculateCPS()
        }
    }
}

//When the player is no longer on the cookie clicker tab, run the handleWindowBlur function
window.onblur = handleWindowBlur

//When the player comes back on the tab, run the addCookieFromUnfocusedPeriod function
window.onfocus = handleWindowFocus

window.addEventListener('beforeunload', (e) => { 
    //Add cookies received while tab was closed and then
    //save game state when closing tab / quitting browser etc.
    addCookieFromUnfocusedPeriod(true)
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

function refreshBankValues() {
    document.getElementById('bank-amount').textContent = gameState.banksOwned
    const bankPrice = returnBankPrice()
    document.getElementById('bank-price').textContent = `${numberWithCommas(bankPrice)} Cookies`
}

function refreshTempleValues() {
    document.getElementById('temple-amount').textContent = gameState.templesOwned
    const templePrice = returnTemplePrice()
    document.getElementById('temple-price').textContent = `${numberWithCommas(templePrice)} Cookies`
}

function refreshItemValues() {
    refreshCursorValues()
    refreshGrandmaValues()
    refreshFarmValues()
    refreshMineValues()
    refreshFactoryValues()
    refreshBankValues()
    refreshTempleValues()
}

function refreshGame() {
    updateCookies(0) //Display amount of cookies and update item affordability
    calculateCPS() //Update CPS
    //Update buyMultiplier to reflect saved game state, and also refresh item values to reflect saved game state
    //Item values get updated in changeBuyMultiplier() after the multiplier has been set
    changeBuyMultiplier(gameState.buyMultiplier)
}

window.onload = () => { //Get saved game state and load it
    const previousGameState = localStorage.getItem('gameState')
    if (previousGameState) {
        //If a value isn't present in localStorage gameState but is meant to be in the game's gameState, fill it in here.
        //Values should only not be present if there has been an update to the game and localStorage hasn't been updated to have the new values yet.
        gameState = {...structuredClone(defaultGameState), ...JSON.parse(previousGameState)}
        //Refresh game values
        refreshGame()
    }
    //Start CPS Interval if the window is focused, and if the window isn't focused, set timeTabUnfocused to the current time
    if (document.visibilityState === 'hidden') {
        handleWindowBlur()
    } else {
        CPSInterval = startCPSInterval()
    }
}

function changeBuyMultiplier(multiplier) {
    const selectedMultiplier = Array.from(document.getElementsByClassName('selected-multiplier'))[0]
    const multiplierToSelect = document.getElementById(`${multiplier}x-multiplier`)
    if (multiplierToSelect) {
        selectedMultiplier.classList.remove('selected-multiplier')
        multiplierToSelect.classList.add('selected-multiplier')
        gameState.buyMultiplier = multiplier
        refreshItemValues()
    } else {
        console.error(`${multiplier} is not a valid multiplier`)
    }
}

function handleHoverOverItems(id) {
    console.log('Hovered on item with id ', id)
    currentlyHoveringOverItem = id;
    const CPSAmountDisplay = document.getElementById('cps-amount');
    const extraCPSDisplay = document.getElementById('extra-cps-amount');
    let extraCPS = 0;
    let itemContainerName = id.split('-')[1]
    switch(itemContainerName) {
        case 'cursor':
            extraCPS += returnCursorCPS() * gameState.buyMultiplier;
            break;
        case 'grandma':
            extraCPS += (returnGrandmaCPS() + gameState.nonCursorBuildingsCursorCPSMultiplier * gameState.cursorsOwned) * gameState.buyMultiplier;
            break;
        case 'farm':
            extraCPS += (returnFarmCPS() + gameState.nonCursorBuildingsCursorCPSMultiplier * gameState.cursorsOwned) * gameState.buyMultiplier;
            break;
        case 'mine':
            extraCPS += (returnMineCPS() + gameState.nonCursorBuildingsCursorCPSMultiplier * gameState.cursorsOwned) * gameState.buyMultiplier;
            break;
        case 'factory':
            extraCPS += (returnFactoryCPS() + gameState.nonCursorBuildingsCursorCPSMultiplier * gameState.cursorsOwned) * gameState.buyMultiplier;
            break;
        case 'bank':
            extraCPS += (returnBankCPS() + gameState.nonCursorBuildingsCursorCPSMultiplier * gameState.cursorsOwned) * gameState.buyMultiplier;
            break;
        case 'temple':
            extraCPS += (returnTempleCPS() + gameState.nonCursorBuildingsCursorCPSMultiplier * gameState.cursorsOwned) * gameState.buyMultiplier;
            break;
        default:
            console.error('Hovered over invalid item:', itemContainerName)
    }
    const newCPS = gameState.CPS + extraCPS
    CPSAmountDisplay.textContent = `${numberWithCommas(newCPS.toFixed(1))} CPS`
    CPSAmountDisplay.style.color = 'goldenrod'
    CPSAmountDisplay.style.animation = 'fade-in-and-out 700ms infinite'
    extraCPSDisplay.textContent = `+${numberWithCommas(extraCPS.toFixed(1))} CPS`
    extraCPSDisplay.style.color = 'goldenrod'
    extraCPSDisplay.style.animation = 'fade-in-and-out 700ms infinite'
}

function handleHoverLeaveItems() {
    console.log('Mouse left element')
    const CPSAmountDisplay = document.getElementById('cps-amount');
    const extraCPSDisplay = document.getElementById('extra-cps-amount');
    CPSAmountDisplay.style.color = 'black'
    CPSAmountDisplay.style.animation = 'none'
    CPSAmountDisplay.textContent = `${numberWithCommas(gameState.CPS.toFixed(1))} CPS`
    extraCPSDisplay.textContent = ''
    extraCPSDisplay.style.color = 'black'
    extraCPSDisplay.style.animation = 'none'
    currentlyHoveringOverItem = undefined;
}

function handleHoverOverUpgrades(e) {
    console.log(e)
    const upgradeData = upgrades[parseInt(e.target.id.split('-')[2])]
    console.log(upgradeData)
    const top = e.target.clientHeight + (e.target.offsetTop / 4)
    const left = document.getElementById('buy-container').offsetLeft - 500
    const upgradeInfoTemplate = document.getElementById('upgrade-info-template')
    const upgradeInfoDiv = upgradeInfoTemplate.content.querySelector('div').cloneNode(true)
    upgradeInfoDiv.style.position = 'absolute'
    upgradeInfoDiv.style.top = top + 'px';
    upgradeInfoDiv.style.left = left + 'px';
    upgradeInfoDiv.querySelector('#upgrade-name').textContent = upgradeData.name
    upgradeInfoDiv.querySelector('#upgrade-price').textContent = numberWithCommas(upgradeData.price)
    upgradeInfoDiv.querySelector('#upgrade-description').innerHTML = upgradeData.description
    upgradeInfoDiv.querySelector('#upgrade-quote').textContent = upgradeData.quote
    document.body.appendChild(upgradeInfoDiv)
}

function removeUpgradeInfoContainer() {
    const elementToRemove = document.getElementById('upgrade-info-container')
    if (elementToRemove) {
        elementToRemove.remove()
    }
}

function handleHoverLeaveUpgrades() {
   removeUpgradeInfoContainer()
}

//Loop over every buy container and add hover listeners to them
for (let buyElement of Array.from(document.getElementsByClassName('item-buy-container'))) {
    buyElement.addEventListener('mouseenter', () => handleHoverOverItems(buyElement.id))
    buyElement.addEventListener('mouseleave', handleHoverLeaveItems)
}

function resetGame() {
    localStorage.clear()
    //Deep clone default game state
    gameState = structuredClone(defaultGameState)
    refreshGame()
    stopRenderingAllUpgrades()
}

function handleGoldenCookieClick() {
    const goldenCookie = document.getElementById('golden-cookie');
    goldenCookie.style.animation = 'golden-cookie-fade-out 3s forwards';
    goldenCookie.classList.add('not-clickable')
    console.log('golden cookie click event fired')
    if (fadeOutGoldenCookieTimeout) {
        clearTimeout(fadeOutGoldenCookieTimeout)
        fadeOutGoldenCookieTimeout = undefined;
    }
    if (hideGoldenCookieTimeout) {
        clearTimeout(hideGoldenCookieTimeout);
        hideGoldenCookieTimeout = undefined;
    }
    setTimeout(() => {
        //After fade out animation has finished, hide the golden cookie
        goldenCookie.style.display = 'none';
        goldenCookieVisible = true;
        goldenCookie.classList.remove('not-clickable')
        goldenCookieVisible = false;
    }, 3000);
    const actionNumber = randomIntFromInterval(1, 2)
    let prizeMessage;
    if (actionNumber === 1) {
        const secondsOfCookies = randomIntFromInterval(20, 100)
        const cookiesToEarn = gameState.CPS * secondsOfCookies
        updateCookies(cookiesToEarn)
        prizeMessage = `You earnt ${secondsOfCookies} seconds worth of cookies (${numberWithCommas(cookiesToEarn.toFixed(0))} cookies)`
    } else if (actionNumber === 2) {
        const cookieAmount = document.getElementById('cookie-amount')
        const CPSAmount = document.getElementById('cps-amount')
        goldenCookieCPSMultiplier = 7;
        prizeMessage = `CPS and Cookies per Click are multiplied by 7 for 120 seconds!`
        calculateCPS()
        cookieAmount.classList.add('golden-cookie-multiplier-flash')
        CPSAmount.classList.add('golden-cookie-multiplier-flash')

        let multiplierSecondsLeft = 120;
        const multiplierTimeLeftMessage = document.getElementById('multiplier-time-left')
        multiplierTimeLeftMessage.textContent = '7x multiplier for 120 more seconds'
        const countdownInterval = setInterval(() => {
            multiplierSecondsLeft -= 1;
            multiplierTimeLeftMessage.textContent = `7x multiplier for ${multiplierSecondsLeft} more seconds`
        }, 1000);

        setTimeout(() => {
            //After 120 seconds, clear all of the golden cookie benefits
            multiplierTimeLeftMessage.textContent = ''
            clearInterval(countdownInterval)
            cookieAmount.classList.remove('golden-cookie-multiplier-flash')
            CPSAmount.classList.remove('golden-cookie-multiplier-flash')
            goldenCookieCPSMultiplier = 1;
            calculateCPS()
        }, 120000);
    }

    const prizeMessageTemplate = document.getElementById('golden-cookie-prize-display-template')
    const prizeMessageContainer = prizeMessageTemplate.content.querySelector('div').cloneNode(true)
    prizeMessageContainer.querySelector('#golden-cookie-prize-message').textContent = prizeMessage
    document.body.appendChild(prizeMessageContainer)
    setTimeout(() => {
            prizeMessageContainer.style.animation = 'hide-golden-cookie-prize-message 3s forwards';
    }, 5000);
    setTimeout(() => {
        prizeMessageContainer.remove()
    }, 8000);
}

function renderGoldenCookie() {
    goldenCookieVisible = true;
    const goldenCookie = document.getElementById('golden-cookie');
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const top = Math.floor(Math.random() * (viewportHeight - 100));
    const left = Math.floor(Math.random() * (viewportWidth - 100));
    goldenCookie.style.display = 'inline';
    goldenCookie.style.top = top + 'px';
    goldenCookie.style.left = left + 'px';
    goldenCookie.style.animation = 'golden-cookie-fade-in 3s';
    fadeOutGoldenCookieTimeout = setTimeout(() => {
        //After 10 seconds fade out the golden cookie
        goldenCookie.style.animation = 'golden-cookie-fade-out 3s forwards';
    }, 10000)
    hideGoldenCookieTimeout = setTimeout(() => {
        //Once the golden cookie has finished the fade out animation, hide it
        goldenCookie.style.display = 'none'
        goldenCookieVisible = false;
        goldenCookie.classList.remove('not-clickable')
    }, 13000)
}

function returnGoldenCookieSetTimeout() {
    const timeoutTime = randomIntFromInterval(30, 300) * 1000 //Between 30 seconds and 5 minutes
    console.log('Next golden cookie will be in:', timeoutTime / 1000, 'seconds.')
    return setTimeout(() => {
        console.log('Timeout ended')
        if (!goldenCookieVisible && goldenCookieCPSMultiplier === 1) renderGoldenCookie()
        goldenCookieTimeout = returnGoldenCookieSetTimeout()
    }, timeoutTime);
}

goldenCookieTimeout = returnGoldenCookieSetTimeout()