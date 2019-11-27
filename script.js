// CORS
// https://cors-anywhere.herokuapp.com/
// https://crossorigin.me/
const apiURL = 'https://cors-anywhere.herokuapp.com/https://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en';
const quote = document.querySelector('#quote');
const userText = document.querySelector('#userText');
const timer = document.querySelector('#timer');
const layer = document.querySelector('#layer');
var time = 0;
var interval = 0;
var countdownInt = 0;
var countdown = 1;
var newQuote;
var finish = false;
var high = 0, low = 0, avg = 0, prev = 0, totalGames = 0, totalScore = 0; 
var xhr = new XMLHttpRequest();

// Addign the event listeners after the DOM is loaded
document.addEventListener('DOMContentLoaded', loadContent);
function loadContent(e){	
	updateScore(); //Initial score of 0
	document.querySelector('#start').addEventListener('click', getQuote, false);
	userText.addEventListener('keyup', check, false);
	userText.setAttribute('disabled', 'disabled');
}
// Updates the scores in the results section
function updateScore(){
	document.querySelector('#high').innerHTML = high+" WPM";
	document.querySelector('#low').innerHTML = low+" WPM";
	document.querySelector('#avg').innerHTML = avg+" WPM";
	document.querySelector('#prev').innerHTML = prev+" WPM";
}

// This function gets a new quote every time it is called through API 
function getQuote(){
	loadScreen(false); //Load Screen before the quote is loaded
	xhr.onreadystatechange = function(){
		if(xhr.readyState == 4 && xhr.status == 200){
			// Converting the JSON object to string 
			// and splitting it to get the quote and author's name
			let response = JSON.stringify(xhr.responseText).split("\",");
			newQuote = response[0].split("\":")[1].replace(/[\\"]/g,'').trim();
			quote.innerHTML = newQuote;

			let authorName = response[1].split("\":")[1].replace(/[\\"]/g,'');
			document.querySelector('#author').innerHTML = '- ' +authorName;
			if(authorName == ''){
				document.querySelector('#author').innerHTML = '- Unknown'
			}
			// When the quote is loaded starting the countdown
			loadScreen(true);
		}
	}
	xhr.open('GET', apiURL, true);
	xhr.send();
}

// Start the countdown after the quote is loaded
function loadCountdown(){
	// Slide the layer down and show the quote text
	layer.style.top = quote.parentElement.offsetTop + quote.parentElement.clientHeight + "px";
	layer.innerHTML = '<div id="countdown">'+countdown+'</div>';
	countdownInt = setInterval(function(){
		countdown++;
		layer.innerHTML = '<div id="countdown">'+countdown+'</div>';
	}, 1000);
}

function loadScreen(loadComplete){
	layer.style.justifyContent = 'center';
	if(loadComplete == false){
		layer.style.display = 'flex';
		layer.innerHTML = '<div id="countdown">Loading...</div>'
	}else{
		loadCountdown();
		setTimeout(function(){
			clearInterval(countdownInt);
			countdownInt = null;
			countdown = 1;
			layer.style.top = '50px';
			layer.style.display = 'none';
			userText.removeAttribute('disabled');
			userText.focus();
			interval = setInterval(startTimer,10);
		},5000);
	}
}

function startTimer(){
	let seconds = Math.floor((time / 100) % 60) ;
	let minutes = Math.floor(((time / (100*60)) % 60));
	let milSec = Math.floor(time % 100);
	let timerFormat = timeText(minutes)+':'+timeText(seconds)+':'+timeText(milSec);
	timer.innerHTML = timerFormat;
	time++;
}

function timeText(time){
	if(time<=9){
		time = "0" + time;
	}
	return time;
}

function check(){
	let textValue = userText.value;
	let match = newQuote.substring(0, textValue.length);
	if(!finish){
		if(textValue == newQuote && !finish){
			clearInterval(interval);
			wpmCount();
			finish = true;
			userText.style.borderColor = '#2ecc71';
			userText.setAttribute('disabled','disabled');
			setTimeout(function(){
				getQuote();
				reset();
			},1000);

		}else{
			if(match == textValue){
				userText.style.borderColor = '#3498db';
			}else{
				userText.style.borderColor = '#e74c3c';
			}
		}
	}
}

function wpmCount(){
	let words = (userText.value.length)/5;
	let totalmins = (time / (100*60));
	let wpm = Math.round(words/totalmins, 2);
	
	if(wpm > high){ high = wpm; }
	if(low == 0 || wpm < low){ low = wpm; }

	totalGames++;
	totalScore += wpm;
	avg = Math.round(totalScore/totalGames, 2);

	prev = wpm;
	updateScore();
}

function reset(){
	interval = null;
	finish = false;
	time = 0;
	timer.innerHTML = '00:00:00';
	userText.style.borderColor = 'grey';
	userText.value = '';
}