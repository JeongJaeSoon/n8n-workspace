# n8n 커스텀 노드 개발 참고서

> 이 문서는 n8n 커스텀 노드를 개발할 때 참고할 전체 코드와 설정을 담고 있습니다.

---

## 목차

1. [프로젝트 생성](#1-프로젝트-생성)
2. [package.json 설정](#2-packagejson-설정)
3. [tsconfig.json 설정](#3-tsconfigjson-설정)
4. [RandomDataGenerator 노드](#4-randomdatagenerator-노드)
5. [JsonPlaceholder 노드 (Declarative)](#5-jsonplaceholder-노드-declarative)
6. [TextTransformer 노드](#6-texttransformer-노드)
7. [JsonPlaceholderApi Credentials](#7-jsonplaceholderapi-credentials)
8. [빌드 및 테스트](#8-빌드-및-테스트)

---

## 1. 프로젝트 생성

### CLI 사용 (권장)

```bash
# packages/nodes 디렉토리로 이동
cd packages/nodes

# CLI 도구로 프로젝트 생성
bun create @n8n/node n8n-nodes-samples

# CLI 프롬프트 응답:
# - Project name: n8n-nodes-samples
# - Node type: Regular
# - Template: Starter (또는 Programmatic)

# 의존성 설치
cd n8n-nodes-samples
bun install
```

### 수동 생성 (디렉토리 구조)

```
packages/nodes/n8n-nodes-samples/
├── nodes/
│   ├── RandomDataGenerator/
│   │   └── RandomDataGenerator.node.ts
│   ├── JsonPlaceholder/
│   │   └── JsonPlaceholder.node.ts
│   └── TextTransformer/
│       └── TextTransformer.node.ts
├── credentials/
│   └── JsonPlaceholderApi.credentials.ts
├── package.json
└── tsconfig.json
```

---

## 2. package.json 설정

**파일:** `packages/nodes/n8n-nodes-samples/package.json`

```json
{
  "name": "n8n-nodes-samples",
  "version": "0.1.0",
  "description": "Sample n8n custom nodes for learning",
  "keywords": [
    "n8n-community-node-package"
  ],
  "license": "MIT",
  "homepage": "",
  "author": {
    "name": "Your Name",
    "email": "your@email.com"
  },
  "repository": {
    "type": "git",
    "url": ""
  },
  "main": "index.js",
  "scripts": {
    "build": "tsc && gulp build:icons",
    "dev": "tsc --watch",
    "format": "prettier nodes credentials --write",
    "lint": "eslint nodes credentials --ext .ts --fix",
    "prepublishOnly": "bun run build"
  },
  "files": [
    "dist"
  ],
  "n8n": {
    "n8nNodesApiVersion": 1,
    "credentials": [
      "dist/credentials/JsonPlaceholderApi.credentials.js"
    ],
    "nodes": [
      "dist/nodes/RandomDataGenerator/RandomDataGenerator.node.js",
      "dist/nodes/JsonPlaceholder/JsonPlaceholder.node.js",
      "dist/nodes/TextTransformer/TextTransformer.node.js"
    ]
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint": "^8.57.0",
    "gulp": "^4.0.2",
    "n8n-workflow": "^1.0.0",
    "prettier": "^3.2.0",
    "typescript": "^5.3.0"
  },
  "peerDependencies": {
    "n8n-workflow": ">=1.0.0"
  }
}
```

### 핵심 설정 설명

| 필드 | 설명 |
|------|------|
| `keywords` | `n8n-community-node-package`는 n8n이 커스텀 노드를 인식하는 데 필수 |
| `n8n.n8nNodesApiVersion` | `1`로 설정 (n8n 1.x, 2.x 모두 호환) |
| `n8n.credentials` | 빌드된 credentials 파일 경로 배열 |
| `n8n.nodes` | 빌드된 노드 파일 경로 배열 |
| `peerDependencies` | n8n-workflow를 peer로 설정 (런타임에 n8n이 제공) |

---

## 3. tsconfig.json 설정

**파일:** `packages/nodes/n8n-nodes-samples/tsconfig.json`

```json
{
  "compilerOptions": {
    "strict": true,
    "module": "CommonJS",
    "target": "ES2022",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "."
  },
  "include": [
    "nodes/**/*.ts",
    "credentials/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

---

## 4. RandomDataGenerator 노드

> **스타일:** Programmatic
> **기능:** UUID, 랜덤 숫자, 랜덤 문자열, 타임스탬프 생성

**파일:** `nodes/RandomDataGenerator/RandomDataGenerator.node.ts`

```typescript
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

export class RandomDataGenerator implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Random Data Generator',
    name: 'randomDataGenerator',
    icon: 'fa:random',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Generate random data: UUID, numbers, strings, timestamps',
    defaults: {
      name: 'Random Data Generator',
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      // Operation 선택
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'UUID',
            value: 'uuid',
            description: 'Generate a UUID v4',
            action: 'Generate a UUID v4',
          },
          {
            name: 'Random Number',
            value: 'number',
            description: 'Generate a random number',
            action: 'Generate a random number',
          },
          {
            name: 'Random String',
            value: 'string',
            description: 'Generate a random string',
            action: 'Generate a random string',
          },
          {
            name: 'Timestamp',
            value: 'timestamp',
            description: 'Generate current timestamp',
            action: 'Generate current timestamp',
          },
        ],
        default: 'uuid',
      },
      // Random Number 옵션
      {
        displayName: 'Min',
        name: 'min',
        type: 'number',
        default: 0,
        description: 'Minimum value (inclusive)',
        displayOptions: {
          show: {
            operation: ['number'],
          },
        },
      },
      {
        displayName: 'Max',
        name: 'max',
        type: 'number',
        default: 100,
        description: 'Maximum value (inclusive)',
        displayOptions: {
          show: {
            operation: ['number'],
          },
        },
      },
      // Random String 옵션
      {
        displayName: 'Length',
        name: 'length',
        type: 'number',
        default: 10,
        description: 'Length of the random string',
        displayOptions: {
          show: {
            operation: ['string'],
          },
        },
      },
      {
        displayName: 'Character Set',
        name: 'charset',
        type: 'options',
        options: [
          {
            name: 'Alphanumeric',
            value: 'alphanumeric',
          },
          {
            name: 'Alphabetic',
            value: 'alphabetic',
          },
          {
            name: 'Numeric',
            value: 'numeric',
          },
          {
            name: 'Hex',
            value: 'hex',
          },
        ],
        default: 'alphanumeric',
        displayOptions: {
          show: {
            operation: ['string'],
          },
        },
      },
      // Timestamp 옵션
      {
        displayName: 'Format',
        name: 'timestampFormat',
        type: 'options',
        options: [
          {
            name: 'Unix (seconds)',
            value: 'unix',
          },
          {
            name: 'Unix (milliseconds)',
            value: 'unixMs',
          },
          {
            name: 'ISO 8601',
            value: 'iso',
          },
        ],
        default: 'iso',
        displayOptions: {
          show: {
            operation: ['timestamp'],
          },
        },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const operation = this.getNodeParameter('operation', i) as string;
        let result: string | number;

        switch (operation) {
          case 'uuid':
            result = crypto.randomUUID();
            break;

          case 'number':
            const min = this.getNodeParameter('min', i) as number;
            const max = this.getNodeParameter('max', i) as number;
            result = Math.floor(Math.random() * (max - min + 1)) + min;
            break;

          case 'string':
            const length = this.getNodeParameter('length', i) as number;
            const charset = this.getNodeParameter('charset', i) as string;
            result = generateRandomString(length, charset);
            break;

          case 'timestamp':
            const format = this.getNodeParameter('timestampFormat', i) as string;
            const now = new Date();
            if (format === 'unix') {
              result = Math.floor(now.getTime() / 1000);
            } else if (format === 'unixMs') {
              result = now.getTime();
            } else {
              result = now.toISOString();
            }
            break;

          default:
            throw new Error(`Unknown operation: ${operation}`);
        }

        returnData.push({
          json: {
            ...items[i].json,
            randomData: result,
          },
          pairedItem: { item: i },
        });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: (error as Error).message },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}

// 헬퍼 함수
function generateRandomString(length: number, charset: string): string {
  const charsets: Record<string, string> = {
    alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    alphabetic: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    numeric: '0123456789',
    hex: '0123456789abcdef',
  };

  const chars = charsets[charset] || charsets.alphanumeric;
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}
```

### 핵심 개념 설명

| 개념 | 설명 |
|------|------|
| `INodeType` | 모든 n8n 노드가 구현해야 하는 인터페이스 |
| `description` | 노드의 메타데이터와 UI 프로퍼티 정의 |
| `execute()` | 노드 실행 로직, `INodeExecutionData[][]` 반환 |
| `displayOptions.show` | 조건부 UI 표시 (operation 값에 따라) |
| `pairedItem` | 입출력 데이터 매핑 (디버깅에 유용) |
| `continueOnFail()` | 실패 시 계속 진행 옵션 체크 |

---

## 5. JsonPlaceholder 노드 (Declarative)

> **스타일:** Declarative
> **기능:** JSONPlaceholder API 연동 (Posts, Users CRUD)

**파일:** `nodes/JsonPlaceholder/JsonPlaceholder.node.ts`

```typescript
import {
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

export class JsonPlaceholder implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'JSONPlaceholder',
    name: 'jsonPlaceholder',
    icon: 'file:jsonplaceholder.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with JSONPlaceholder API',
    defaults: {
      name: 'JSONPlaceholder',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'jsonPlaceholderApi',
        required: false, // JSONPlaceholder는 실제로 인증 불필요
      },
    ],
    requestDefaults: {
      baseURL: 'https://jsonplaceholder.typicode.com',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
    properties: [
      // Resource 선택
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Post',
            value: 'post',
          },
          {
            name: 'User',
            value: 'user',
          },
          {
            name: 'Comment',
            value: 'comment',
          },
        ],
        default: 'post',
      },
      // ===== POST Operations =====
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['post'],
          },
        },
        options: [
          {
            name: 'Get',
            value: 'get',
            description: 'Get a post by ID',
            action: 'Get a post',
            routing: {
              request: {
                method: 'GET',
                url: '=/posts/{{$parameter["postId"]}}',
              },
            },
          },
          {
            name: 'Get Many',
            value: 'getAll',
            description: 'Get all posts',
            action: 'Get many posts',
            routing: {
              request: {
                method: 'GET',
                url: '/posts',
              },
              output: {
                postReceive: [
                  {
                    type: 'limit',
                    properties: {
                      maxResults: '={{$parameter["limit"]}}',
                    },
                  },
                ],
              },
            },
          },
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new post',
            action: 'Create a post',
            routing: {
              request: {
                method: 'POST',
                url: '/posts',
                body: {
                  title: '={{$parameter["title"]}}',
                  body: '={{$parameter["body"]}}',
                  userId: '={{$parameter["userId"]}}',
                },
              },
            },
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Update a post',
            action: 'Update a post',
            routing: {
              request: {
                method: 'PUT',
                url: '=/posts/{{$parameter["postId"]}}',
                body: {
                  title: '={{$parameter["title"]}}',
                  body: '={{$parameter["body"]}}',
                  userId: '={{$parameter["userId"]}}',
                },
              },
            },
          },
          {
            name: 'Delete',
            value: 'delete',
            description: 'Delete a post',
            action: 'Delete a post',
            routing: {
              request: {
                method: 'DELETE',
                url: '=/posts/{{$parameter["postId"]}}',
              },
            },
          },
        ],
        default: 'get',
      },
      // Post ID (for Get, Update, Delete)
      {
        displayName: 'Post ID',
        name: 'postId',
        type: 'number',
        default: 1,
        required: true,
        displayOptions: {
          show: {
            resource: ['post'],
            operation: ['get', 'update', 'delete'],
          },
        },
      },
      // Limit (for Get Many)
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        default: 10,
        description: 'Max number of results to return',
        typeOptions: {
          minValue: 1,
          maxValue: 100,
        },
        displayOptions: {
          show: {
            resource: ['post'],
            operation: ['getAll'],
          },
        },
      },
      // Title (for Create, Update)
      {
        displayName: 'Title',
        name: 'title',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            resource: ['post'],
            operation: ['create', 'update'],
          },
        },
      },
      // Body (for Create, Update)
      {
        displayName: 'Body',
        name: 'body',
        type: 'string',
        typeOptions: {
          rows: 5,
        },
        default: '',
        required: true,
        displayOptions: {
          show: {
            resource: ['post'],
            operation: ['create', 'update'],
          },
        },
      },
      // User ID (for Create, Update)
      {
        displayName: 'User ID',
        name: 'userId',
        type: 'number',
        default: 1,
        required: true,
        displayOptions: {
          show: {
            resource: ['post'],
            operation: ['create', 'update'],
          },
        },
      },
      // ===== USER Operations =====
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['user'],
          },
        },
        options: [
          {
            name: 'Get',
            value: 'get',
            description: 'Get a user by ID',
            action: 'Get a user',
            routing: {
              request: {
                method: 'GET',
                url: '=/users/{{$parameter["userId"]}}',
              },
            },
          },
          {
            name: 'Get Many',
            value: 'getAll',
            description: 'Get all users',
            action: 'Get many users',
            routing: {
              request: {
                method: 'GET',
                url: '/users',
              },
            },
          },
        ],
        default: 'get',
      },
      // User ID (for User Get)
      {
        displayName: 'User ID',
        name: 'userId',
        type: 'number',
        default: 1,
        required: true,
        displayOptions: {
          show: {
            resource: ['user'],
            operation: ['get'],
          },
        },
      },
      // ===== COMMENT Operations =====
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['comment'],
          },
        },
        options: [
          {
            name: 'Get by Post',
            value: 'getByPost',
            description: 'Get comments by post ID',
            action: 'Get comments by post',
            routing: {
              request: {
                method: 'GET',
                url: '=/posts/{{$parameter["postId"]}}/comments',
              },
            },
          },
        ],
        default: 'getByPost',
      },
      // Post ID (for Comment Get by Post)
      {
        displayName: 'Post ID',
        name: 'postId',
        type: 'number',
        default: 1,
        required: true,
        displayOptions: {
          show: {
            resource: ['comment'],
            operation: ['getByPost'],
          },
        },
      },
    ],
  };

  // Declarative 스타일은 execute() 메서드가 필요 없음!
  // n8n이 routing 설정을 기반으로 자동으로 HTTP 요청을 처리
}
```

### Declarative 스타일 핵심 개념

| 개념 | 설명 |
|------|------|
| `requestDefaults` | 모든 요청에 적용되는 기본값 (baseURL, headers) |
| `routing.request` | HTTP 요청 설정 (method, url, body) |
| `routing.output.postReceive` | 응답 후처리 (limit, filter 등) |
| `={{...}}` | 표현식 문법으로 파라미터 참조 |
| `=/path/{{...}}` | URL에서 표현식 사용 시 `=` 접두사 필요 |
| **No execute()** | Declarative 스타일은 execute() 구현 불필요! |

---

## 6. TextTransformer 노드

> **스타일:** Programmatic (고급)
> **기능:** 대소문자 변환, 문자열 치환, Base64 인코딩/디코딩, JSON 파싱

**파일:** `nodes/TextTransformer/TextTransformer.node.ts`

```typescript
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

