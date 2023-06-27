import { ethers } from './ethers-5.1.esm.min.js';
import { sepoliaRpcWss } from './constants/config.js';
import { linkupAddress, linkupABI } from './constants/Linkup.js';
import { userAddress, userABI } from './constants/User.js';
import { userContactAddress, userContactABI } from './constants/UserContact.js';
import { userLinkupAddress, userLinkupABI } from './constants/UserLinkup.js';

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

const userLinkupContract = new ethers.Contract(userLinkupAddress, userLinkupABI, windowSigner);
const wssUserLinkupContract = new ethers.Contract(userLinkupAddress, userLinkupABI, wssSigner);

// account
let accounts = await windowProvider.listAccounts();
let clientAddress = accounts[0] ?? null;
// let clientAddress = '9826';

// data
let users;
let user;
let userID;
let contacts;
let linkups;

// html elements
let allButtons = document.querySelectorAll('button');
let allForms = document.querySelectorAll('form');
let allDateFields = document.querySelectorAll('input[type="date"]');

let navBtns = document.querySelectorAll('nav ul li a');
let homeBtn = document.getElementById('homeBtn');
let profileBtn = document.getElementById('profileBtn');
let connectBtn = document.getElementById('connectBtn');
let profileNavAttentionInterval;

let linkupContainer = document.querySelectorAll('.linkups')[0];
let linkupForm = document.getElementById('linkupForm');
let linkupFormContacts = linkupForm.querySelector('#contacts');
let linkupFormBtn = linkupForm.querySelector('input[type="submit"]');
let linkupFormLoadingContainer = linkupForm.querySelector('#loadingContainer');
let linkupFormLoadingInterval;
let linkupJoinInterval = [];

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
let noUsersMessage = document.querySelector('.contacts #noUsersMessage');
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

// linkup - just emit address and linkup..
wssUserLinkupContract.on(
	wssUserLinkupContract.filters.NewUserLinkup(getUserID(clientAddress)),
	async (log, response) => {
		console.log('zol');

		// let linkup = await linkupContract.get(response.toNumber());
		// prependLinkUp(linkup);
		// replaceLoadingWithButton(linkupFormBtn, linkupFormLoadingContainer);
		// clearInterval(linkupFormLoadingInterval);
		// resetLinkUpForm();
	}
);

// user
wssUserContract.on('UserCreated', (u, id) => {
	profileBtn.children[1].classList.remove('dot');
	clearInterval(profileNavAttentionInterval);

	users[id.toString()] = u;
	users = users.filter((value) => Object.keys(value).length !== 0);

	buildPage();
});

wssUserContract.on('UserUpdated', (u) => {
	profileFormLoadingContainer.classList.add('hide');
	clearInterval(profileFormLoadingInterval);

	// find out how to only emit after data
	// stored or check if the data is cached
	// probably userID hasn't been set yet

	users[userID] = u;

	buildPage();
});

wssUserContactContract.on(
	wssUserContactContract.filters.UserContactCreated(clientAddress),
	(log, response) => {
		let contactID = response.toNumber();

		addContactLoadings[contactID].element.remove();
		clearInterval(addContactLoadings[contactID].interval);

		buildContactList(users[contactID]);
	}
);

wssUserContactContract.on(
	wssUserContactContract.filters.UserContactDestroyed(clientAddress),
	(log, response) => {
		let contactID = response.toNumber();

		removeContactLoadings[contactID].element.remove();
		clearInterval(removeContactLoadings[contactID].interval);
	}
);

/******************
	Application
******************/
allDateFields.forEach((field) => (field.value = getTodayDate()));
allButtons.forEach((btn) => [btn.addEventListener('click', (event) => event.preventDefault())]);
allForms.forEach((form) => [form.addEventListener('submit', (event) => event.preventDefault())]);

if (isConnected()) {
	buildPage();
} else {
	connectListenerForButtons();
}

/******************
	Functions
******************/
// general
function isConnected() {
	return accounts.length > 0;
}

async function connect() {
	await window.ethereum.request({ method: 'eth_requestAccounts' });
	connectBtn.classList.add('hide');
}

