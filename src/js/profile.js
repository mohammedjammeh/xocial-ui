import { ethers } from './ethers-5.1.esm.min.js';
import { linkupAddress, linkupABI } from './constants/linkup.js';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const userContract = new ethers.Contract(linkupAddress, linkupABI, provider.getSigner());
const allUsers = await userContract.getAll();

let profileForm = document.getElementById('profileForm');

profileForm.addEventListener('submit', async (event) => {
	event.preventDefault();

	let fullname = document.getElementById('fullname').value;

	let musicTastes = document.getElementsByName('musicTaste[]');
	let selectedMusicTaste = [];
	musicTastes.forEach((musicTaste) => {
		if (musicTaste.checked) {
			selectedMusicTaste.push(musicTaste.value);
		}
	});

	console.log(fullname);
	console.log(selectedMusicTaste);

	// const response = await linkupContract.create(
	// 	'0x0A2169dfcC633289285290a61BB4d10AFA131817',
	// 	type,
	// 	description,
	// 	location,
	// 	startTimeUnix,
	// 	endTimeUnix,
	// 	['0x0A2169dfcC633289285290a61BB4d10AFA131817', '0x0A2169dfcC633289285290a61BB4d10AFA131817']
	// );
});
