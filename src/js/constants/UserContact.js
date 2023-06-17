export const userContactAddress = '0xB3D219748a3CB835346EFCDbEaF11aCaA4963bFD';

export const userContactABI = [
	{
		inputs: [],
		name: 'count',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'uint256', name: '_user_id', type: 'uint256' },
			{ internalType: 'uint256', name: '_contact_id', type: 'uint256' },
		],
		name: 'create',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		name: 'userContacts',
		outputs: [
			{ internalType: 'uint256', name: 'contact_id', type: 'uint256' },
			{ internalType: 'uint256', name: 'user_id', type: 'uint256' },
			{ internalType: 'string', name: 'response', type: 'string' },
		],
		stateMutability: 'view',
		type: 'function',
	},
];
