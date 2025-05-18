# Usa una imagen base oficial de Node.js
FROM node:20

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia los archivos del proyecto al contenedor
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto en el que corre tu app (ajústalo según tu app)
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["node", "index.js"]