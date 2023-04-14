FROM node:16-alpine AS development
ENV NODE_ENV development

WORKDIR /ambassfront

COPY package*.json ./
RUN npm install --force

COPY . .

RUN npm run build --force

FROM nginx:alpine

COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

COPY --from=development /ambassfront/build /usr/share/nginx/html

EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]