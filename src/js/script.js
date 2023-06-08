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

	const contract = new ethers.Contract(linkupAddress, linkupABI, provider.getSigner());

	const response = await contract.create(
		'0x0A2169dfcC633289285290a61BB4d10AFA131817',
		type,
		description,
		location,
		'1950',
		['0x0A2169dfcC633289285290a61BB4d10AFA131817', '0x0A2169dfcC633289285290a61BB4d10AFA131817']
	);

	const all = await contract.getAll();
	console.log(all);
});

// const main = async () => {
// 	const signer = provider.getSigner();
// 	const contract = new ethers.Contract(linkupAddress, linkupABI, signer);
// 	const all = await contract.getAll();

// 	console.log(all);
// };

// main();