export class TextTransformer implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Text Transformer',
    name: 'textTransformer',
    icon: 'fa:font',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Transform text: case conversion, replace, base64, JSON parse',
    defaults: {
      name: 'Text Transformer',
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      // Operation 선택
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Change Case',
            value: 'changeCase',
            description: 'Change the case of text',
            action: 'Change the case of text',
          },
          {
            name: 'Replace',
            value: 'replace',
            description: 'Replace text in a string',
            action: 'Replace text in a string',
          },
          {
            name: 'Base64 Encode',
            value: 'base64Encode',
            description: 'Encode text to Base64',
            action: 'Encode text to Base64',
          },
          {
            name: 'Base64 Decode',
            value: 'base64Decode',
            description: 'Decode Base64 to text',
            action: 'Decode Base64 to text',
          },
          {
            name: 'Parse JSON',
            value: 'parseJson',
            description: 'Parse JSON string to object',
            action: 'Parse JSON string to object',
          },
          {
            name: 'Stringify JSON',
            value: 'stringifyJson',
            description: 'Convert object to JSON string',
            action: 'Convert object to JSON string',
          },
        ],
        default: 'changeCase',
      },
      // Input Text (대부분의 operation에서 사용)
      {
        displayName: 'Input Text',
        name: 'inputText',
        type: 'string',
        default: '',
        required: true,
        description: 'The text to transform',
        displayOptions: {
          show: {
            operation: ['changeCase', 'replace', 'base64Encode', 'base64Decode', 'parseJson'],
          },
        },
      },
      // Input Object (Stringify JSON용)
      {
        displayName: 'Input Object',
        name: 'inputObject',
        type: 'json',
        default: '{}',
        required: true,
        description: 'The object to convert to JSON string',
        displayOptions: {
          show: {
            operation: ['stringifyJson'],
          },
        },
      },
      // Case Type
      {
        displayName: 'Case Type',
        name: 'caseType',
        type: 'options',
        options: [
          { name: 'Lower Case', value: 'lower' },
          { name: 'Upper Case', value: 'upper' },
          { name: 'Title Case', value: 'title' },
          { name: 'Camel Case', value: 'camel' },
          { name: 'Snake Case', value: 'snake' },
          { name: 'Kebab Case', value: 'kebab' },
        ],
        default: 'lower',
        displayOptions: {
          show: {
            operation: ['changeCase'],
          },
        },
      },
      // Replace 옵션
      {
        displayName: 'Search Value',
        name: 'searchValue',
        type: 'string',
        default: '',
        required: true,
        description: 'The text to search for',
        displayOptions: {
          show: {
            operation: ['replace'],
          },
        },
      },
      {
        displayName: 'Replace Value',
        name: 'replaceValue',
        type: 'string',
        default: '',
        description: 'The text to replace with',
        displayOptions: {
          show: {
            operation: ['replace'],
          },
        },
      },
      {
        displayName: 'Replace All',
        name: 'replaceAll',
        type: 'boolean',
        default: true,
        description: 'Whether to replace all occurrences',
        displayOptions: {
          show: {
            operation: ['replace'],
          },
        },
      },
      {
        displayName: 'Use Regex',
        name: 'useRegex',
        type: 'boolean',
        default: false,
        description: 'Whether to use regex for search',
        displayOptions: {
          show: {
            operation: ['replace'],
          },
        },
      },
      // Stringify 옵션
      {
        displayName: 'Pretty Print',
        name: 'prettyPrint',
        type: 'boolean',
        default: false,
        description: 'Whether to format with indentation',
        displayOptions: {
          show: {
            operation: ['stringifyJson'],
          },
        },
      },
      // Output Field Name
      {
        displayName: 'Output Field',
        name: 'outputField',
        type: 'string',
        default: 'transformedText',
        description: 'The field name to store the result',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const operation = this.getNodeParameter('operation', i) as string;
        const outputField = this.getNodeParameter('outputField', i) as string;
        let result: unknown;

        switch (operation) {
          case 'changeCase': {
            const inputText = this.getNodeParameter('inputText', i) as string;
            const caseType = this.getNodeParameter('caseType', i) as string;
            result = changeCase(inputText, caseType);
            break;
          }

          case 'replace': {
            const inputText = this.getNodeParameter('inputText', i) as string;
            const searchValue = this.getNodeParameter('searchValue', i) as string;
            const replaceValue = this.getNodeParameter('replaceValue', i) as string;
            const replaceAll = this.getNodeParameter('replaceAll', i) as boolean;
            const useRegex = this.getNodeParameter('useRegex', i) as boolean;

            if (useRegex) {
              try {
                const flags = replaceAll ? 'g' : '';
                const regex = new RegExp(searchValue, flags);
                result = inputText.replace(regex, replaceValue);
              } catch (regexError) {
                throw new NodeOperationError(
                  this.getNode(),
                  `Invalid regex pattern: ${searchValue}`,
                  { itemIndex: i }
                );
              }
            } else {
              if (replaceAll) {
                result = inputText.replaceAll(searchValue, replaceValue);
              } else {
                result = inputText.replace(searchValue, replaceValue);
              }
            }
            break;
          }

          case 'base64Encode': {
            const inputText = this.getNodeParameter('inputText', i) as string;
            result = Buffer.from(inputText, 'utf-8').toString('base64');
            break;
          }

          case 'base64Decode': {
            const inputText = this.getNodeParameter('inputText', i) as string;
            try {
              result = Buffer.from(inputText, 'base64').toString('utf-8');
            } catch (decodeError) {
              throw new NodeOperationError(
                this.getNode(),
                'Invalid Base64 string',
                { itemIndex: i }
              );
            }
            break;
          }

          case 'parseJson': {
            const inputText = this.getNodeParameter('inputText', i) as string;
            try {
              result = JSON.parse(inputText);
            } catch (parseError) {
              throw new NodeOperationError(
                this.getNode(),
                `Invalid JSON: ${(parseError as Error).message}`,
                { itemIndex: i }
              );
            }
            break;
          }

          case 'stringifyJson': {
            const inputObject = this.getNodeParameter('inputObject', i) as object;
            const prettyPrint = this.getNodeParameter('prettyPrint', i) as boolean;
            try {
              result = prettyPrint
                ? JSON.stringify(inputObject, null, 2)
                : JSON.stringify(inputObject);
            } catch (stringifyError) {
              throw new NodeOperationError(
                this.getNode(),
                `Cannot stringify object: ${(stringifyError as Error).message}`,
                { itemIndex: i }
              );
            }
            break;
          }

          default:
            throw new NodeOperationError(
              this.getNode(),
              `Unknown operation: ${operation}`,
              { itemIndex: i }
            );
        }

        returnData.push({
          json: {
            ...items[i].json,
            [outputField]: result,
          },
          pairedItem: { item: i },
        });
      } catch (error) {
        // continueOnFail() 체크
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: (error as Error).message,
            },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}

