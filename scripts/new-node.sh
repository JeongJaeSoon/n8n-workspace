#!/bin/bash
set -e

NODES_DIR="packages/nodes"
REPO_URL="https://github.com/JeongJaeSoon/n8n-workspace.git"

# 인자 확인
if [ -z "$1" ]; then
  echo "Usage: bun run new:node <package-name>"
  echo "Example: bun run new:node n8n-nodes-my-custom"
  exit 1
fi

PKG_NAME="$1"

# n8n-nodes- 접두사 검증
if [[ ! "$PKG_NAME" =~ ^n8n-nodes- ]]; then
  echo "Error: Package name must start with 'n8n-nodes-'"
  echo "Example: bun run new:node n8n-nodes-my-custom"
  exit 1
fi

PKG_PATH="$NODES_DIR/$PKG_NAME"

# 이미 존재하는지 확인
if [ -d "$PKG_PATH" ]; then
  echo "Error: $PKG_PATH already exists"
  exit 1
fi

# packages/nodes 디렉토리 확인
mkdir -p "$NODES_DIR"

# 1. bun create 실행 (packages/nodes 디렉토리에서)
echo "Creating $PKG_NAME..."
cd "$NODES_DIR"
bun create @n8n/node "$PKG_NAME"
cd - > /dev/null

# 생성 확인
if [ ! -d "$PKG_PATH" ]; then
  echo "Error: Package directory was not created at $PKG_PATH"
  exit 1
fi

# 2. 후처리
# .git 삭제
if [ -d "$PKG_PATH/.git" ]; then
  rm -rf "$PKG_PATH/.git"
  echo "✓ Removed nested .git"
fi

# .github 삭제 (루트에서 CI 관리)
if [ -d "$PKG_PATH/.github" ]; then
  rm -rf "$PKG_PATH/.github"
  echo "✓ Removed .github (managed at root)"
fi

# .vscode 삭제 (루트에서 통합 관리)
if [ -d "$PKG_PATH/.vscode" ]; then
  rm -rf "$PKG_PATH/.vscode"
  echo "✓ Removed .vscode (managed at root)"
fi

# package.json 수정 (repository URL)
if [ -f "$PKG_PATH/package.json" ]; then
  # jq가 있으면 사용, 없으면 sed 사용
  if command -v jq &> /dev/null; then
    jq --arg url "$REPO_URL" --arg dir "$PKG_PATH" \
      '.repository = {type: "git", url: $url, directory: $dir}' \
      "$PKG_PATH/package.json" > "$PKG_PATH/package.json.tmp"
    mv "$PKG_PATH/package.json.tmp" "$PKG_PATH/package.json"
  else
    # jq 없이 node로 처리
    node -e "
      const fs = require('fs');
      const pkg = JSON.parse(fs.readFileSync('$PKG_PATH/package.json', 'utf-8'));
      pkg.repository = {type: 'git', url: '$REPO_URL', directory: '$PKG_PATH'};
      fs.writeFileSync('$PKG_PATH/package.json', JSON.stringify(pkg, null, 2) + '\n');
    "
  fi
  echo "✓ Updated repository URL in package.json"
fi

# 3. bun install
echo "Installing dependencies..."
bun install

echo ""
echo "✅ Created $PKG_NAME"
echo "   cd $PKG_PATH"