async function connectListenerForButtons() {
	//data
	linkups = await unconnectedLinkupContract.getAll();

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
}

async function buildPage() {
	// data
	users = await userContract.getAll();
	users = [...users];
	userID = getUserID(clientAddress);
	user = users.find((u) => u.owner == clientAddress);
	linkups = await linkupContract.getAllForUser(userID);
	contacts = await userContactContract.getContacts(userID);

	// nav
	homeBtn.addEventListener('click', () => goToView(linkupContainer, homeBtn));
	profileBtn.addEventListener('click', () => goToView(userContainer, profileBtn));

	// linkup
	linkupForm.addEventListener('submit', (event) => createLinkup(event));
	linkups.forEach((linkup) => prependLinkUp(linkup));

	// profile
	if (!user) {
		profileNavAttentionInterval = setInterval(() => swingAttentionCircle(profileBtn), 800);
		profileFormSaveBtn.addEventListener('click', () => createUser());
		return;
	}

	prefillUserForm(user);
	disableUserFormExcept(profileFormEditBtn);
	profileFormEditBtn.addEventListener('click', () => enableUserForm());
	profileFormUpdateBtn.addEventListener('click', () => {
		updateUser(userID);
		disableUserFormExcept();
	});
	profileFormCancelBtn.addEventListener('click', () => disableUserFormExcept(profileFormEditBtn));

	// contact
	contacts.forEach((contact) => {
		buildContactList(contact);
		appendToLinkupForm(contact);
	});
	contactSearchBtn.addEventListener('click', () => search());

	// user suggestions
	let contactIDs = getIDs(contacts);
	let contactSuggestions = users.filter((suggestion, id) => {
		// return !contactIDs.includes(id) && suggestion.owner !== clientAddress;
		return !contactIDs.includes(id);
	});
	contactSuggestions.forEach((suggestion) => buildUserSuggestion(suggestion));
}

function getUserID(address) {
	return parseInt(Object.keys(users).find((key) => users[key].owner == address));
}

function getLinkupID(linkupToFind) {
	return Object.keys(linkups).find((key) => {
		return (
			linkups[key].owner == linkupToFind.owner &&
			linkups[key].status == linkupToFind.status &&
			linkups[key].description == linkupToFind.description &&
			linkups[key].location == linkupToFind.location &&
			linkups[key].startTime == linkupToFind.startTime &&
			linkups[key].endTime == linkupToFind.endTime
		);
	});
}

function getIDs(items) {
	return items.map((item) => item.id.toNumber());
}

function getTodayDate() {
	const today = new Date();
	let mm = today.getMonth() + 1;
	let dd = today.getDate();

	if (dd < 10) dd = '0' + dd;
	if (mm < 10) mm = '0' + mm;

	return today.getFullYear() + '-' + mm + '-' + dd;
}

function newElement(tagname, classes, content) {
	let element = document.createElement(tagname);

	if (typeof classes == 'string' && classes !== '') {
		element.classList.add(classes);
	} else if (typeof classes == 'object') {
		classes.forEach((elementClass) => {
			element.classList.add(elementClass);
		});
	}

	if (content) {
		element.innerHTML = content;
	}

	return element;
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
	let startTimeUnix = Date.parse(startDate + ' ' + startTime + ':00') / 1000;
	let endTimeUnix = Date.parse(startDate + ' ' + endTime + ':00') / 1000;

	replaceButtonWithLoading(linkupFormBtn, linkupFormLoadingContainer);
	linkupFormLoadingInterval = setInterval(() => bounceLoading(linkupFormLoadingContainer), 300);

	await linkupContract.create(
		document.getElementById('type').value,
		document.getElementById('description').value,
		document.getElementById('location').value,
		startTimeUnix,
		endTimeUnix,
		userID,
		document.getElementById('contacts').value
	);
}

function resetLinkUpForm() {
	document.getElementById('type').value = 'chill';
	document.getElementById('description').value = '';
	document.getElementById('location').value = '';
	document.getElementById('startDate').value = getTodayDate();
	document.getElementById('startTime').value = '00:00';
	document.getElementById('endTime').value = '23:59';
}

