FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Para desarrollo local montaremos el volumen, pero por si acaso, configuramos comando de inicio
CMD ["npm", "run", "dev"]
