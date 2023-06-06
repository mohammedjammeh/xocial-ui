import { ethers } from './ethers-5.1.esm.min.js';
import { eventAddress, eventABI } from './constants/event.js';

if (typeof window.ethereum == 'undefined') {
	throw new Error('Please install Metamask!');
}

const provider = new ethers.providers.Web3Provider(window.ethereum);

// Variables (HTML Elements)
const eventForm = document.getElementById('eventForm');

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

	eventForm.addEventListener('submit', (event) => {
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
eventForm.addEventListener('submit', async (event) => {
	event.preventDefault();

	let type = document.getElementById('type').value;
	let description = document.getElementById('description').value;
	let location = document.getElementById('location').value;
	let startDate = document.getElementById('startDate').value;
	let startTime = document.getElementById('startTime').value;
	let endTime = document.getElementById('endTime').value;
	let to = document.getElementById('to').value;

	const contract = new ethers.Contract(eventAddress, eventABI, provider.getSigner());

	// const response = await contract.create(
	// 	'0x0A2169dfcC633289285290a61BB4d10AFA131817',
	// 	'Yoo Yoo Sess',
	// 	'I just wan yooo',
	// 	'Cus I can yooo',
	// 	'2023'
	// );

	const all = await contract.getAll();
	console.log(all);
});

// const main = async () => {
// 	const signer = provider.getSigner();
// 	const contract = new ethers.Contract(eventAddress, eventABI, signer);
// 	const all = await contract.getAll();

// 	console.log(all);
// };

// main();
