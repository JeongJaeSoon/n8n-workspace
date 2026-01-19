# n8n Custom Node Workspace

n8n 커스텀 노드 개발을 위한 모노레포 워크스페이스입니다.

## 요구사항

- [Bun](https://bun.sh/) v1.0+
- [Docker](https://www.docker.com/) (로컬 테스트용)

## 프로젝트 구조

```
n8n-workspace/
├── packages/
│   └── nodes/                    # 커스텀 노드 패키지들
│       └── n8n-nodes-mock-data/  # 예시: Mock Data Generator 노드
├── images/
│   └── n8n-main/                 # n8n Docker 이미지
│       └── Dockerfile
├── scripts/
│   └── new-node.sh               # 새 노드 생성 스크립트
└── docs/
    └── ci-strategy.md
```

## 빠른 시작

### 1. 의존성 설치

```bash
# 루트에서 전체 워크스페이스 의존성 설치
bun install
```

### 2. 새 노드 패키지 생성

```bash
bun run new:node <패키지명>

# 예시
bun run new:node n8n-nodes-my-service
```

> **참고**: 인터랙티브 프롬프트가 나타나면 원하는 옵션을 선택하세요.

### 3. 노드 빌드

```bash
# 모든 패키지 빌드
bun run build

# 특정 패키지만 빌드
bun run --filter n8n-nodes-mock-data build

# 또는 해당 디렉토리에서 직접 실행
cd packages/nodes/n8n-nodes-mock-data
bun install
bun run build
```

### 4. 로컬 Docker 테스트

```bash
# 1. 노드 빌드 (dist/ 폴더 생성 필요)
cd packages/nodes/n8n-nodes-mock-data
bun run build

# 2. Docker 이미지 빌드 (루트에서)
cd ../../../
docker build -t n8n-main:local -f images/n8n-main/Dockerfile .

# 3. 컨테이너 실행
docker run -it --rm -p 5678:5678 n8n-main:local

# 4. 브라우저에서 http://localhost:5678 접속
```

## 개발 워크플로우

### 노드 개발 순서

1. **패키지 생성**: `bun run new:node <패키지명>`
2. **코드 작성**: `packages/nodes/<패키지명>/nodes/` 에서 노드 구현
3. **빌드**: `bun run build` 또는 `bun run --filter <패키지명> build`
4. **테스트**: Docker로 로컬 n8n 실행 후 노드 동작 확인
5. **커밋 & PR**: 변경사항 커밋 후 Pull Request 생성

### 파일 구조 (노드 패키지)

```
n8n-nodes-<name>/
├── package.json          # n8n.nodes, n8n.credentials 설정
├── tsconfig.json
├── credentials/          # 인증 정보 정의
│   └── MyApi.credentials.ts
├── nodes/                # 노드 구현
│   └── MyNode/
│       └── MyNode.node.ts
└── dist/                 # 빌드 결과 (git ignore)
```

## 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `bun install` | 의존성 설치 |
| `bun run build` | 모든 패키지 빌드 |
| `bun run --filter <name> build` | 특정 패키지 빌드 |
| `bun run lint` | 모든 패키지 린트 |
| `bun run new:node <name>` | 새 노드 패키지 생성 |

## Dockerfile 설정

새 노드를 추가하면 `images/n8n-main/Dockerfile`에 COPY 명령을 추가해야 합니다:

```dockerfile
# 빌드된 노드 복사
COPY packages/nodes/<패키지명>/dist /home/node/.n8n/custom/<패키지명>
```

## 패키지 목록

| 패키지 | 설명 | 상태 |
|--------|------|------|
| `n8n-nodes-mock-data` | Mock 데이터 생성 노드 (학습/테스트용) | ✅ |

## 문서

- [CI 전략](docs/ci-strategy.md)

## 라이센스

MIT
