import { ethers } from './ethers-5.1.esm.min.js';
import { linkupAddress, linkupABI } from './constants/linkup.js';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const linkupContract = new ethers.Contract(linkupAddress, linkupABI, provider.getSigner());
const allLinkups = await linkupContract.getAll();

const linkupContainer = document.querySelectorAll('.linkups')[0];
const days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getMoment(linkup) {
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

function shakeLoadingDisplay() {
	let largeLoadingElement = document.querySelectorAll('.loading span.large')[0];

	if (largeLoadingElement.classList.contains('third')) {
		largeLoadingElement.classList.remove('large');

		let firstLoadingSpan = document.querySelectorAll('.loading span:first-of-type')[0];
		firstLoadingSpan.classList.add('large');

		return;
	}

	let nextLoadingElement = document.querySelectorAll('.loading span.large + span')[0];
	nextLoadingElement.classList.add('large');
	largeLoadingElement.classList.remove('large');
}

// const loadingDisplay = setInterval(shakeLoadingDisplay, 300);
// clearInterval(loadingDisplay);

allLinkups.forEach((linkup) => {
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
	momentElement.innerHTML = ' ' + getMoment(linkup);
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
});
