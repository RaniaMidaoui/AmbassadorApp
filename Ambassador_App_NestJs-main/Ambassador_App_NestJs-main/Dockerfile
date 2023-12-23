FROM node:16-alpine AS development
ENV NODE_ENV development

WORKDIR /backend

COPY package*.json ./
RUN npm install --force

COPY . .

EXPOSE 8000

CMD [ "npm", "run","start:dev" ]
