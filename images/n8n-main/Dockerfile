FROM n8nio/n8n:latest

USER root

RUN mkdir -p /home/node/.n8n/custom

# 빌드 시 준비된 dist 폴더들 복사
COPY dist-nodes/ /home/node/.n8n/custom/

RUN chown -R node:node /home/node/.n8n/custom

USER node
