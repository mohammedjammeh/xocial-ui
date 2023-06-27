export const linkupAddress = '0x15c7578b0633FcC38017a416a66aff2D666bBA81';

export const linkupABI = [
	{
		inputs: [],
		name: 'count',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'string', name: '_status', type: 'string' },
			{ internalType: 'string', name: '_description', type: 'string' },
			{ internalType: 'string', name: '_location', type: 'string' },
			{ internalType: 'uint256', name: '_startTime', type: 'uint256' },
			{ internalType: 'uint256', name: '_endTime', type: 'uint256' },
		],
		name: 'create',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'uint256', name: '_linkup_id', type: 'uint256' }],
		name: 'get',
		outputs: [
			{
				components: [
					{ internalType: 'uint256', name: 'id', type: 'uint256' },
					{ internalType: 'address', name: 'owner', type: 'address' },
					{ internalType: 'string', name: 'status', type: 'string' },
					{ internalType: 'string', name: 'description', type: 'string' },
					{ internalType: 'string', name: 'location', type: 'string' },
					{ internalType: 'uint256', name: 'startTime', type: 'uint256' },
					{ internalType: 'uint256', name: 'endTime', type: 'uint256' },
				],
				internalType: 'struct Linkup.LinkupStruct',
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
					{ internalType: 'address', name: 'owner', type: 'address' },
					{ internalType: 'string', name: 'status', type: 'string' },
					{ internalType: 'string', name: 'description', type: 'string' },
					{ internalType: 'string', name: 'location', type: 'string' },
					{ internalType: 'uint256', name: 'startTime', type: 'uint256' },
					{ internalType: 'uint256', name: 'endTime', type: 'uint256' },
				],
				internalType: 'struct Linkup.LinkupStruct[]',
				name: '',
				type: 'tuple[]',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		name: 'linkups',
		outputs: [
			{ internalType: 'uint256', name: 'id', type: 'uint256' },
			{ internalType: 'address', name: 'owner', type: 'address' },
			{ internalType: 'string', name: 'status', type: 'string' },
			{ internalType: 'string', name: 'description', type: 'string' },
			{ internalType: 'string', name: 'location', type: 'string' },
			{ internalType: 'uint256', name: 'startTime', type: 'uint256' },
			{ internalType: 'uint256', name: 'endTime', type: 'uint256' },
		],
		stateMutability: 'view',
		type: 'function',
	},
];
