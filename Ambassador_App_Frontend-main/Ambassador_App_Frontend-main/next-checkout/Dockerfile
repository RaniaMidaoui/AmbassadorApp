FROM node:16-alpine AS development
ENV NODE_ENV development

WORKDIR /app

COPY package*.json ./
RUN npm install --force

COPY . .

EXPOSE 3000

CMD [ "npm", "run", "dev" ]