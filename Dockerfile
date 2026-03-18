# --- STAGE 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances (y compris dev pour le build)
RUN npm install

# Copier le reste du code source
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Compiler le projet NestJS
RUN npm run build

# --- STAGE 2: Run ---
FROM node:20-alpine

WORKDIR /app

# Copier seulement le nécessaire depuis le builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Exposer le port (NestJS par défaut est 3000)
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "run", "start:prod"]
