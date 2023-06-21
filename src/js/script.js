import { ethers } from './ethers-5.1.esm.min.js';
import { sepoliaRpcWss } from './constants/config.js';
import { linkupAddress, linkupABI } from './constants/linkup.js';
import { userAddress, userABI } from './constants/user.js';
import { userContactAddress, userContactABI } from './constants/UserContact.js';

if (typeof window.ethereum == 'undefined') {
	throw new Error('Please install Metamask!');
}

/******************
	variables
******************/
// providers
const windowProvider = new ethers.providers.Web3Provider(window.ethereum);
const windowSigner = windowProvider.getSigner();
const wssProvider = new ethers.providers.WebSocketProvider(sepoliaRpcWss);
const wssSigner = wssProvider.getSigner();

// contracts
const linkupContract = new ethers.Contract(linkupAddress, linkupABI, windowSigner);
const wssLinkupContract = new ethers.Contract(linkupAddress, linkupABI, wssSigner);
const unconnectedLinkupContract = new ethers.Contract(linkupAddress, linkupABI, windowProvider);

const userContract = new ethers.Contract(userAddress, userABI, windowSigner);
const wssUserContract = new ethers.Contract(userAddress, userABI, wssSigner);

const userContactContract = new ethers.Contract(userContactAddress, userContactABI, windowSigner);
const wssUserContactContract = new ethers.Contract(userContactAddress, userContactABI, wssSigner);

// account
let accounts = await windowProvider.listAccounts();
let clientAddress = accounts[0] ?? null;
// let clientAddress = '9826';

// data
let users;
let user;
let userID;
let userContacts;
let linkups = isConnected() ? await linkupContract.getAll() : await unconnectedLinkupContract.getAll();

// html elements
let navBtns = document.querySelectorAll('nav ul li a');
let homeBtn = document.getElementById('homeBtn');
let profileBtn = document.getElementById('profileBtn');
let connectBtn = document.getElementById('connectBtn');
let profileNavAttentionInterval;

let linkupContainer = document.querySelectorAll('.linkups')[0];
let linkupForm = document.getElementById('linkupForm');
let linkupFormBtn = linkupForm.querySelector('input[type="submit"]');
let linkupFormLoadingContainer = linkupForm.querySelector('#loadingContainer');
let linkupFormLoadingInterval;

let userContainer = document.querySelectorAll('.user')[0];
let profileForm = document.getElementById('profileForm');
let profileFormSaveBtn = profileForm.querySelector('#saveBtn');
let profileFormEditBtn = profileForm.querySelector('#editBtn');
let profileFormUpdateBtn = profileForm.querySelector('#updateBtn');
let profileFormCancelBtn = profileForm.querySelector('#cancelBtn');
let profileFormLoadingContainer = profileForm.querySelector('#loadingContainer');
let profileFormLoadingInterval;

let contactList = document.querySelectorAll('.contacts .list')[0];
let removeContactLoadings = [];

let contactSearchBtn = document.querySelectorAll('.search button')[0];
let contactSearchField = document.querySelectorAll('.search input')[0];
let contactSearchList = document.querySelectorAll('.contacts .search + .list')[0];
let addContactLoadings = [];

let userSuggestionsContainer = document.querySelectorAll('.userSuggestions')[0];
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

wssUserContract.on('UserCreated', (u, id) => {
	profileBtn.children[1].classList.remove('dot');
	clearInterval(profileNavAttentionInterval);

	users[id.toString()] = u;

	users = users.filter((value) => Object.keys(value).length !== 0);

	buildPage(users);
});

wssUserContract.on('UserUpdated', (u) => {
	profileFormLoadingContainer.classList.add('hide');
	clearInterval(profileFormLoadingInterval);

	users[userID] = u;

	buildPage(users);
});

wssUserContactContract.on(
	wssUserContactContract.filters.UserContactCreated(clientAddress),
	(log, event) => {
		let contactID = event.contact_id.toNumber();

		addContactLoadings[contactID].element.remove();
		clearInterval(addContactLoadings[contactID].interval);

		buildContactList(users[contactID]);
	}
);

wssUserContactContract.on(
	wssUserContactContract.filters.UserContactDestroyed(clientAddress),
	(log, event) => {
		let contactID = event.contact_id.toNumber();

		removeContactLoadings[contactID].element.remove();
		clearInterval(removeContactLoadings[contactID].interval);
	}
);

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
	users = await userContract.getAll();
	users = [...users];
	userContacts = await userContactContract.getAll();
	userContacts = [...userContacts];

	buildPage(users);
}

