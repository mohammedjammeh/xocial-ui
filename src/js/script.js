import { ethers } from './ethers-5.1.esm.min.js';
import { sepoliaRpcWss } from './constants/config.js';
import { linkupAddress, linkupABI } from './constants/linkup.js';
import { userContractAddress, userContractABI } from './constants/user.js';

if (typeof window.ethereum == 'undefined') {
	throw new Error('Please install Metamask!');
}

/******************
	variables
******************/
// providers
const windowProvider = new ethers.providers.Web3Provider(window.ethereum);
const wssProvider = new ethers.providers.WebSocketProvider(sepoliaRpcWss);

// contracts
const linkupContract = new ethers.Contract(linkupAddress, linkupABI, windowProvider.getSigner());
const wssLinkupContract = new ethers.Contract(linkupAddress, linkupABI, wssProvider.getSigner());
const unconnectedLinkupContract = new ethers.Contract(linkupAddress, linkupABI, windowProvider);
const userContract = new ethers.Contract(userContractAddress, userContractABI, windowProvider.getSigner());

// account
let accounts = await windowProvider.listAccounts();
let clientAddress = accounts[0] ?? null;
// let clientAddress = '9826';

// data
let linkups = isConnected() ? await linkupContract.getAll() : await unconnectedLinkupContract.getAll();

// html elements
let linkupForm = document.getElementById('linkupForm');
let linkupFormBtn = linkupForm.querySelector('input[type="submit"]');
let linkupFormLoadingContainer = linkupForm.querySelector('#loadingContainer');
let linkupFormLoadingInterval;

let profileForm = document.getElementById('profileForm');
let profileFormSaveBtn = profileForm.querySelector('#saveBtn');
let profileFormEditBtn = profileForm.querySelector('#editBtn');
let profileFormUpdateBtn = profileForm.querySelector('#updateBtn');
let profileFormCancelBtn = profileForm.querySelector('#cancelBtn');
let profileFormLoadingContainer = profileForm.querySelector('#loadingContainer');
let profileFormLoadingInterval;

let navBtns = document.querySelectorAll('nav ul li a');
let homeBtn = document.getElementById('homeBtn');
let profileBtn = document.getElementById('profileBtn');
let connectBtn = document.getElementById('connectBtn');

let linkupContainer = document.querySelectorAll('.linkups')[0];
let userContainer = document.querySelectorAll('.user')[0];

let userSuggestionsBtns = document.querySelectorAll('.userSuggestions button');

// others
const days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/*********************
	event handlers
*********************/
window.ethereum.on('accountsChanged', async function () {
	location.reload();
});

wssLinkupContract.on('NewLinkup', (linkup) => {
	prependLinkUp(linkup);

	linkupFormLoadingContainer.classList.add('hide');
	clearInterval(linkupFormLoadingInterval);

	linkupFormBtn.classList.remove('hide');

	document.getElementById('type').value = 'chill';
	document.getElementById('description').value = '';
	document.getElementById('location').value = '';
	document.getElementById('startDate').value = getTodayDate();
	document.getElementById('startTime').value = '00:00';
	document.getElementById('endTime').value = '23:59';
});

/******************
	Application
******************/
document.getElementById('startDate').value = getTodayDate();

let allButtons = document.querySelectorAll('button');
let allForms = document.querySelectorAll('form');

allButtons.forEach((btn) => [btn.addEventListener('click', (event) => event.preventDefault())]);
allForms.forEach((form) => [form.addEventListener('submit', (event) => event.preventDefault())]);