// 헬퍼 함수: 케이스 변환
function changeCase(text: string, caseType: string): string {
  switch (caseType) {
    case 'lower':
      return text.toLowerCase();

    case 'upper':
      return text.toUpperCase();

    case 'title':
      return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    case 'camel':
      return text
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase());

    case 'snake':
      return text
        .replace(/\W+/g, ' ')
        .split(/ |\B(?=[A-Z])/)
        .map(word => word.toLowerCase())
        .join('_');

    case 'kebab':
      return text
        .replace(/\W+/g, ' ')
        .split(/ |\B(?=[A-Z])/)
        .map(word => word.toLowerCase())
        .join('-');

    default:
      return text;
  }
}
```

### 에러 핸들링 패턴

```typescript
// NodeOperationError 사용법
throw new NodeOperationError(
  this.getNode(),           // 노드 참조
  'Error message here',     // 에러 메시지
  { itemIndex: i }          // 어떤 item에서 에러 발생했는지
);

// continueOnFail() 체크
if (this.continueOnFail()) {
  // 에러를 출력 데이터에 포함하고 계속 진행
  returnData.push({
    json: { error: (error as Error).message },
    pairedItem: { item: i },
  });
  continue;
}
throw error; // 실패 시 중단
```

---

## 7. JsonPlaceholderApi Credentials

**파일:** `credentials/JsonPlaceholderApi.credentials.ts`

```typescript
import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class JsonPlaceholderApi implements ICredentialType {
  name = 'jsonPlaceholderApi';
  displayName = 'JSONPlaceholder API';
  documentationUrl = 'https://jsonplaceholder.typicode.com/';

  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'API Key for authentication (Note: JSONPlaceholder does not actually require auth)',
    },
  ];

  // 인증 설정: 모든 요청에 자동으로 적용
  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials.apiKey}}',
      },
    },
  };

  // 자격 증명 테스트: Test Connection 버튼 클릭 시 실행
  test: ICredentialTestRequest = {
    request: {
      baseURL: 'https://jsonplaceholder.typicode.com',
      url: '/posts/1',
    },
  };
}
```

### Credentials 핵심 개념

| 개념 | 설명 |
|------|------|
| `name` | 노드에서 참조할 때 사용하는 고유 식별자 |
| `displayName` | UI에 표시되는 이름 |
| `properties` | 사용자가 입력할 인증 정보 필드 |
| `authenticate` | 요청에 인증 정보 적용 방법 (headers, query params 등) |
| `test` | "Test Connection" 버튼 클릭 시 실행할 테스트 요청 |

### 인증 타입 예시

```typescript
// Bearer Token
authenticate: IAuthenticateGeneric = {
  type: 'generic',
  properties: {
    headers: {
      Authorization: '=Bearer {{$credentials.apiKey}}',
    },
  },
};