async function buildPage(users) {
	user = users.find((u) => u.owner == clientAddress);
	userID = getUserID(clientAddress);

	// nav
	homeBtn.addEventListener('click', () => goToView(linkupContainer, homeBtn));
	profileBtn.addEventListener('click', () => goToView(userContainer, profileBtn));

	// linkup
	linkupForm.addEventListener('submit', (event) => createLinkup(event));
	linkups.forEach((linkup) => prependLinkUp(linkup));

	// profile
	if (user) {
		prefillUserForm(user);
		disableUserFormExcept(profileFormEditBtn);
		profileFormEditBtn.addEventListener('click', () => enableUserForm());
		profileFormUpdateBtn.addEventListener('click', () => {
			updateUser(userID);
			disableUserFormExcept();
		});
		profileFormCancelBtn.addEventListener('click', () => disableUserFormExcept(profileFormEditBtn));
	} else {
		profileNavAttentionInterval = setInterval(() => swingAttentionCircle(profileBtn), 800);
		profileFormSaveBtn.addEventListener('click', () => createUser());
	}

	// contact
	userContacts.forEach((userContact) => {
		if (!userContact.active) {
			return;
		}

		let contactID = userContact.contact_id.toNumber();
		buildContactList(users[contactID]);
	});

	contactSearchBtn.addEventListener('click', () => search());

	// user suggestions
	let activeContactIDs = getActiveContactIDs();
	let contactSuggestions = users.filter((suggestion, id) => {
		// return !activeContactIDs.includes(id) && suggestion.owner !== clientAddress;
		return !activeContactIDs.includes(id);
	});

	contactSuggestions.forEach((suggestion) => buildUserSuggestion(suggestion));
}

function search() {
	let searchValue = contactSearchField.value.toLowerCase();
	contactSearchList.innerHTML = '';

	if (searchValue === '') {
		return;
	}

	let activeContactIDs = getActiveContactIDs();

	let searchUsers = users.filter((searchUser) => {
		return (
			searchUser.fullname.toLowerCase().includes(searchValue) &&
			!activeContactIDs.includes(getUserID(searchUser.owner))
		);
	});

	if (searchUsers.length == 0) {
		let messageContainer = document.createElement('div');
		let messageElement = document.createElement('p');
		messageElement.innerHTML = `There are no users with the name or address: ${searchValue}.`;

		messageContainer.append(messageElement);
		contactSearchList.append(messageContainer);

		return;
	}

	searchUsers.forEach((user) => buildContactSearchList(user));
}

function getActiveContactIDs() {
	return userContacts
		.map((userContact) => {
			if (!userContact.active) {
				return;
			}

			return userContact.contact_id.toNumber();
		})
		.filter((userContact) => userContact != undefined);
}

function buildContactList(contact) {
	let contactItem = document.createElement('div');

	// name
	let nameElement = document.createElement('p');
	nameElement.classList.add('name');
	nameElement.innerHTML = contact.fullname;

	// address
	let addressElement = document.createElement('p');
	addressElement.classList.add('address');
	addressElement.innerHTML = contact.owner;

	// add
	let btnContainer = document.createElement('div');
	btnContainer.classList.add('removeBtnContainer');

	let btnElement = document.createElement('button');
	let btnIconElement = document.createElement('i');
	btnIconElement.classList.add('fa-solid');
	btnIconElement.classList.add('fa-circle-minus');

	//loading
	let removeLoadingContainer = document.createElement('div');
	removeLoadingContainer.classList.add('hide');
	removeLoadingContainer.setAttribute('id', 'loadingContainer');

	let loadingElement = document.createElement('div');
	loadingElement.classList.add('loading');

	let innerLoadingElement = document.createElement('div');
	let firstCircle = document.createElement('span');
	let middleCircle = document.createElement('span');
	let lastCircle = document.createElement('span');
	firstCircle.classList.add('large');
	lastCircle.classList.add('third');

	// append
	removeLoadingContainer.append(loadingElement);
	loadingElement.append(innerLoadingElement);

	innerLoadingElement.append(firstCircle);
	innerLoadingElement.append(middleCircle);
	innerLoadingElement.append(lastCircle);

	btnElement.append(btnIconElement);
	btnContainer.append(btnElement);

	contactItem.append(nameElement);
	contactItem.append(addressElement);
	contactItem.append(btnContainer);
	contactItem.append(removeLoadingContainer);
	contactList.append(contactItem);

	// event listener
	btnElement.addEventListener('click', async () => {
		let contactID = 9;
		// let contactID = getUserID(contact.owner);

		btnContainer.classList.add('hide');
		removeLoadingContainer.classList.remove('hide');

		removeContactLoadings[contactID] = {
			interval: setInterval(() => bounceLoading(removeLoadingContainer), 300),
			element: contactItem,
		};

		let userContactID = Object.keys(userContacts).find((key) => {
			let userContact = userContacts[key];

			// console.log(userContact.user_id.toNumber(), userContact.contact_id.toNumber(), userContact.active);

			return (
				userContact.user_id == userID &&
				userContact.contact_id == contactID &&
				userContact.active == true
			);
		});

		await userContactContract.destroy(userContactID);
	});
}

