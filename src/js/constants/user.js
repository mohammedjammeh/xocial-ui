export const userContractAddress = '0x0203B5Fab6F4145DC6c8269C0EA823B83fbE7cEd';

export const userContractABI = [
	{
		inputs: [
			{ internalType: 'uint256', name: 'user_id', type: 'uint256' },
			{ internalType: 'uint256', name: 'contact_id', type: 'uint256' },
		],
		name: 'addLink',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
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
			{ internalType: 'address', name: '_owner', type: 'address' },
			{ internalType: 'string', name: '_fullName', type: 'string' },
			{ internalType: 'string[]', name: '_musicTaste', type: 'string[]' },
		],
		name: 'create',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
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
					{ internalType: 'string', name: 'fullName', type: 'string' },
					{ internalType: 'string[]', name: 'musicTaste', type: 'string[]' },
					{ internalType: 'uint256[]', name: 'contacts', type: 'uint256[]' },
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
		name: 'users',
		outputs: [
			{ internalType: 'address', name: 'owner', type: 'address' },
			{ internalType: 'string', name: 'fullName', type: 'string' },
		],
		stateMutability: 'view',
		type: 'function',
	},
];