if (!isConnected()) {
	// nav
	navBtns.forEach((btn) => btn.addEventListener('click', connect));

	connectBtn.classList.remove('hide');
	setInterval(() => swingAttentionCircle(connectBtn), 800);

	// suggestions
	userSuggestionsBtns.forEach((btn) => btn.addEventListener('click', connect));

	// linkup
	linkupForm.addEventListener('submit', () => connect());

	linkups.forEach((linkup) => prependLinkUp(linkup));

	let broadcastForms = document.querySelectorAll('.broadcastForm form');
	broadcastForms.forEach((form) => {
		form.addEventListener('submit', () => connect());
	});

	let joinBtns = document.querySelectorAll('.linkup .joinBtn button');
	joinBtns.forEach((btn) => btn.addEventListener('click', connect));
} else {
	let users = await userContract.getAll();
	let user = users.find((u) => u.owner == clientAddress);

	// nav
	homeBtn.addEventListener('click', () => goToView(linkupContainer, homeBtn));
	profileBtn.addEventListener('click', () => goToView(userContainer, profileBtn));

	// linkup
	linkupForm.addEventListener('submit', (event) => createLinkup(event));
	linkups.forEach((linkup) => prependLinkUp(linkup));

	// profile
	if (user) {
		prefillUserForm(user);
		disableUserForm();
		profileFormEditBtn.addEventListener('click', () => enableUserForm());
		profileFormUpdateBtn.addEventListener('click', () => updateUser());
		profileFormCancelBtn.addEventListener('click', () => disableUserForm());
	} else {
		setInterval(() => swingAttentionCircle(profileBtn), 800);
		profileFormSaveBtn.addEventListener('click', () => createUser());
	}

	// contact form
	let searchBtn = document.querySelectorAll('.search button')[0];
	let searchField = document.querySelectorAll('.search input')[0];
	let searchContainer = document.querySelectorAll('.contacts .search + .list')[0];

	searchBtn.addEventListener('click', async () => {
		let searchValue = searchField.value.toLowerCase();
		searchContainer.innerHTML = '';

		if (searchValue === '') {
			return;
		}

		let searchUsers = users.filter((user) => {
			// return user.owner !== clientAddress && user.fullname.toLowerCase().includes(searchValue);
			return user.fullname.toLowerCase().includes(searchValue);
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
			nameElement.innerHTML = user.fullname;

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
}

/******************
	Functions
******************/
// nav attention
function swingAttentionCircle(btn) {
	btn.children[1].classList.add('dot');

	let btnClasses = btn.classList;
	btnClasses = Object.keys(btnClasses).map((key) => btnClasses[key]);

	if (btnClasses.includes('attention')) {
		btn.classList.remove('attention');

		return;
	}

	btn.classList.add('attention');
}

// linkup
async function createLinkup(event) {
	event.preventDefault();

	let startDate = document.getElementById('startDate').value;
	let startTime = document.getElementById('startTime').value;
	let endTime = document.getElementById('endTime').value;
	let to = document.getElementById('to').value;
	let startTimeUnix = Date.parse(startDate + ' ' + startTime + ':00') / 1000;
	let endTimeUnix = Date.parse(startDate + ' ' + endTime + ':00') / 1000;

	replaceButtonWithLoading(linkupFormBtn, linkupFormLoadingContainer);
	linkupFormLoadingInterval = setInterval(() => bounceLoading(linkupFormLoadingContainer), 300);

	await linkupContract.create(
		'0x0A2169dfcC633289285290a61BB4d10AFA131817',
		document.getElementById('type').value,
		document.getElementById('description').value,
		document.getElementById('location').value,
		startTimeUnix,
		endTimeUnix,
		['0x0A2169dfcC633289285290a61BB4d10AFA131817', '0x0A2169dfcC633289285290a61BB4d10AFA131817']
	);
}

function prependLinkUp(linkup) {
	let linkupElement = document.createElement('div');
	linkupElement.classList.add('linkup');
	linkupElement.classList.add('columnContainer');
	linkupContainer.prepend(linkupElement);

	// status
	let statusElement = document.createElement('p');
	statusElement.classList.add('type');
	statusElement.innerHTML = '🎉 🎉 ' + linkup.status;
	linkupElement.appendChild(statusElement);

	// location
	let locationElement = document.createElement('p');
	locationElement.classList.add('location');
	locationElement.innerHTML = ' ' + linkup.location;
	linkupElement.appendChild(locationElement);

	let locationIconElement = document.createElement('i');
	locationIconElement.classList.add('fa-solid');
	locationIconElement.classList.add('fa-location-dot');
	locationElement.prepend(locationIconElement);

	// moment
	let momentElement = document.createElement('p');
	momentElement.classList.add('moment');
	momentElement.innerHTML = ' ' + formatMoment(linkup);
	linkupElement.appendChild(momentElement);

	let momentIconElement = document.createElement('i');
	momentIconElement.classList.add('fa-regular');
	momentIconElement.classList.add('fa-calendar');
	momentElement.prepend(momentIconElement);

	// description
	let descriptionElement = document.createElement('p');
	descriptionElement.classList.add('description');
	descriptionElement.innerHTML = ' ' + linkup.description;
	linkupElement.appendChild(descriptionElement);

	// members
	let membersContainer = document.createElement('ul');
	membersContainer.classList.add('members');
	linkupElement.appendChild(membersContainer);

	linkup.attendees.forEach((member) => {
		let memberElement = document.createElement('li');
		memberElement.innerHTML = 'Alhaji Mballow'; // member
		membersContainer.append(memberElement);

		let memberIconElement = document.createElement('i');
		memberIconElement.classList.add('fa-regular');
		memberIconElement.classList.add('fa-circle-check');
		memberElement.append(memberIconElement);
	});

	// buttons (broadcast)
	let buttonsContainer = document.createElement('div');
	buttonsContainer.classList.add('buttons');

	let broadcastFormContainer = document.createElement('div');
	broadcastFormContainer.classList.add('broadcastForm');

	let broadcastFormElement = document.createElement('form');
	let toElement = document.createElement('select');

	linkup.attendees.forEach((member) => {
		let toOptionElement = document.createElement('option');
		toOptionElement.innerHTML = 'Elliot Mass';
		toOptionElement.value = 'yooo';
		toElement.append(toOptionElement);
	});

	let submitElement = document.createElement('input');
	submitElement.value = 'Broadcast';
	submitElement.type = 'submit';

	buttonsContainer.append(broadcastFormContainer);
	broadcastFormContainer.append(broadcastFormElement);
	broadcastFormElement.append(toElement);
	broadcastFormElement.append(submitElement);
	linkupElement.appendChild(buttonsContainer);

	// buttons (join)
	let joinBtnContainer = document.createElement('div');
	joinBtnContainer.classList.add('joinBtn');

	let joinBtnElement = document.createElement('button');
	joinBtnElement.innerHTML = 'Join';

	joinBtnContainer.append(joinBtnElement);
	linkupElement.appendChild(joinBtnContainer);
}

function formatMoment(linkup) {
	let startTime = new Date(linkup.startTime.toNumber() * 1000);
	let endTime = new Date(linkup.endTime.toNumber() * 1000);

	let startHour = ('0' + startTime.getHours()).slice(-2);
	let startMins = ('0' + startTime.getMinutes()).slice(-2);

	let endHours = ('0' + endTime.getHours()).slice(-2);
	let endMins = ('0' + endTime.getMinutes()).slice(-2);

	return (
		days[startTime.getDay()] +
		' ' +
		startTime.getDate() +
		' ' +
		months[startTime.getMonth()] +
		',' +
		' ' +
		startHour +
		':' +
		startMins +
		' - ' +
		endHours +
		':' +
		endMins
	);
}

// profile
function prefillUserForm(user) {
	document.getElementById('fullname').value = user['fullname'];

	prefillUserFormSelected(user, 'musicTaste');
	prefillUserFormSelected(user, 'foodTaste');
	prefillUserFormSelected(user, 'sportsTaste');
}

function prefillUserFormSelected(user, fieldName) {
	document.getElementsByName(fieldName + '[]').forEach((field) => {
		if (user[fieldName].includes(field.value)) {
			field.checked = true;
		}
	});
}

function disableUserForm() {
	profileForm.querySelectorAll('input:not(.regularBtn)').forEach((formField) => {
		formField.disabled = true;
	});

	profileFormEditBtn.classList.remove('hide');
	profileFormSaveBtn.classList.add('hide');
	profileFormUpdateBtn.classList.add('hide');
	profileFormCancelBtn.classList.add('hide');
}

function enableUserForm() {
	profileForm.querySelectorAll('input:not(.regularBtn)').forEach((formField) => {
		formField.disabled = false;
	});

	profileFormEditBtn.classList.add('hide');
	profileFormUpdateBtn.classList.remove('hide');
	profileFormCancelBtn.classList.remove('hide');
}

async function updateUser() {
	console.log('update yoooo');

	// await userContract.create(
	// 	'0x0A2169dfcC633289285290a61BB4d10AFA131817',
	// 	document.getElementById('fullname').value,
	// 	getSelected('musicTaste'),
	// 	getSelected('foodTaste'),
	// 	getSelected('sportsTaste')
	// );

	// replaceButtonWithLoading(profileFormSaveBtn, profileFormLoadingContainer);
	// profileFormLoadingInterval = setInterval(() => bounceLoading(profileFormLoadingContainer), 300);

	// console.log(clientAddress);
}

async function createUser() {
	await userContract.create(
		clientAddress,
		document.getElementById('fullname').value,
		getSelected('musicTaste'),
		getSelected('foodTaste'),
		getSelected('sportsTaste')
	);

	replaceButtonWithLoading(profileFormSaveBtn, profileFormLoadingContainer);
	profileFormLoadingInterval = setInterval(() => bounceLoading(profileFormLoadingContainer), 300);
}

function replaceButtonWithLoading(btn, loadingContainer) {
	btn.classList.add('hide');
	loadingContainer.classList.remove('hide');
}

function getSelected(fieldName) {
	let selected = [];
	document.getElementsByName(fieldName + '[]').forEach((field) => {
		if (field.checked) {
			selected.push(field.value);
		}
	});

	return selected;
}

// general
function isConnected() {
	return accounts.length > 0;
}

async function connect() {
	await window.ethereum.request({ method: 'eth_requestAccounts' });
	connectBtn.classList.add('hide');
}

function getTodayDate() {
	const today = new Date();
	let mm = today.getMonth() + 1;
	let dd = today.getDate();

	if (dd < 10) dd = '0' + dd;
	if (mm < 10) mm = '0' + mm;

	return today.getFullYear() + '-' + mm + '-' + dd;
}

function goToView(activeContainer, activeBtn) {
	let parentContainers = document.getElementsByClassName('middleColumn')[0].children;
	for (let key in parentContainers) {
		if (parentContainers.hasOwnProperty(key)) {
			parentContainers[key].classList.add('hide');
		}
	}

	activeContainer.classList.remove('hide');

	navBtns.forEach((btn) => btn.classList.remove('active'));
	activeBtn.classList.add('active');
}

function bounceLoading(loadingContainer) {
	let largeLoadingElement = loadingContainer.querySelectorAll('.loading span.large')[0];

	if (largeLoadingElement.classList.contains('third')) {
		largeLoadingElement.classList.remove('large');

		let firstLoadingSpan = loadingContainer.querySelectorAll('.loading span:first-of-type')[0];
		firstLoadingSpan.classList.add('large');

		return;
	}

	let nextLoadingElement = loadingContainer.querySelectorAll('.loading span.large + span')[0];
	nextLoadingElement.classList.add('large');
	largeLoadingElement.classList.remove('large');
}
