FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Pre-optimize deps only (don't full build)
RUN npx vite optimize --force

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]