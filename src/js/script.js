import { ethers } from './ethers-5.1.esm.min.js';
import { eventAddress, eventABI } from './constants/event.js';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(eventAddress, eventABI, signer);

async function connect() {
	if (typeof window.ethereum == 'undefined') {
		console.log('No metamask');
	} else {
		await window.ethereum.request({ method: 'eth_requestAccounts' });
	}
}

const main = async () => {
	const all = await contract.getAll();
	console.log(all);
};

connect();

main();