function buildContactSearchList(contact) {
	let searchItem = document.createElement('div');

	// name
	let nameElement = document.createElement('p');
	nameElement.classList.add('name');
	nameElement.innerHTML = contact.fullname;

	// address
	let addressElement = document.createElement('p');
	addressElement.classList.add('address');
	addressElement.innerHTML = contact.owner;

	// add
	let btnContainer = document.createElement('div');
	btnContainer.classList.add('removeBtnContainer');

	let btnElement = document.createElement('button');
	let btnIconElement = document.createElement('i');
	btnIconElement.classList.add('fa-solid');
	btnIconElement.classList.add('fa-circle-plus');

	//loading
	let addLoadingContainer = document.createElement('div');
	addLoadingContainer.classList.add('hide');
	addLoadingContainer.setAttribute('id', 'loadingContainer');

	let loadingElement = document.createElement('div');
	loadingElement.classList.add('loading');

	let innerLoadingElement = document.createElement('div');
	let firstCircle = document.createElement('span');
	let middleCircle = document.createElement('span');
	let lastCircle = document.createElement('span');
	firstCircle.classList.add('large');
	lastCircle.classList.add('third');

	// append
	addLoadingContainer.append(loadingElement);
	loadingElement.append(innerLoadingElement);

	innerLoadingElement.append(firstCircle);
	innerLoadingElement.append(middleCircle);
	innerLoadingElement.append(lastCircle);

	btnElement.append(btnIconElement);
	btnContainer.append(btnElement);

	searchItem.append(nameElement);
	searchItem.append(addressElement);
	searchItem.append(btnContainer);
	searchItem.append(addLoadingContainer);
	contactSearchList.append(searchItem);

	// event listener
	btnElement.addEventListener('click', async () => {
		// let contactID = getUserID(contact.owner);
		let contactID = parseInt(Object.keys(users).find((key) => users[key].fullname == 'J hhh'));

		btnContainer.classList.add('hide');
		addLoadingContainer.classList.remove('hide');

		addContactLoadings[contactID] = {
			interval: setInterval(() => bounceLoading(addLoadingContainer), 300),
			element: searchItem,
		};

		await userContactContract.create(userID, contactID);
	});
}

function buildUserSuggestion(suggestion) {
	let suggestionElement = document.createElement('div');

	let infoElement = document.createElement('div');
	infoElement.classList.add('info');

	let nameElement = document.createElement('p');
	nameElement.innerHTML = suggestion.fullname;

	let addressElement = document.createElement('p');
	addressElement.innerHTML = suggestion.owner;

	let saveBtn = document.createElement('button');
	saveBtn.innerHTML = 'Save';

	let suggestionLoadingContainer = document.createElement('div');
	suggestionLoadingContainer.classList.add('hide');
	suggestionLoadingContainer.setAttribute('id', 'loadingContainer');

	let loadingElement = document.createElement('div');
	loadingElement.classList.add('loading');

	let innerLoadingElement = document.createElement('div');
	let firstCircle = document.createElement('span');
	let middleCircle = document.createElement('span');
	let lastCircle = document.createElement('span');
	firstCircle.classList.add('large');
	lastCircle.classList.add('third');

	userSuggestionsContainer.append(suggestionElement);
	suggestionElement.append(infoElement);
	suggestionElement.append(saveBtn);
	suggestionElement.append(suggestionLoadingContainer);

	infoElement.append(nameElement);
	infoElement.append(addressElement);

	suggestionLoadingContainer.append(loadingElement);
	loadingElement.append(innerLoadingElement);
	innerLoadingElement.append(firstCircle);
	innerLoadingElement.append(middleCircle);
	innerLoadingElement.append(lastCircle);

	// event listener
	saveBtn.addEventListener('click', async () => {
		let contactID = 5;
		// let contactID = getUserID(contact.owner);
		// let contactID = parseInt(Object.keys(users).find((key) => users[key].fullname == 'J hhh'));

		saveBtn.classList.add('hide');
		suggestionLoadingContainer.classList.remove('hide');

		addContactLoadings[contactID] = {
			interval: setInterval(() => bounceLoading(suggestionLoadingContainer), 300),
			element: suggestionElement,
		};

		await userContactContract.create(userID, contactID);
	});
}

function getUserID(address) {
	return parseInt(Object.keys(users).find((key) => users[key].owner == address));
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

function disableUserFormExcept(expectBtn) {
	profileForm.querySelectorAll('input:not(.regularBtn)').forEach((formField) => {
		formField.disabled = true;
	});

	profileForm.querySelectorAll('button').forEach((button) => {
		button.classList.add('hide');
	});

	if (expectBtn) {
		expectBtn.classList.remove('hide');
	}
}

function enableUserForm() {
	profileForm.querySelectorAll('input:not(.regularBtn)').forEach((formField) => {
		formField.disabled = false;
	});

	profileFormEditBtn.classList.add('hide');
	profileFormUpdateBtn.classList.remove('hide');
	profileFormCancelBtn.classList.remove('hide');
}

async function updateUser(userID) {
	await userContract.update(
		userID,
		document.getElementById('fullname').value,
		getSelected('musicTaste'),
		getSelected('foodTaste'),
		getSelected('sportsTaste')
	);

	profileFormCancelBtn.classList.add('hide');
	replaceButtonWithLoading(profileFormUpdateBtn, profileFormLoadingContainer);
	profileFormLoadingInterval = setInterval(() => bounceLoading(profileFormLoadingContainer), 300);
}

async function createUser() {
	await userContract.create(
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
