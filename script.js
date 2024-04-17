const url = "https://api.dictionaryapi.dev/api/v2/entries/en/";

let word = document.querySelector("#inp-word");
let result = document.querySelector(".result");
let search_btn = document.querySelector("#search-btn");
let sound = document.querySelector("#sound");
let microphone = document.querySelector("#mic");
let on = true;

const recognition = new webkitSpeechRecognition();
recognition.lang = 'en-US';
recognition.interimResults = true;
recognition.continuous = true;

function playSound() {
    sound.play();
}

function explore(url) {
    window.open(url, "_blank");
}

function voiceEnable() {
    if (on) {
        microphone.innerHTML = `<i class="fa-solid fa-microphone-slash"></i>`;
        recognition.start();
        recognition.onresult = event => {
            let text = event.results[event.results.length - 1][0].transcript;
            let str = text;
            if(str[str.length - 1] == "."){
                word.value = str.substring(0, str.length - 1);
            }
            else{
                word.value = str;
            }
            navigator.mediaDevices.getUserMedia({ audio: true });
        }
        on = false;
    } else {
        microphone.innerHTML = `<i class="fa-solid fa-microphone"></i>`;
        recognition.stop();
        on = true;
    }
}

function replaceData(data) {
    result.innerHTML = `
        <div class="word">
            <h3>${data[0].word}</h3>
            <button id="sound" onclick="playSound()">
                <i class="fas fa-volume-up"></i>
            </button>
        </div>
        <div class="details">
            <p>${data[0].meanings[0].partOfSpeech}</p>
            <p>${data[0].phonetics[0].text}</p>
        </div>
        <p class="word-meaning">${data[0].meanings[0].definitions[0].definition}</p>
        <p class="word-example">${data[0].meanings[0].definitions[0].example || ""}</p>
        <button id="read-more" onclick="explore('${data[0].sourceUrls[0]}')">Read more</button>`;

    for (let i = 0; i < data[0].phonetics.length; i++) {
        if (data[0].phonetics[i].audio !== '') {
            sound.setAttribute("src", `${data[0].phonetics[i].audio}`);
            break;
        }
    }
}

async function fetchData(inp_word) {
    try {
        let response = await fetch(url + inp_word);
        if (!response.ok) {
            throw new Error("No Definitions Found");
        }
        let data = await response.json();
        if (data.title && data.title === "No Definitions Found") {
            result.innerHTML = `
            <div class="result">
                <h3 id="error">No definitions found for "${inp_word}". Please try another word.</h3>
            </div>`;
        } else {
            replaceData(data);
        }
    } catch (error) {
        if (error.message === "No Definitions Found") {
            result.innerHTML = `
            <div class="result">
                <h3 id="error">No definitions found for "${inp_word}". Please try another word.</h3>
            </div>`;
        } else if (error.message === "Failed to fetch") {
            result.innerHTML = `
            <div class="result">
                <h3 id="error">Network error occurred. Please check your internet connection and try again.</h3>
            </div>`;
        }
    }
}

function getWord() {
    let inp_word = word.value.trim();
    if (inp_word === "") {
        result.innerHTML = `
        <div class="result">
            <h3 id="error">Please enter a valid word!"</h3>
        </div>`
    } else {
        fetchData(inp_word);
    }
}

word.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        getWord();
    }
});
microphone.addEventListener("click", voiceEnable);
search_btn.addEventListener("click", getWord);
