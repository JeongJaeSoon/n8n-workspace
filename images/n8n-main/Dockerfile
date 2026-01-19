FROM n8nio/n8n:latest

USER root

# Custom Node 복사를 위한 디렉토리 생성
RUN mkdir -p /home/node/.n8n/custom

# 빌드된 노드들은 여기에 복사됨
COPY packages/nodes/n8n-nodes-mock-data/dist /home/node/.n8n/custom/n8n-nodes-mock-data

# 권한 설정
RUN chown -R node:node /home/node/.n8n/custom

USER node
