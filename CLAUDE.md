## 프로젝트 개요

n8n Custom Node Mono-repo for Internal Mode.
K8s 환경에서 사내 n8n 워크플로우에 필요한 커스텀 노드를 개발하고 관리하는 저장소.

## 개발 환경

| 항목 | 설정 |
|------|------|
| 패키지 매니저 | Bun 1.2.23 (.mise.toml) |
| Workspace | packages/*, packages/nodes/* |
| 테스트 방법 | Docker 이미지 빌드 |

## 주요 명령어

```bash
# 전체 빌드
bun run build

# 특정 노드만 빌드
bun run --filter @company/node-xxx build

# Docker 로컬 테스트
docker build -t n8n-main:local -f images/n8n-main/Dockerfile .
docker run -it --rm -p 5678:5678 n8n-main:local
```

## 노드 패키지 추가 방법

```bash
cd packages/nodes
bun create @n8n/node node-xxx
cd node-xxx
bun install
# package.json 수정 후 개발
```

## 참고 문서

Obsidian Vault의 개발 환경 문서:
- `⭐️ Area/n8n/사내 도입/개발 환경/Custom Node 개발.md`
- `⭐️ Area/n8n/사내 도입/개발 환경/빌드 및 배포.md`