// Basic Auth
authenticate: IAuthenticateGeneric = {
  type: 'generic',
  properties: {
    auth: {
      username: '={{$credentials.username}}',
      password: '={{$credentials.password}}',
    },
  },
};

// Query Parameter
authenticate: IAuthenticateGeneric = {
  type: 'generic',
  properties: {
    qs: {
      api_key: '={{$credentials.apiKey}}',
    },
  },
};
```

---

## 8. 빌드 및 테스트

### gulpfile.js (아이콘 복사용)

**파일:** `packages/nodes/n8n-nodes-samples/gulpfile.js`

```javascript
const { src, dest } = require('gulp');

function buildIcons() {
  return src('nodes/**/*.{png,svg}')
    .pipe(dest('dist/nodes'));
}

exports['build:icons'] = buildIcons;
```

### 빌드 명령어

```bash
# 노드 패키지 빌드
cd packages/nodes/n8n-nodes-samples
bun run build

# 빌드 결과 확인
ls -la dist/
ls -la dist/nodes/
ls -la dist/credentials/
```

### Docker로 로컬 테스트

```bash
# 1. 전체 Docker 이미지 빌드 (프로젝트 루트에서)
cd /Users/dev-soon/workspace/project/n8n-workspace
docker build -t n8n-main:local -f images/n8n-main/Dockerfile .

