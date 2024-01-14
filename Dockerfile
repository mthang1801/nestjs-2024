# Stage development 
FROM node:19.9.0 as development
WORKDIR /usr/src/app
COPY package*.json .
RUN yarn install 
COPY . . 
RUN yarn build
RUN yarn build:microservice

# Stage production
FROM node:19.9.0 as production
ARG  NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
ENV TZ=Asia/Ho_Chi_Minh
RUN apt-get update && apt-get install -y tzdata
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm config set registry http://registry.npmjs.org/ 
RUN yarn install --only=production
COPY . . 
COPY --from=development /usr/src/app/dist ./dist
RUN npm install pm2 -g
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
