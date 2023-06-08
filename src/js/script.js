import { ethers } from './ethers-5.1.esm.min.js';
import { linkupAddress, linkupABI } from './constants/linkup.js';

if (typeof window.ethereum == 'undefined') {
	throw new Error('Please install Metamask!');
}

const provider = new ethers.providers.Web3Provider(window.ethereum);

// Variables (HTML Elements)
const linkupForm = document.getElementById('linkupForm');

const homeBtn = document.getElementById('homeBtn');
const profileBtn = document.getElementById('profileBtn');
const connectBtn = document.getElementById('connectBtn');

const broadcastForms = document.querySelectorAll('.broadcastForm form');
const joinBtns = document.querySelectorAll('.joinBtn button');

const userSuggestionsBtns = document.querySelectorAll('.userSuggestions button');

// Event Handlers
window.ethereum.on('accountsChanged', async function () {
	const accounts = await provider.listAccounts();
	if (accounts.length == 0) {
		connectBtn.classList.remove('hide');
	}
});

// Functions
async function connect() {
	await window.ethereum.request({ method: 'eth_requestAccounts' });
	connectBtn.classList.add('hide');
}

function shakeLoadingDisplay() {
	let largeLoadingElement = document.querySelectorAll('.loading span.large')[0];

	if (largeLoadingElement.classList.contains('third')) {
		largeLoadingElement.classList.remove('large');

		let firstLoadingSpan = document.querySelectorAll('.loading span:first-of-type')[0];
		firstLoadingSpan.classList.add('large');

		return;
	}

	let nextLoadingElement = document.querySelectorAll('.loading span.large + span')[0];
	nextLoadingElement.classList.add('large');
	largeLoadingElement.classList.remove('large');
}

// const loadingDisplay = setInterval(shakeLoadingDisplay, 300);
// clearInterval(loadingDisplay);

/******************
	Application
******************/
const accounts = await provider.listAccounts();
if (accounts.length == 0) {
	connectBtn.classList.remove('hide');

	linkupForm.addEventListener('submit', (event) => {
		event.preventDefault();
		connect();
	});

	homeBtn.addEventListener('click', connect);
	profileBtn.addEventListener('click', connect);
	connectBtn.addEventListener('click', connect);

	broadcastForms.forEach((form) => {
		form.addEventListener('submit', (event) => {
			event.preventDefault();
			connect();
		});
	});
	joinBtns.forEach((btn) => btn.addEventListener('click', connect));

	userSuggestionsBtns.forEach((btn) => btn.addEventListener('click', connect));
}

// event form
linkupForm.addEventListener('submit', async (event) => {
	event.preventDefault();

	let type = document.getElementById('type').value;
	let description = document.getElementById('description').value;
	let location = document.getElementById('location').value;
	let startDate = document.getElementById('startDate').value;
	let startTime = document.getElementById('startTime').value;
	let endTime = document.getElementById('endTime').value;
	let to = document.getElementById('to').value;
	let startTimeUnix = Date.parse(startDate + ' ' + startTime + ':00') / 1000;
	let endTimeUnix = Date.parse(startDate + ' ' + endTime + ':00') / 1000;

	const contract = new ethers.Contract(linkupAddress, linkupABI, provider.getSigner());

	//CREATE
	const response = await contract.create(
		'0x0A2169dfcC633289285290a61BB4d10AFA131817',
		type,
		description,
		location,
		startTimeUnix,
		endTimeUnix,
		['0x0A2169dfcC633289285290a61BB4d10AFA131817', '0x0A2169dfcC633289285290a61BB4d10AFA131817']
	);

	// GET ALL
	const all = await contract.getAll();

	console.log(all);

	// GET DATE //
	// let storedStartTime = all[1].startTime.toNumber();
	// let date = new Date(storedStartTime * 1000);
	// date = new Date(storedStartTime);
	// let hours = date.getHours();
	// let minutes = '0' + date.getMinutes();
	// let seconds = '0' + date.getSeconds();
	// let formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2); // 10:30:23 format

	// console.log(formattedTime);
});

// const main = async () => {
// 	const signer = provider.getSigner();
// 	const contract = new ethers.Contract(linkupAddress, linkupABI, signer);
// 	const all = await contract.getAll();

// 	console.log(all);
// };

// main();
