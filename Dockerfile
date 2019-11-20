FROM node:10.13-alpine
#esto es lo que puede ponerse en la aplicación desde el archivo .env. Ejemplo: ENV DATABASE se identificaría en el código como process.env.DATABASE
ENV NODE_ENV production 
#ENV DATABASE="mongodb://root:ceatOrc19_20Adm@192.168.99.101:27017/Orcid"
ENV DATABASE="mongodb://mongodb:27017/Orcid"
RUN mkdir -p /usr/src/appOrcidCEATIC
ENV Dir /usr/src/appOrcidCEATIC
WORKDIR ${Dir}
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
#RUN cd bdOrcidIDs && chmod +x ./import.sh
EXPOSE 3800
#CMD node index.js
CMD [ "node", "index.js" ]