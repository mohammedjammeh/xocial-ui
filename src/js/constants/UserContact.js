export const userContactAddress = '0x88184966d92abf82b1794517e7363Bc966028B5D';

export const userContactABI = [
	{
		inputs: [{ internalType: 'address[]', name: 'addresses', type: 'address[]' }],
		stateMutability: 'nonpayable',
		type: 'constructor',
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: 'address', name: 'to', type: 'address' },
			{
				components: [
					{ internalType: 'uint256', name: 'id', type: 'uint256' },
					{ internalType: 'uint256', name: 'contact_id', type: 'uint256' },
					{ internalType: 'uint256', name: 'user_id', type: 'uint256' },
					{ internalType: 'bool', name: 'active', type: 'bool' },
				],
				indexed: false,
				internalType: 'struct UserContact.Pivot',
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
					{ internalType: 'uint256', name: 'id', type: 'uint256' },
					{ internalType: 'uint256', name: 'contact_id', type: 'uint256' },
					{ internalType: 'uint256', name: 'user_id', type: 'uint256' },
					{ internalType: 'bool', name: 'active', type: 'bool' },
				],
				indexed: false,
				internalType: 'struct UserContact.Pivot',
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
		inputs: [{ internalType: 'uint256', name: '_user_contact_id', type: 'uint256' }],
		name: 'get',
		outputs: [
			{
				components: [
					{ internalType: 'uint256', name: 'id', type: 'uint256' },
					{ internalType: 'uint256', name: 'contact_id', type: 'uint256' },
					{ internalType: 'uint256', name: 'user_id', type: 'uint256' },
					{ internalType: 'bool', name: 'active', type: 'bool' },
				],
				internalType: 'struct UserContact.Pivot',
				name: '',
				type: 'tuple',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'getAll',
		outputs: [
			{
				components: [
					{ internalType: 'uint256', name: 'id', type: 'uint256' },
					{ internalType: 'uint256', name: 'contact_id', type: 'uint256' },
					{ internalType: 'uint256', name: 'user_id', type: 'uint256' },
					{ internalType: 'bool', name: 'active', type: 'bool' },
				],
				internalType: 'struct UserContact.Pivot[]',
				name: '',
				type: 'tuple[]',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'uint256', name: '_user_id', type: 'uint256' }],
		name: 'getContacts',
		outputs: [
			{
				components: [
					{ internalType: 'uint256', name: 'id', type: 'uint256' },
					{ internalType: 'address', name: 'owner', type: 'address' },
					{ internalType: 'string', name: 'fullname', type: 'string' },
					{ internalType: 'string[]', name: 'musicTaste', type: 'string[]' },
					{ internalType: 'string[]', name: 'foodTaste', type: 'string[]' },
					{ internalType: 'string[]', name: 'sportsTaste', type: 'string[]' },
				],
				internalType: 'struct User.UserStruct[]',
				name: '',
				type: 'tuple[]',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		name: 'pivots',
		outputs: [
			{ internalType: 'uint256', name: 'id', type: 'uint256' },
			{ internalType: 'uint256', name: 'contact_id', type: 'uint256' },
			{ internalType: 'uint256', name: 'user_id', type: 'uint256' },
			{ internalType: 'bool', name: 'active', type: 'bool' },
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'uint256', name: '', type: 'uint256' },
			{ internalType: 'uint256', name: '', type: 'uint256' },
		],
		name: 'userContacts',
		outputs: [{ internalType: 'uint256', name: 'user_contact_id', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'userContract',
		outputs: [{ internalType: 'contract User', name: '', type: 'address' }],
		stateMutability: 'view',
		type: 'function',
	},
];
