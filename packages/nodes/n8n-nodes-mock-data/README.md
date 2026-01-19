# n8n-nodes-mock-data

This is an n8n community node for generating mock data for testing and learning purposes. It allows you to create fake users, products, and orders without calling any external API.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

| Operation | Description | Output |
|-----------|-------------|--------|
| Generate Users | Generate fake user data | `{id, firstName, lastName, email, age, active}` |
| Generate Products | Generate fake product data | `{id, name, price, category, inStock}` |
| Generate Orders | Generate fake order data | `{orderId, userId, items, total, status}` |
| Echo Input | Return the input data with metadata | Input + metadata |

## Options

- **Count**: Number of items to generate (1-1000)
- **Include Timestamp**: Add creation timestamp to generated data
- **Include Random ID**: Add a unique random ID to each item
- **Prefix**: Custom prefix for generated IDs

## Credentials

This node includes optional Mock API credentials with:
- **API Key**: Any value (for testing purposes)
- **Environment**: Sandbox or Production

## Compatibility

Tested with n8n version 1.x and above.

## Usage

1. Add the "Mock Data Generator" node to your workflow
2. Select an operation (Generate Users, Generate Products, Generate Orders, or Echo Input)
3. Set the count for how many items to generate
4. Configure options as needed
5. Execute the node

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [Repository](https://github.com/JeongJaeSoon/n8n-workspace)

## Version history

### 0.1.0
- Initial release with Generate Users, Generate Products, Generate Orders, and Echo Input operations
