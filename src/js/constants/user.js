export const userContractAddress = '0xeA00499a977fae6f8C2613FEB5a726712379767a';

export const userContractABI = [
	{
		inputs: [],
		name: 'count',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'string', name: '_fullname', type: 'string' },
			{ internalType: 'string[]', name: '_musicTaste', type: 'string[]' },
			{ internalType: 'string[]', name: '_foodTaste', type: 'string[]' },
			{ internalType: 'string[]', name: '_sportsTaste', type: 'string[]' },
		],
		name: 'create',
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
		inputs: [
			{ internalType: 'uint256', name: '_id', type: 'uint256' },
			{ internalType: 'string', name: '_fullname', type: 'string' },
			{ internalType: 'string[]', name: '_musicTaste', type: 'string[]' },
			{ internalType: 'string[]', name: '_foodTaste', type: 'string[]' },
			{ internalType: 'string[]', name: '_sportsTaste', type: 'string[]' },
		],
		name: 'update',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		name: 'users',
		outputs: [
			{ internalType: 'address', name: 'owner', type: 'address' },
			{ internalType: 'string', name: 'fullname', type: 'string' },
		],
		stateMutability: 'view',
		type: 'function',
	},
];
