export const linkupAddress = '0x4C98F0CC59bF2B6BFD58c5949A5A661416A0aD16';

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
			{ internalType: 'address', name: '_owner', type: 'address' },
			{ internalType: 'string', name: '_status', type: 'string' },
			{ internalType: 'string', name: '_description', type: 'string' },
			{ internalType: 'string', name: '_location', type: 'string' },
			{ internalType: 'uint256', name: '_startTime', type: 'uint256' },
			{ internalType: 'uint256', name: '_endTime', type: 'uint256' },
			{ internalType: 'address[]', name: '_attendees', type: 'address[]' },
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
					{ internalType: 'string', name: 'status', type: 'string' },
					{ internalType: 'string', name: 'description', type: 'string' },
					{ internalType: 'string', name: 'location', type: 'string' },
					{ internalType: 'uint256', name: 'startTime', type: 'uint256' },
					{ internalType: 'uint256', name: 'endTime', type: 'uint256' },
					{ internalType: 'address[]', name: 'attendees', type: 'address[]' },
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