# 2. n8n 실행
docker run -it --rm -p 5678:5678 n8n-main:local

# 3. 브라우저에서 http://localhost:5678 접속
```

### 빠른 테스트 (Volume 마운트)

```bash
# 빌드된 노드만 마운트하여 빠르게 테스트
docker run -it --rm \
  -p 5678:5678 \
  -v $(pwd)/packages/nodes/n8n-nodes-samples/dist:/home/node/.n8n/custom/n8n-nodes-samples \
  -e N8N_CUSTOM_EXTENSIONS=/home/node/.n8n/custom \
  n8nio/n8n
```

---

## 검증 체크리스트

- [ ] `bun install` 성공
- [ ] `bun run build` 에러 없이 완료
- [ ] `dist/` 폴더에 JS 파일 생성 확인
  - [ ] `dist/nodes/RandomDataGenerator/RandomDataGenerator.node.js`
  - [ ] `dist/nodes/JsonPlaceholder/JsonPlaceholder.node.js`
  - [ ] `dist/nodes/TextTransformer/TextTransformer.node.js`
  - [ ] `dist/credentials/JsonPlaceholderApi.credentials.js`
- [ ] Docker 이미지 빌드 성공
- [ ] n8n UI에서 커스텀 노드 표시 확인
- [ ] RandomDataGenerator: UUID 생성 테스트
- [ ] JsonPlaceholder: API 호출 테스트
- [ ] TextTransformer: 텍스트 변환 테스트

---

## 참고 자료

- [n8n 공식 노드 개발 문서](https://docs.n8n.io/integrations/creating-nodes/)
- [n8n-node CLI 도구](https://docs.n8n.io/integrations/creating-nodes/build/n8n-node/)
- [n8n Declarative Style 가이드](https://docs.n8n.io/integrations/creating-nodes/build/declarative-style-node/)
- [n8n Credentials 가이드](https://docs.n8n.io/integrations/creating-nodes/build/credentials/)
- [JSONPlaceholder API](https://jsonplaceholder.typicode.com/)

---

## 버전 호환성 요약

| 항목 | 설정 | 비고 |
|------|------|------|
| n8nNodesApiVersion | `1` | n8n 1.x, 2.x 모두 지원 |
| peerDependencies | `n8n-workflow: ">=1.0.0"` | |
| TypeScript target | `ES2022` | |
| Node.js | `18.17.0+` | |
| Bun | `1.2.23` | .mise.toml 참조 |
