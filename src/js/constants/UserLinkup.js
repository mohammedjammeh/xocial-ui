export const userLinkupAddress = '0x8da12914C247EEb30C8078774fAc43190aa8460d';

export const userLinkupABI = [
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: 'uint256', name: 'userID', type: 'uint256' },
			{ indexed: false, internalType: 'uint256', name: 'linkupID', type: 'uint256' },
		],
		name: 'NewUserLinkup',
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
			{ internalType: 'uint256', name: '_linkup_id', type: 'uint256' },
			{ internalType: 'uint256', name: '_from_user_id', type: 'uint256' },
		],
		name: 'create',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'uint256', name: '_user_linkup_id', type: 'uint256' }],
		name: 'get',
		outputs: [
			{
				components: [
					{ internalType: 'uint256', name: 'id', type: 'uint256' },
					{ internalType: 'uint256', name: 'linkup_id', type: 'uint256' },
					{ internalType: 'uint256', name: 'user_id', type: 'uint256' },
					{ internalType: 'uint256', name: 'response', type: 'uint256' },
					{ internalType: 'uint256', name: 'from_user_id', type: 'uint256' },
				],
				internalType: 'struct UserLinkup.UserLinkupsPivot',
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
					{ internalType: 'uint256', name: 'linkup_id', type: 'uint256' },
					{ internalType: 'uint256', name: 'user_id', type: 'uint256' },
					{ internalType: 'uint256', name: 'response', type: 'uint256' },
					{ internalType: 'uint256', name: 'from_user_id', type: 'uint256' },
				],
				internalType: 'struct UserLinkup.UserLinkupsPivot[]',
				name: '',
				type: 'tuple[]',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'uint256', name: '_linkup_id', type: 'uint256' }],
		name: 'getLinkupUsers',
		outputs: [
			{
				components: [{ internalType: 'uint256', name: 'user_linkup_id', type: 'uint256' }],
				internalType: 'struct UserLinkup.LinkupUsers[]',
				name: '',
				type: 'tuple[]',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'uint256', name: '_user_id', type: 'uint256' }],
		name: 'getUserLinkups',
		outputs: [
			{
				components: [{ internalType: 'uint256', name: 'user_linkup_id', type: 'uint256' }],
				internalType: 'struct UserLinkup.UsersLinkups[]',
				name: '',
				type: 'tuple[]',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'uint256', name: '', type: 'uint256' },
			{ internalType: 'uint256', name: '', type: 'uint256' },
		],
		name: 'linkupUsers',
		outputs: [{ internalType: 'uint256', name: 'user_linkup_id', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'uint256', name: '', type: 'uint256' },
			{ internalType: 'uint256', name: '', type: 'uint256' },
		],
		name: 'userLinkups',
		outputs: [{ internalType: 'uint256', name: 'user_linkup_id', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		name: 'userLinkupsPivot',
		outputs: [
			{ internalType: 'uint256', name: 'id', type: 'uint256' },
			{ internalType: 'uint256', name: 'linkup_id', type: 'uint256' },
			{ internalType: 'uint256', name: 'user_id', type: 'uint256' },
			{ internalType: 'uint256', name: 'response', type: 'uint256' },
			{ internalType: 'uint256', name: 'from_user_id', type: 'uint256' },
		],
		stateMutability: 'view',
		type: 'function',
	},
];
