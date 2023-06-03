async function connect() {
	if (typeof window.ethereum !== 'undefined') {
		console.log('I see metamask');
		await window.ethereum.request({ method: 'eth_requestAccounts' });
	} else {
		console.log('No metamask');
	}
}
