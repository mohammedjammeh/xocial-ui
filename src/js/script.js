import { ethers } from './ethers-5.1.esm.min.js';
import { eventAddress, eventABI } from './constants/event.js';

if (typeof window.ethereum == 'undefined') {
	throw new Error('Please install Metamask!');
}

// Variables (HTML Elements)
const eventForm = document.getElementById('eventForm');
const connectBtn = document.getElementById('connectBtn');

// Variables (Web3)
const provider = new ethers.providers.Web3Provider(window.ethereum);
const accounts = await provider.listAccounts();
const accountExists = accounts.length > 0;

// Functions
async function connect() {
	await window.ethereum.request({ method: 'eth_requestAccounts' });
	connectedSetup();
}

async function connectedSetup() {
	connectBtn.innerHTML = 'Disconnect From My Wallet';
}

if (!accountExists) {
	eventForm.addEventListener('submit', connect);
	connectBtn.addEventListener('click', connect);
}

// const main = async () => {
// 	const signer = provider.getSigner();
// 	const contract = new ethers.Contract(eventAddress, eventABI, signer);
// 	const all = await contract.getAll();

// 	console.log(all);
// };

// main();
