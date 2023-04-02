FROM node:16.17.1 AS development
ENV NODE_ENV development

WORKDIR /adminfront

COPY package*.json ./
RUN npm install --force

COPY . .

EXPOSE 5200

CMD [ "npm", "start" ]