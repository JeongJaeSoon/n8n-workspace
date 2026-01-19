import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

interface MockUser {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	age: number;
	active: boolean;
}

interface MockProduct {
	id: string;
	name: string;
	price: number;
	category: string;
	inStock: boolean;
}

interface MockOrder {
	orderId: string;
	userId: string;
	items: Array<{ productId: string; quantity: number; price: number }>;
	total: number;
	status: string;
}

interface GeneratorOptions {
	prefix?: string;
	includeRandomId?: boolean;
	includeTimestamp?: boolean;
}

const FIRST_NAMES = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'James', 'Emma', 'Robert', 'Olivia'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Taylor'];
const PRODUCT_NAMES = ['Widget', 'Gadget', 'Device', 'Tool', 'Component', 'Module', 'Unit', 'System', 'Kit', 'Set'];
const CATEGORIES = ['Electronics', 'Home', 'Office', 'Sports', 'Fashion', 'Books', 'Food', 'Health', 'Toys', 'Garden'];
const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

function generateId(prefix?: string): string {
	const randomPart = Math.random().toString(36).substring(2, 10);
	const timestamp = Date.now().toString(36);
	const id = `${timestamp}-${randomPart}`;
	return prefix ? `${prefix}-${id}` : id;
}

function generateUser(options: GeneratorOptions): MockUser {
	const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
	const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];

	return {
		id: options.includeRandomId !== false ? generateId(options.prefix) : '',
		firstName,
		lastName,
		email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
		age: Math.floor(Math.random() * 50) + 18,
		active: Math.random() > 0.3,
	};
}

function generateProduct(options: GeneratorOptions): MockProduct {
	const name = PRODUCT_NAMES[Math.floor(Math.random() * PRODUCT_NAMES.length)];
	const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

	return {
		id: options.includeRandomId !== false ? generateId(options.prefix) : '',
		name: `${name} ${Math.floor(Math.random() * 1000)}`,
		price: Math.round(Math.random() * 10000) / 100,
		category,
		inStock: Math.random() > 0.2,
	};
}

function generateOrder(options: GeneratorOptions): MockOrder {
	const itemCount = Math.floor(Math.random() * 5) + 1;
	const orderItems: Array<{ productId: string; quantity: number; price: number }> = [];
	let total = 0;

	for (let i = 0; i < itemCount; i++) {
		const price = Math.round(Math.random() * 10000) / 100;
		const quantity = Math.floor(Math.random() * 5) + 1;
		orderItems.push({
			productId: generateId(),
			quantity,
			price,
		});
		total += price * quantity;
	}

	return {
		orderId: options.includeRandomId !== false ? generateId(options.prefix) : '',
		userId: generateId(),
		items: orderItems,
		total: Math.round(total * 100) / 100,
		status: ORDER_STATUSES[Math.floor(Math.random() * ORDER_STATUSES.length)],
	};
}

export class MockDataGenerator implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mock Data Generator',
		name: 'mockDataGenerator',
		icon: 'fa:database',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate mock data for testing and learning purposes',
		defaults: {
			name: 'Mock Data Generator',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'mockApi',
				required: false,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Generate Users',
						value: 'generateUsers',
						description: 'Generate fake user data',
						action: 'Generate fake user data',
					},
					{
						name: 'Generate Products',
						value: 'generateProducts',
						description: 'Generate fake product data',
						action: 'Generate fake product data',
					},
					{
						name: 'Generate Orders',
						value: 'generateOrders',
						description: 'Generate fake order data',
						action: 'Generate fake order data',
					},
					{
						name: 'Echo Input',
						value: 'echoInput',
						description: 'Return the input data with metadata',
						action: 'Return the input data with metadata',
					},
				],
				default: 'generateUsers',
			},
			{
				displayName: 'Count',
				name: 'count',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 1000,
				},
				default: 5,
				description: 'Number of items to generate',
				displayOptions: {
					show: {
						operation: ['generateUsers', 'generateProducts', 'generateOrders'],
					},
				},
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Include Timestamp',
						name: 'includeTimestamp',
						type: 'boolean',
						default: false,
						description: 'Whether to include a timestamp in the generated data',
					},
					{
						displayName: 'Include Random ID',
						name: 'includeRandomId',
						type: 'boolean',
						default: true,
						description: 'Whether to include a random ID in the generated data',
					},
					{
						displayName: 'Prefix',
						name: 'prefix',
						type: 'string',
						default: '',
						description: 'Prefix to add to generated IDs',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const operation = this.getNodeParameter('operation', 0) as string;
		const options = this.getNodeParameter('options', 0, {}) as GeneratorOptions;

		if (operation === 'echoInput') {
			for (let i = 0; i < items.length; i++) {
				const item = items[i];
				const outputItem: IDataObject = {
					...item.json,
					_meta: {
						nodeVersion: 1,
						executedAt: options.includeTimestamp ? new Date().toISOString() : undefined,
						inputIndex: i,
						totalInputs: items.length,
					},
				};

				if (options.includeRandomId) {
					outputItem._id = generateId(options.prefix);
				}

				returnData.push({ json: outputItem });
			}
		} else {
			const count = this.getNodeParameter('count', 0) as number;

			for (let i = 0; i < count; i++) {
				let generatedItem: IDataObject;

				switch (operation) {
					case 'generateUsers':
						generatedItem = generateUser(options) as unknown as IDataObject;
						break;
					case 'generateProducts':
						generatedItem = generateProduct(options) as unknown as IDataObject;
						break;
					case 'generateOrders':
						generatedItem = generateOrder(options) as unknown as IDataObject;
						break;
					default:
						generatedItem = {};
				}

				if (options.includeTimestamp) {
					generatedItem.createdAt = new Date().toISOString();
				}

				returnData.push({ json: generatedItem });
			}
		}

		return [returnData];
	}
}
