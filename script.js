const pokeImg = document.querySelector('.imageArea img');
const answerIn = document.querySelector('input#answerIn');
const answerBtn = document.querySelector('button#answerBtn');
const nextPokeBtn = document.querySelector('.nextPoke');
const collectionArea = document.querySelector('.collectionArea')
const genDropBtn = document.querySelector('.genDropArea button')
const genChecks = document.querySelectorAll('.genCheck')
const count = document.querySelector('.count h2')
// TODO:
// make sure at least one gen checkbox is always checked
// make gen checkboxes functional
// when you check a gen checkbox, add that range of numbers to unguessed - any that are already in guessed
// when you uncheck a checkbox, remove any in that range from unchecked

const guessedPokes = []
let unguessedPokes = []
let currentPoke = 0
let currentTypeColors = []
let dropDownStatus = false

const typeColors = {
	normal: '#A8A77A',
	fire: '#EE8130',
	water: '#6390F0',
	electric: '#F7D02C',
	grass: '#7AC74C',
	ice: '#96D9D6',
	fighting: '#C22E28',
	poison: '#A33EA1',
	ground: '#E2BF65',
	flying: '#A98FF3',
	psychic: '#F95587',
	bug: '#A6B91A',
	rock: '#B6A136',
	ghost: '#735797',
	dragon: '#6F35FC',
	dark: '#705746',
	steel: '#B7B7CE',
	fairy: '#D685AD',
};
const generationRanges = {
    1: [1, 151],
    2: [152, 251],
    3: [252, 386],
    4: [387, 493],
    5: [494, 649],
    6: [650, 721],
    7: [722, 809],
    8: [810, 905],
    9: [906, 1025]
}
// Functions
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function addPokeRange(newRange){
    //update unguessedPokes with new range of numbers
    for (let i = newRange[0]; i < newRange[1] + 1; i++){
        unguessedPokes.push(i);
    }
}

function setType(){
    const config = {
        headers: {
            'Accept': 'application/json'
        }
    }
    fetch(`https://pokeapi.co/api/v2/pokemon/${currentPoke}/`, config)
        .then((response) => response.json())
        .then((data) => {
            console.log(data.types)
            let new_types = []
            new_types.push(typeColors[data.types[0].type.name]) 
            if (data.types.length == 2) {
                new_types.push(typeColors[data.types[1].type.name])
            }
            currentTypeColors = new_types
            setTypeBorderColor(pokeImg.parentNode);
        })
}

function setTypeBorderColor(element){
    // Takes an element and determines its border colors based on current type
    element.style.borderColor = currentTypeColors[0]
    if (currentTypeColors.length == 2) {
        element.style.outline = `.6rem solid ${currentTypeColors[1]}`
    } else {
        element.style.outline = 'none'
    }

}

function getRandomPokemon() {
    if(unguessedPokes.length == 0){
        console.log('You win!')
    }else{
        let unguessedIndex = Math.floor(Math.random() * unguessedPokes.length)
        currentPoke = unguessedPokes[unguessedIndex]
        setType();
        pokeImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentPoke}.png`
    }
}

function removePoke(id){
    //find id in unguessed and remove it without leaving Nan behind
    unguessedPokes = unguessedPokes.filter((poke) => {
        if(poke==id){console.log(`${poke} == ${id} returning ${poke != id}`)}
        return poke != id
    })
}

function nextPoke(){
    pokeImg.classList.remove('success')
    pokeImg.parentNode.classList.remove('success')
    sleep(300)
    getRandomPokemon()
    logState()
}

function logState(){
    console.log(`currentPoke: ${currentPoke}`);
    console.log(`unguessedPokes: ${unguessedPokes}`);
    console.log(`guessedPokes: ${guessedPokes}`);
}

function submitGuess(){
    let guess = answerIn.value;
    answerIn.value = '';
    console.log(guess);
    verifyGuess(guess);
}

function verifyGuess(guess) {
    const config = {
        headers: {
            'Accept': 'application/json'
        }
    }
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${currentPoke}/`, config)
        .then((response) => response.json())
        .then((data) => {
            let name = data.name.toLowerCase().replace('-f', '').replace('-m', '').replace('-', ' ')
            if(guess.toLowerCase() == name) {
                // SUCCESS LOGIC
                console.log("success")
                guessedPokes.push(currentPoke);
                removePoke(currentPoke);
                pokeImg.classList.add('success')
                pokeImg.parentNode.classList.add('success')
                addPokeToCollection()
                updateCount()
            } else {
                //FAILURE LOGIC
                console.log("failure")
                getRandomPokemon()
            }
        })
}