async function prependLinkUp(linkup) {
	let linkupUsers = await userContract.getAllForLinkup(linkup.id.toNumber());
	let userContacts = await userContactContract.getContacts(userID);

	let linkupElement = newElement('div', ['linkup', 'columnContainer']);
	linkupContainer.prepend(linkupElement);

	// status
	let statusElement = newElement('p', ['type'], '🎉 🎉 ' + linkup.status);
	linkupElement.appendChild(statusElement);

	// location
	let locationElement = newElement('p', ['location'], ' ' + linkup.location);
	let locationIconElement = newElement('i', ['fa-solid', 'fa-location-dot']);
	linkupElement.appendChild(locationElement);
	locationElement.prepend(locationIconElement);

	// moment
	let momentElement = newElement('p', ['location'], ' ' + formatMoment(linkup));
	let momentIconElement = newElement('i', ['fa-regular', 'fa-calendar']);
	linkupElement.appendChild(momentElement);
	momentElement.prepend(momentIconElement);

	// description
	let descriptionElement = newElement('p', 'description', ' ' + linkup.description);
	linkupElement.appendChild(descriptionElement);

	// members
	let membersContainer = newElement('ul', 'members');
	linkupElement.appendChild(membersContainer);

	linkupUsers.forEach((linkupUser) => {
		let memberElement = newElement('li', '', linkupUser.fullname);
		membersContainer.append(memberElement);

		let memberIconElement = newElement('i', ['fa-regular', 'fa-circle-check']);
		memberElement.append(memberIconElement);
	});

	// buttons (broadcast)
	let buttonsContainer = newElement('div', 'buttons');
	let broadcastFormContainer = newElement('div', ['broadcastForm']);

	let broadcastFormElement = newElement('form');
	let toElement = newElement('select');

	userContacts.forEach((userContact) => {
		let toOptionElement = newElement('option', '', userContact.fullname);
		toOptionElement.value = userContact.id.toNumber();
		toElement.append(toOptionElement);
	});

	let submitElement = newElement('input');
	submitElement.value = 'Broadcast';
	submitElement.type = 'submit';

	buttonsContainer.append(broadcastFormContainer);
	broadcastFormContainer.append(broadcastFormElement);
	broadcastFormElement.append(toElement);
	broadcastFormElement.append(submitElement);
	linkupElement.appendChild(buttonsContainer);

	// buttons (join)
	let joinBtnContainer = newElement('div', ['joinBtn']);
	let joinBtnElement = newElement('button', [], 'Join');

	let joinLoadingContainer = createLoadingContainter();
	joinLoadingContainer.setAttribute('id', 'loadingContainer');

	joinBtnContainer.append(joinBtnElement);
	linkupElement.appendChild(joinBtnContainer);
	linkupElement.appendChild(joinLoadingContainer);

	joinBtnElement.addEventListener('click', () => {
		let linkupID = getLinkupID(linkup);

		replaceButtonWithLoading(joinBtnContainer, joinLoadingContainer);

		linkupJoinInterval[linkupID] = {
			interval: setInterval(() => bounceLoading(joinLoadingContainer), 300),
			element: linkupElement,
		};
		// await userContactContract.create(userID, linkupID);
	});
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

function appendToLinkupForm(contact) {
	let contactOption = newElement('option', '', contact.fullname);
	contactOption.value = contact.id;
	contactOption.innerHTML = contact.fullname;

	linkupFormContacts.appendChild(contactOption);
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

function replaceLoadingWithButton(btn, loadingContainer) {
	btn.classList.remove('hide');
	loadingContainer.classList.add('hide');
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

function search() {
	let searchValue = contactSearchField.value.toLowerCase();
	noUsersMessage.classList.add('hide');
	contactSearchList.innerHTML = '';

	if (searchValue === '') {
		return;
	}

	let contactIDs = getIDs(contacts);
	let searchUsers = users.filter((searchUser) => {
		return (
			searchUser.fullname.toLowerCase().includes(searchValue) &&
			!contactIDs.includes(getUserID(searchUser.owner))
		);
	});

	if (searchUsers.length == 0) {
		noUsersMessage.classList.remove('hide');

		return;
	}

	searchUsers.forEach((user) => buildSearchList(user));
}

function buildContactList(contact) {
	let contactElements = newContactElements(contact);
	let btn = contactElements['btn'];
	let loadingContainer = contactElements['loading'];
	let element = contactElements['element'];

	contactList.append(element);

	btn.addEventListener('click', async () => {
		let contactID = 1;
		// let contactID = contact.id;

		replaceButtonWithLoading(btn, loadingContainer);
		removeContactLoadings[contactID] = {
			interval: setInterval(() => bounceLoading(loadingContainer), 300),
			element: element,
		};

		await userContactContract.destroy(userID, contactID);
	});
}

function buildSearchList(contact) {
	let contactElements = newContactElements(contact, 'search');
	let btn = contactElements['btn'];
	let loadingContainer = contactElements['loading'];
	let element = contactElements['element'];

	contactSearchList.append(element);

	btn.addEventListener('click', async () => {
		let contactID = 1;
		// let contactID = contact.id;

		replaceButtonWithLoading(btn, loadingContainer);
		addContactLoadings[contactID] = {
			interval: setInterval(() => bounceLoading(loadingContainer), 300),
			element: element,
		};

		await userContactContract.create(userID, contactID);
	});
}

function newContactElements(contact, type) {
	let contactItem = newElement('div');

	let nameElement = newElement('p', 'name', contact.fullname);
	let addressElement = newElement('p', 'address', contact.owner);

	let btnContainer = newElement('div', 'removeBtnContainer');
	let btnElement = newElement('button');
	let btnIconClass = type == 'search' ? 'plus' : 'minus';
	let btnIconElement = newElement('i', ['fa-solid', 'fa-circle-' + btnIconClass]);

	let loadingContainer = createLoadingContainter();
	loadingContainer.setAttribute('id', 'loadingContainer');

	btnElement.append(btnIconElement);
	btnContainer.append(btnElement);

	contactItem.append(nameElement);
	contactItem.append(addressElement);
	contactItem.append(btnContainer);
	contactItem.append(loadingContainer);

	return {
		btn: btnContainer,
		loading: loadingContainer,
		element: contactItem,
	};
}

function createLoadingContainter() {
	let nloadingContainer = newElement('div', 'hide');
	nloadingContainer.setAttribute('id', 'loadingContainer');

	let nLoadingElement = newElement('div', 'loading');

	let nInnerLoadingElement = newElement('div');
	let nFirstCircle = newElement('span', 'large');
	let nMiddleCircle = newElement('span');
	let nLastCircle = newElement('span', 'third');

	nloadingContainer.append(nLoadingElement);
	nLoadingElement.append(nInnerLoadingElement);
	nInnerLoadingElement.append(nFirstCircle);
	nInnerLoadingElement.append(nMiddleCircle);
	nInnerLoadingElement.append(nLastCircle);

	return nloadingContainer;
}
// user suggestion
function buildUserSuggestion(suggestion) {
	let suggestionItem = newElement('div');

	let infoElement = newElement('div', 'info');
	let nameElement = newElement('p', '', suggestion.fullname);
	let addressElement = newElement('p', '', suggestion.owner);
	let btn = newElement('button', '', 'Save');

	let loadingContainer = createLoadingContainter();

	userSuggestionsContainer.append(suggestionItem);
	suggestionItem.append(infoElement);
	suggestionItem.append(btn);
	suggestionItem.append(loadingContainer);

	infoElement.append(nameElement);
	infoElement.append(addressElement);

	btn.addEventListener('click', async () => {
		let contactID = 2;
		// let contactID = suggestion.id;

		replaceButtonWithLoading(btn, loadingContainer);
		addContactLoadings[contactID] = {
			interval: setInterval(() => bounceLoading(loadingContainer), 300),
			element: suggestionItem,
		};

		await userContactContract.create(userID, contactID);
	});
}
