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
const unconnectedUserContract = new ethers.Contract(userAddress, userABI, windowProvider);

const userContactContract = new ethers.Contract(userContactAddress, userContactABI, windowSigner);
const wssUserContactContract = new ethers.Contract(userContactAddress, userContactABI, wssSigner);

const userLinkupContract = new ethers.Contract(userLinkupAddress, userLinkupABI, windowSigner);
const wssUserLinkupContract = new ethers.Contract(userLinkupAddress, userLinkupABI, wssSigner);

// account
let accounts = await windowProvider.listAccounts();
let clientAddress = accounts[0] ?? null;

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

let noLinkupsContainer = document.querySelectorAll('.noLinkups')[0];
let linkupContainer = document.querySelectorAll('.linkups')[0];
let linkupForm = document.getElementById('linkupForm');
let linkupFormContacts = linkupForm.querySelector('#contacts');
let linkupFormBtn = linkupForm.querySelector('input[type="submit"]');
let linkupFormLoadingContainer = linkupForm.querySelector('.loadingContainer');
let linkupFormLoadingInterval;
let linkupBroadcastInterval = [];
let linkupJoinInterval = [];
let linkupLeaveInterval = [];

let userContainer = document.querySelectorAll('.user')[0];
let profileForm = document.getElementById('profileForm');
let profileFormSaveBtn = profileForm.querySelector('#saveBtn');
let profileFormEditBtn = profileForm.querySelector('#editBtn');
let profileFormUpdateBtn = profileForm.querySelector('#updateBtn');
let profileFormCancelBtn = profileForm.querySelector('#cancelBtn');
let profileFormLoadingContainer = profileForm.querySelector('.loadingContainer');
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

// linkup
wssUserLinkupContract.on(
	wssUserLinkupContract.filters.UserLinkupCreated(clientAddress),
	async (log, linkup) => {
		replaceLoadingWithButton(linkupFormBtn, linkupFormLoadingContainer);
		clearInterval(linkupFormLoadingInterval);

		resetLinkUpForm();

		linkupContainer.innerHTML = '';
		userSuggestionsContainer.innerHTML = '';

		buildPage(users);
	}
);

wssUserLinkupContract.on(
	wssUserLinkupContract.filters.UserLinkupJoined(clientAddress),
	async (log, linkup) => {
		linkupContainer.innerHTML = '';
		userSuggestionsContainer.innerHTML = '';

		buildPage(users);
	}
);

wssUserLinkupContract.on(
	wssUserLinkupContract.filters.UserLinkupLeft(clientAddress),
	async (log, linkup) => {
		linkupContainer.innerHTML = '';
		userSuggestionsContainer.innerHTML = '';

		buildPage(users);
	}
);

// user
wssUserContract.on(wssUserContract.filters.UserCreated(clientAddress), (log, user) => {
	profileBtn.children[1].classList.remove('dot');
	clearInterval(profileNavAttentionInterval);

	profileFormLoadingContainer.classList.add('hide');
	clearInterval(profileFormLoadingInterval);

	users[user.id] = user;
	users = users.filter((value) => Object.keys(value).length !== 0);

	linkupContainer.innerHTML = '';
	userSuggestionsContainer.innerHTML = '';
	buildPage(users);
});

wssUserContract.on(wssUserContract.filters.UserUpdated(clientAddress), (log, user) => {
	profileFormLoadingContainer.classList.add('hide');
	clearInterval(profileFormLoadingInterval);

	users[userID] = user;

	linkupContainer.innerHTML = '';
	userSuggestionsContainer.innerHTML = '';
	buildPage(users);
});

// contacts
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
// allFormBtns.forEach((formBtn) => [formBtn.addEventListener('click', (event) => event.preventDefault())]);

if (isConnected()) {
	users = await userContract.getAll();
	users = [...users];
	buildPage(users);
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
	users = await unconnectedUserContract.getUnconnectedAll();
	linkups = await unconnectedLinkupContract.getUnconnectedAll();

	// nav
	navBtns.forEach((btn) => btn.addEventListener('click', connect));

	connectBtn.classList.remove('hide');
	setInterval(() => swingAttentionCircle(connectBtn), 800);

	// suggestions
	users.forEach((suggestion) => buildUserSuggestion(suggestion));
	document
		.querySelectorAll('.userSuggestions button')
		.forEach((btn) => btn.addEventListener('click', connect));

	// linkup
	linkupForm.addEventListener('submit', () => connect());
	linkups.forEach((linkup) => prependUnconnectedLinkUp(linkup));

	let broadcastForms = document.querySelectorAll('.broadcastForm form');
	broadcastForms.forEach((form) => {
		form.addEventListener('submit', () => connect());
	});

	let joinBtns = document.querySelectorAll('.linkup .joinBtn button');
	joinBtns.forEach((btn) => btn.addEventListener('click', connect));
}

