import { ethers } from './ethers-5.1.esm.min.js';
import { eventAddress, eventABI } from './constants/event.js';

if (typeof window.ethereum == 'undefined') {
	throw new Error('Please install Metamask!');
}

// Variables (HTML Elements)
const eventForm = document.getElementById('eventForm');
const connectBtn = document.getElementById('connectBtn');

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
	eventForm.addEventListener('submit', connect);
	connectBtn.addEventListener('click', connect);

	connectBtn.classList.remove('hide');
}

// const main = async () => {
// 	const signer = provider.getSigner();
// 	const contract = new ethers.Contract(eventAddress, eventABI, signer);
// 	const all = await contract.getAll();

// 	console.log(all);
// };

// main();
