import { ethers } from './ethers-5.1.esm.min.js';
import { eventAddress, eventABI } from './constants/event.js';

if (typeof window.ethereum == 'undefined') {
	throw new Error('Please install Metamask!');
}

// Variables (HTML Elements)
const eventForm = document.getElementById('eventForm');

const homeBtn = document.getElementById('homeBtn');
const profileBtn = document.getElementById('profileBtn');
const connectBtn = document.getElementById('connectBtn');

const broadcastBtns = document.querySelectorAll('.broadcastForm input');
const joinBtns = document.querySelectorAll('.joinBtn button');

const userSuggestionsBtns = document.querySelectorAll('.userSuggestions button');

const provider = new ethers.providers.Web3Provider(window.ethereum);

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

// Application
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

	broadcastBtns.forEach((btn) => {
		btn.addEventListener('click', (event) => {
			event.preventDefault();
			connect();
		});
	});
	joinBtns.forEach((btn) => btn.addEventListener('click', connect));

	userSuggestionsBtns.forEach((btn) => btn.addEventListener('click', connect));
}

// const main = async () => {
// 	const signer = provider.getSigner();
// 	const contract = new ethers.Contract(eventAddress, eventABI, signer);
// 	const all = await contract.getAll();

// 	console.log(all);
// };

// main();