async function buildPage(users) {
	userID = getUserID(clientAddress);
	user = users.find((u) => u.owner == clientAddress);

	// nav
	homeBtn.addEventListener('click', () => goToView(linkupContainer, homeBtn));
	profileBtn.addEventListener('click', () => goToView(userContainer, profileBtn));

	// profile
	if (!user) {
		noLinkupsContainer.classList.remove('hide');

		profileNavAttentionInterval = setInterval(() => swingAttentionCircle(profileBtn), 800);
		profileFormSaveBtn.addEventListener('click', () => createUser());

		users = await unconnectedUserContract.getUnconnectedAll();
		users.forEach((suggestion) => buildUserSuggestion(suggestion));

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

	// linkup
	linkups = await userLinkupContract.getUserLinkups(userID);
	contacts = await userContactContract.getContacts(userID);

	if (linkups.length > 0) {
		noLinkupsContainer.classList.add('hide');
	} else {
		noLinkupsContainer.classList.remove('hide');
	}

	linkupForm.addEventListener('submit', (event) => createLinkup(event));
	linkups.forEach((linkup) => prependLinkUp(linkup));

	// contact
	contacts.forEach((contact) => {
		buildContactList(contact);
		appendToLinkupForm(contact);
	});
	contactSearchBtn.addEventListener('click', () => search());

	// user suggestions
	let contactIDs = getIDs(contacts);
	let contactSuggestions = users.filter((suggestion, id) => {
		return !contactIDs.includes(id) && suggestion.owner !== clientAddress;
	});
	contactSuggestions.forEach((suggestion) => buildUserSuggestion(suggestion));
}

function getUserID(address) {
	return parseInt(Object.keys(users).find((key) => users[key].owner == address));
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

function newContactElements(contact, type) {
	let contactItem = newElement('div');

	let nameElement = newElement('p', 'name', contact.fullname);
	let addressElement = newElement('p', 'address', contact.owner);

	let btnContainer = newElement('div', 'removeBtnContainer');
	let btnElement = newElement('button');
	let btnIconClass = type == 'search' ? 'plus' : 'minus';
	let btnIconElement = newElement('i', ['fa-solid', 'fa-circle-' + btnIconClass]);

	let loadingContainer = createLoadingContainter();

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
	let nloadingContainer = newElement('div', ['hide', 'loadingContainer']);

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
	let contactIDs = [];
	linkupForm.querySelectorAll('#contacts option:checked').forEach((contactOption) => {
		contactIDs.push(parseInt(contactOption.value));
	});

	replaceButtonWithLoading(linkupFormBtn, linkupFormLoadingContainer);
	linkupFormLoadingInterval = setInterval(() => bounceLoading(linkupFormLoadingContainer), 300);

	await userLinkupContract.createLinkupPlusUserLinkup(
		document.getElementById('type').value,
		document.getElementById('description').value,
		document.getElementById('location').value,
		startTimeUnix,
		endTimeUnix,
		userID,
		contactIDs
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
	let linkupID = linkup.id.toNumber();
	let linkupUsers = await userLinkupContract.getLinkupUsers(linkupID);
	let linkupUserPivots = await userLinkupContract.getLinkupUserPivots(linkupID);
	let userContacts = await userContactContract.getContacts(userID);

	let linkupElement = newElement('div', ['linkup', 'columnContainer']);
	linkupContainer.prepend(linkupElement);

	// status
	let statusElement = newElement('p', ['type'], '🎉 ' + linkup.status);
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

	// broadcasted by
	let currentUserLinkup = getUserLinkup(linkupUserPivots, linkupID, userID);
	let linkupFromUserID = currentUserLinkup.from_user_id.toNumber();
	let broadcastedByText;

	if (linkupFromUserID == userID) {
		broadcastedByText = 'Me';
	} else {
		let linkupFromUser = await userContract.get(linkupFromUserID);
		broadcastedByText = linkupFromUser.fullname;
	}

	let broadcastedByElement = newElement('p', '', ' ' + broadcastedByText);
	let broadcastByIconElement = newElement('i', ['fa-solid', 'fa-bullhorn']);
	broadcastedByElement.prepend(broadcastByIconElement);
	linkupElement.appendChild(broadcastedByElement);

	// members
	let membersContainer = newElement('ul', 'members');
	linkupElement.appendChild(membersContainer);

	linkupUsers.forEach((linkupUser) => {
		let memberElement = newElement('li', '', linkupUser.fullname);
		membersContainer.append(memberElement);

		let userLinkup = getUserLinkup(linkupUserPivots, linkupID, linkupUser.id.toNumber());
		if (!userLinkup.response) {
			return;
		}

		let memberIconElement = newElement('i', ['fa-regular', 'fa-circle-check']);
		memberElement.append(memberIconElement);
	});

	// buttons (broadcast)
	let buttonsContainer = newElement('div', 'buttons');
	let broadcastFormContainer = newElement('div', ['broadcastForm']);

	let broadcastFormElement = newElement('form');
	let toElement = newElement('select');

	let linkupUsersIDs = linkupUsers.map((linkupUser) => linkupUser.id.toNumber());
	userContacts.forEach((userContact) => {
		if (linkupUsersIDs.includes(userContact.id.toNumber())) {
			return;
		}

		let toOptionElement = newElement('option', '', userContact.fullname);
		toOptionElement.value = userContact.id.toNumber();
		toElement.append(toOptionElement);
	});

	let submitElement = newElement('input');
	submitElement.value = 'Broadcast';
	submitElement.type = 'submit';

	let broadcastLoadingContainer = createLoadingContainter();

	buttonsContainer.append(broadcastFormContainer);
	broadcastFormContainer.append(broadcastFormElement);
	broadcastFormElement.append(toElement);
	broadcastFormElement.append(submitElement);
	broadcastFormContainer.append(broadcastLoadingContainer);
	linkupElement.appendChild(buttonsContainer);

	submitElement.addEventListener('click', async (event) => {
		replaceButtonWithLoading(submitElement, broadcastLoadingContainer);

		linkupBroadcastInterval[linkupID] = {
			interval: setInterval(() => bounceLoading(broadcastLoadingContainer), 300),
			element: linkupElement,
		};

		await userLinkupContract.create(toElement.value, linkupID, userID);
	});

	// buttons (join/leave)
	let userLinkup = getUserLinkup(linkupUserPivots, linkupID, userID);

	if (userLinkup.response) {
		appendLeaveBtn(linkupElement, linkupID, userLinkup);
	} else {
		appendJoinBtn(linkupElement, linkupID, userLinkup);
	}
}

async function prependUnconnectedLinkUp(linkup) {
	let linkupID = linkup.id.toNumber();

	let linkupElement = newElement('div', ['linkup', 'columnContainer']);
	linkupContainer.prepend(linkupElement);

	// status
	let statusElement = newElement('p', ['type'], '🎉 ' + linkup.status);
	linkupElement.appendChild(statusElement);

	// location
	let locationElement = newElement('p', ['location'], ' ' + linkup.location);
	console.log(linkup.location == '');
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

	let broadcastedByElement = newElement('p', '', ' ' + 'Syiox');
	let broadcastByIconElement = newElement('i', ['fa-solid', 'fa-bullhorn']);
	broadcastedByElement.prepend(broadcastByIconElement);
	linkupElement.appendChild(broadcastedByElement);

	// members
	let membersContainer = newElement('ul', 'members');
	linkupElement.appendChild(membersContainer);

	let memberElement01 = newElement('li', '', 'Jamaaly');
	let memberElement02 = newElement('li', '', 'Mbolo');
	let memberIconElement01 = newElement('i', ['fa-regular', 'fa-circle-check']);
	let memberIconElement02 = newElement('i', ['fa-regular', 'fa-circle-check']);

	memberElement01.append(memberIconElement01);
	memberElement02.append(memberIconElement02);

	membersContainer.append(memberElement01);
	membersContainer.append(memberElement02);

	// buttons (broadcast)
	let buttonsContainer = newElement('div', 'buttons');
	let broadcastFormContainer = newElement('div', ['broadcastForm']);

	let broadcastFormElement = newElement('form');
	let toElement = newElement('select');

	let toOptionElement = newElement('option', '', 'Mistik');
	toOptionElement.value = 1;
	toElement.append(toOptionElement);

	let submitElement = newElement('input');
	submitElement.value = 'Broadcast';
	submitElement.type = 'submit';

	let broadcastLoadingContainer = createLoadingContainter();

	buttonsContainer.append(broadcastFormContainer);
	broadcastFormContainer.append(broadcastFormElement);
	broadcastFormElement.append(toElement);
	broadcastFormElement.append(submitElement);
	broadcastFormContainer.append(broadcastLoadingContainer);
	linkupElement.appendChild(buttonsContainer);

	// buttons (join/leave)
	let joinBlock = newElement('div', ['joinBtn']);
	let joinBtnContainer = newElement('div');
	let joinBtnElement = newElement('button', [], 'Join');

	let joinLoadingContainer = createLoadingContainter();

	joinBtnContainer.append(joinBtnElement);
	joinBlock.append(joinBtnContainer);
	joinBlock.appendChild(joinLoadingContainer);
	linkupElement.appendChild(joinBlock);
}

function appendLeaveBtn(linkupElement, linkupID, userLinkup) {
	let leaveBlock = newElement('div', ['leaveBtn']);
	let leaveBtnContainer = newElement('div');
	let leaveBtnElement = newElement('button', 'hide', 'Leave');

	let leaveLoadingContainer = createLoadingContainter();

	leaveBtnContainer.append(leaveBtnElement);
	leaveBlock.append(leaveBtnContainer);
	leaveBlock.appendChild(leaveLoadingContainer);
	linkupElement.appendChild(leaveBlock);

	leaveBtnElement.addEventListener('click', async () => {
		replaceButtonWithLoading(leaveBtnContainer, leaveLoadingContainer);

		linkupLeaveInterval[linkupID] = {
			interval: setInterval(() => bounceLoading(leaveLoadingContainer), 300),
			element: linkupElement,
		};

		await userLinkupContract.leave(userLinkup.id.toNumber());
	});
}

function appendJoinBtn(linkupElement, linkupID, userLinkup) {
	let joinBlock = newElement('div', ['joinBtn']);
	let joinBtnContainer = newElement('div');
	let joinBtnElement = newElement('button', [], 'Join');

	let joinLoadingContainer = createLoadingContainter();

	joinBtnContainer.append(joinBtnElement);
	joinBlock.append(joinBtnContainer);
	joinBlock.appendChild(joinLoadingContainer);
	linkupElement.appendChild(joinBlock);

	joinBtnElement.addEventListener('click', async () => {
		replaceButtonWithLoading(joinBtnContainer, joinLoadingContainer);

		linkupJoinInterval[linkupID] = {
			interval: setInterval(() => bounceLoading(joinLoadingContainer), 300),
			element: linkupElement,
		};

		await userLinkupContract.join(userLinkup.id.toNumber());
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
	if (contact.fullname == '') {
		return;
	}

	let contactOption = newElement('option', '', contact.fullname);
	contactOption.value = contact.id;
	contactOption.innerHTML = contact.fullname;

	linkupFormContacts.appendChild(contactOption);
}

function getUserLinkup(linkupUserPivots, linkupID, linkupUserID) {
	return linkupUserPivots.find((pivot) => {
		return pivot.linkup_id.toNumber() == linkupID && pivot.user_id.toNumber() == linkupUserID;
	});
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
			searchUser.owner !== clientAddress &&
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
		let contactID = contact.id;

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
		let contactID = contact.id;

		replaceButtonWithLoading(btn, loadingContainer);
		addContactLoadings[contactID] = {
			interval: setInterval(() => bounceLoading(loadingContainer), 300),
			element: element,
		};

		await userContactContract.create(userID, contactID);
	});
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
		let contactID = suggestion.id;

		replaceButtonWithLoading(btn, loadingContainer);
		addContactLoadings[contactID] = {
			interval: setInterval(() => bounceLoading(loadingContainer), 300),
			element: suggestionItem,
		};

		await userContactContract.create(userID, contactID);
	});
}
