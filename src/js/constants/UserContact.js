export const userContactAddress = '0xd99De20753ce099F7598827A0d6827d4BD99d89F';

export const userContactABI = [
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: 'address', name: 'to', type: 'address' },
			{
				components: [
					{ internalType: 'uint256', name: 'contact_id', type: 'uint256' },
					{ internalType: 'uint256', name: 'user_id', type: 'uint256' },
					{ internalType: 'bool', name: 'active', type: 'bool' },
				],
				indexed: false,
				internalType: 'struct UserContact.UserContactStruct',
				name: 'userContact',
				type: 'tuple',
			},
		],
		name: 'UserContactCreated',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: 'address', name: 'to', type: 'address' },
			{
				components: [
					{ internalType: 'uint256', name: 'contact_id', type: 'uint256' },
					{ internalType: 'uint256', name: 'user_id', type: 'uint256' },
					{ internalType: 'bool', name: 'active', type: 'bool' },
				],
				indexed: false,
				internalType: 'struct UserContact.UserContactStruct',
				name: 'userContact',
				type: 'tuple',
			},
		],
		name: 'UserContactDestroyed',
		type: 'event',
	},
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
		inputs: [{ internalType: 'uint256', name: '_user_contact_id', type: 'uint256' }],
		name: 'destroy',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'getAll',
		outputs: [
			{
				components: [
					{ internalType: 'uint256', name: 'contact_id', type: 'uint256' },
					{ internalType: 'uint256', name: 'user_id', type: 'uint256' },
					{ internalType: 'bool', name: 'active', type: 'bool' },
				],
				internalType: 'struct UserContact.UserContactStruct[]',
				name: '',
				type: 'tuple[]',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		name: 'userContacts',
		outputs: [
			{ internalType: 'uint256', name: 'contact_id', type: 'uint256' },
			{ internalType: 'uint256', name: 'user_id', type: 'uint256' },
			{ internalType: 'bool', name: 'active', type: 'bool' },
		],
		stateMutability: 'view',
		type: 'function',
	},
];
