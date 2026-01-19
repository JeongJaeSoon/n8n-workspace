import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class MockApi implements ICredentialType {
	name = 'mockApi';
	displayName = 'Mock API';
	documentationUrl = 'https://github.com/JeongJaeSoon/n8n-workspace';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Mock API Key (any value works for testing)',
		},
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{
					name: 'Sandbox',
					value: 'sandbox',
				},
				{
					name: 'Production',
					value: 'production',
				},
			],
			default: 'sandbox',
			description: 'The environment to use',
		},
	];
}
