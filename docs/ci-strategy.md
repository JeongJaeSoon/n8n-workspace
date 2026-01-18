# CI/CD 전략 가이드

> 이 문서는 향후 CI/CD 구성 시 참고용입니다.

## CI 최적화 전략

### 추천: 변경 감지 + 병렬 빌드

```yaml
# .github/workflows/ci.yml
name: CI
on:
  pull_request:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 변경 감지를 위해 전체 히스토리

      - uses: oven-sh/setup-bun@v1

      - run: bun install

      # 변경된 패키지만 빌드/린트
      - run: bun run --filter './packages/nodes/*[origin/main]' lint
      - run: bun run --filter './packages/nodes/*[origin/main]' build
```

### bun --filter 옵션

| 필터 | 설명 |
|------|------|
| `'*'` | 모든 패키지 |
| `'./packages/nodes/*'` | nodes 하위 모든 패키지 |
| `'./packages/nodes/*[origin/main]'` | main 브랜치 대비 변경된 패키지만 |

## GitHub Packages 릴리즈

### 자동 릴리즈 워크플로우

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags: ['v*']

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build

      # GitHub Packages 배포
      - run: |
          echo "//npm.pkg.github.com/:_authToken=${{ secrets.GITHUB_TOKEN }}" >> .npmrc
          npm publish --registry=https://npm.pkg.github.com
```

### 수동 릴리즈 (현재)

```bash
cd packages/nodes/n8n-nodes-xxx
bun run release  # n8n-node CLI의 release 명령
```

## 패키지별 CI 불필요

각 노드 패키지의 `.github/workflows/ci.yml`은 삭제합니다.

이유:
- monorepo 루트에서 전체 CI 관리
- 변경 감지로 필요한 패키지만 빌드
- 중복 워크플로우 방지
