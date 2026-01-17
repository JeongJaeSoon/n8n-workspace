# n8n Custom Node Mono-repo 디렉토리 구조 생성

## 목표
Internal Mode 환경에서 Custom Node 개발을 위한 Mono-repo 기본 디렉토리 생성

## 현재 상태
- **실행 모드**: Internal Mode (단일 컨테이너, Task Runner 없음)
- Custom Node + 외부 라이브러리 모두 하나의 이미지에 포함

## 생성할 디렉토리 구조

```
n8n-workspace/
├── packages/
│   ├── nodes/           # Custom Node 패키지들
│   └── shared/          # 공통 유틸리티 (선택)
├── images/
│   └── n8n-main/        # n8n 메인 이미지 Dockerfile (Custom Node 포함)
└── .github/
    └── workflows/       # CI/CD 워크플로우
```

> Task Runner 디렉토리(`images/task-runner/`)는 External Mode 전환 시 추가

## 작업 단계

1. **기본 디렉토리 생성**
   ```bash
   mkdir -p packages/nodes packages/shared
   mkdir -p images/n8n-main
   mkdir -p .github/workflows
   ```

2. **루트 설정 파일 생성**
   - `package.json` - bun workspace 루트 설정 (workspaces 필드 포함)

## 참고 문서
- `/Users/dev-soon/workspace/obsidian_vault/🧑🏻‍💻 Private/⭐️ Area/n8n/사내 도입/개발 환경/Custom Node 개발.md`

## 검증
- `ls -R` 로 디렉토리 구조 확인
