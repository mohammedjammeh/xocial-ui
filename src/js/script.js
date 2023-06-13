import { ethers } from './ethers-5.1.esm.min.js';
import { linkupAddress, linkupABI } from './constants/linkup.js';
import { userContractAddress, userContractABI } from './constants/user.js';

if (typeof window.ethereum == 'undefined') {
	throw new Error('Please install Metamask!');
}

const provider = new ethers.providers.Web3Provider(window.ethereum);
const linkupContract = new ethers.Contract(linkupAddress, linkupABI, provider.getSigner());
const userContract = new ethers.Contract(userContractAddress, userContractABI, provider.getSigner());

// Variables (HTML Elements)
const linkupForm = document.getElementById('linkupForm');
const profileForm = document.getElementById('profileForm');

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

function toggleDotDisplay(btn) {
	let btnClasses = btn.classList;
	btnClasses = Object.keys(btnClasses).map((key) => btnClasses[key]);

	if (btnClasses.includes('attention')) {
		btn.classList.remove('attention');

		return;
	}

	btn.classList.add('attention');
}

/******************
	Application
******************/
const accounts = await provider.listAccounts();

// unauthenticated
if (accounts.length == 0) {
	// connect button
	connectBtn.classList.remove('hide');
	setInterval(() => toggleDotDisplay(connectBtn), 800);

	// connect for all buttons
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

// linkup form
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

	const response = await linkupContract.create(
		'0x0A2169dfcC633289285290a61BB4d10AFA131817',
		type,
		description,
		location,
		startTimeUnix,
		endTimeUnix,
		['0x0A2169dfcC633289285290a61BB4d10AFA131817', '0x0A2169dfcC633289285290a61BB4d10AFA131817']
	);

	// const txReceipt = await response.wait(1);
	// console.log('txReceipt: ', txReceipt);

	linkupContract.on('NewLinkup', (link) => {
		console.log(link);
	});

	// console.log(response);
});

/******************
	Profile
******************/
// user form
let allUsers = await userContract.getAll();
let clientAddress = accounts[0];
// let clientAddress = '9826';
let storedAccount = allUsers.find((user) => user.owner == clientAddress);

let fullNameField = document.getElementById('fullName');
let musicTasteFields = document.getElementsByName('musicTaste[]');

if (storedAccount) {
	// autofill Form
	fullNameField.value = storedAccount['fullName'];
	musicTasteFields.forEach((field) => {
		if (storedAccount['musicTaste'].includes(field.value)) {
			field.checked = true;
		}
	});
} else {
	// profile nav attention
	profileBtn.children[1].classList.add('dot');
	setInterval(() => toggleDotDisplay(profileBtn), 800);
}

profileForm.addEventListener('submit', async (event) => {
	event.preventDefault();

	// store profile form
	let selectedMusicTaste = [];
	musicTasteFields.forEach((field) => {
		if (field.checked) {
			selectedMusicTaste.push(field.value);
		}
	});

	const response = await userContract.create(
		'0x0A2169dfcC633289285290a61BB4d10AFA131817',
		fullNameField.value,
		selectedMusicTaste
	);
});

// contact form
let searchBtn = document.querySelectorAll('.search button')[0];
let searchField = document.querySelectorAll('.search input')[0];
let searchContainer = document.querySelectorAll('.contacts .search + .list')[0];

searchBtn.addEventListener('click', async (event) => {
	event.preventDefault();

	let searchValue = searchField.value.toLowerCase();
	searchContainer.innerHTML = '';

	if (searchValue === '') {
		return;
	}

	let searchUsers = allUsers.filter((user) => {
		// return user.owner !== clientAddress && user.fullName.toLowerCase().includes(searchValue);
		return user.fullName.toLowerCase().includes(searchValue);
	});

	if (searchUsers.length == 0) {
		let messageContainer = document.createElement('div');
		let messageElement = document.createElement('p');
		messageElement.innerHTML = `There are no users with the name or address: ${searchValue}.`;

		messageContainer.append(messageElement);
		searchContainer.append(messageContainer);

		return;
	}

	searchUsers.forEach((user) => {
		let searchElement = document.createElement('div');

		let nameElement = document.createElement('p');
		nameElement.classList.add('name');
		nameElement.innerHTML = user.fullName;

		let addressElement = document.createElement('p');
		addressElement.classList.add('address');
		addressElement.innerHTML = user.owner;

		let btnContainer = document.createElement('div');
		btnContainer.classList.add('removeBtnContainer');

		let btnElement = document.createElement('button');

		let btnIconElement = document.createElement('i');
		btnIconElement.classList.add('fa-solid');
		btnIconElement.classList.add('fa-circle-plus');

		btnElement.append(btnIconElement);
		btnContainer.append(btnElement);

		searchElement.append(nameElement);
		searchElement.append(addressElement);
		searchElement.append(btnContainer);
		searchContainer.append(searchElement);
	});
});

const eventProvider = new ethers.providers.WebSocketProvider(
	'wss://eth-sepolia.g.alchemy.com/v2/ZMwWseSEcXoDOA2dkn3Q8vyGnWtynmZX'
);
const eventContract = new ethers.Contract(linkupAddress, linkupABI, eventProvider.getSigner());

eventContract.on('NewLinkup', (name, amount) => {
	console.log(name, amount);
});