function addPokeToCollection(){
    const newPokeCard = document.createElement('div')
    newPokeCard.classList.add('pokeCard')
    const newPokeImg = document.createElement('img')
    newPokeImg.classList.add('capturedPokeImg')

    newPokeImg.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentPoke}.png`
    setTypeBorderColor(newPokeCard)
    newPokeCard.style.borderWidth = '.5rem'
    newPokeCard.style.outlineWidth = '.3rem'
    
    collectionArea.appendChild(newPokeCard)
    newPokeCard.appendChild(newPokeImg)
}
function updateDropDisplay(){
    //Set the img for the dropdown button based on dropDownStatus
    let chevronElement = genDropBtn.querySelector('i')
    if(dropDownStatus){
        chevronElement.className = 'fa-solid fa-chevron-up'
        genChecks.forEach((genCheck) => {
            genCheck.style.display = 'block'
        })
    }else {
        chevronElement.className = 'fa-solid fa-chevron-down'
        genChecks.forEach((genCheck) => {
            genCheck.style.display = 'none'
        })
    }
}
function areAllUnchecked(){
    let areUnchecked = true
    genChecks.forEach((genCheck)=> {
        let input = genCheck.querySelector('input')
        console.log(input.checked)
        if(input.checked) {
            areUnchecked = false
        }
    })
    return(areUnchecked)
}
function updateCount(){
    count.innerHTML = `${guessedPokes.length}/${unguessedPokes.length}`
}

function addGen(genNumber){
    genRange = generationRanges[genNumber]
    //loop through range, add poke only if it doesn't exist in guessed list
    for(let i = genRange[0]; i < genRange[1]+1; i++){
        let add = true
        for(let j = 0; j < unguessedPokes.length; j++) {
            if (unguessedPokes[j] == i){
                add = false
            }
        }
        if(add){
            unguessedPokes.push(i)
        }
    }
    updateCount()
}

function removeGen(genNumber){
    genRange = generationRanges[genNumber]
    for(let i = genRange[0]; i < genRange[1]+1; i++){
        removePoke(i)
    }
    //reroll current poke in case it was from removed gen
    getRandomPokemon()
    updateCount()
}



// Add eventListeners
answerBtn.addEventListener('click', () => {
    if(pokeImg.classList.contains('success')){
        nextPoke();
    }
    else{
        submitGuess();
    }
})
answerIn.addEventListener('keydown', (event) => {
    if(event.key === 'Enter'){
        if(pokeImg.classList.contains('success')){
            nextPoke();
        }
        else{
            submitGuess();
        }
    }
})
nextPokeBtn.addEventListener('click', () => {
    nextPoke()
})
genDropBtn.addEventListener('click', () => {
    genDropBtn.classList.toggle('active')
    dropDownStatus = !dropDownStatus
    updateDropDisplay()
})
genChecks.forEach((genCheck) => {
    let input = genCheck.querySelector('input')    
    input.addEventListener('input', () => {
        //check here if all others are unchecked, then if this too is unchecked, check it and continue
        if(areAllUnchecked()){
            console.log('here')
            input.checked = true
        }else {
            if(input.checked){
                //add associated range to unguessed - already guessed
                console.log(input.id)
                addGen(input.id)
            }else {
                //remove associated range from unguessed
                removeGen(input.id)
                console.log('unchecked')
            }
        }
    })
})

// Page logic
addPokeRange([1, 151])
getRandomPokemon()
updateDropDisplay()
updateCount()
logState()
