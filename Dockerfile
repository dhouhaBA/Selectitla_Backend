# Étape 1 : Image Node officielle
FROM node:18

# Étape 2 : Créer un répertoire de travail
WORKDIR /app

# Étape 3 : Copier les fichiers package.json uniquement
COPY package*.json ./

# Étape 4 : Installer les dépendances avec le flag --legacy-peer-deps
RUN npm install --legacy-peer-deps

# Étape 5 : Copier le reste du projet
COPY . .

# Étape 6 : Exposer le port utilisé par Strapi (généralement 1337)
EXPOSE 1337

# Étape 7 : Lancer l’application
CMD ["npm", "run", "develop"]
