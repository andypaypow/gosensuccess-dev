# Guide de déploiement Ledo sur VPS Salon

## 📍 Architecture

```
VPS Salon (72.62.181.239:8086)
├── Gosen Success (root: /)
└── Ledo (base path: /ledo)
```

## 🚀 Déploiement

### 1. Build local (déjà fait)

```bash
cd C:\Users\AnDy\Desktop\hippique-django\ledo
npm run build
```

### 2. Créer le dossier sur le VPS

```bash
ssh -i "$HOME/.ssh/id_ed25519_claude" root@72.62.181.239

# Créer le dossier pour Ledo
mkdir -p /root/organisation/frontend/ledo
```

### 3. Upload des fichiers

```bash
# Depuis le local
scp -i "$HOME/.ssh/id_ed25519_claude" -r dist/* root@72.62.181.239:/root/organisation/frontend/ledo/
```

### 4. Configuration Nginx

```bash
# Sur le VPS
ssh -i "$HOME/.ssh/id_ed25519_claude" root@72.62.181.239

# Éditer la config nginx
nano /etc/nginx/conf.d/default.conf

# Ajouter la location /ledo (voir nginx.conf dans ce dossier)
```

### 5. Recharger Nginx

```bash
nginx -t  # Test de la configuration
nginx -s reload
```

### 6. Vérifier

```bash
# Sur le VPS
curl http://localhost:8086/ledo/

# Depuis le navigateur
# http://72.62.181.239:8086/ledo/
```

## 🔧 Configuration Docker (Optionnel)

Si vous utilisez Docker, modifier le Dockerfile :

```dockerfile
# Build Gosen Success
WORKDIR /app/gosensuccess
COPY gosensuccess/package*.json ./
RUN npm install
COPY gosensuccess/ ./
RUN npm run build

# Build Ledo
WORKDIR /app/ledo
COPY ledo/package*.json ./
RUN npm install
COPY ledo/ ./
RUN npm run build

# Nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy Gosen Success
COPY --from=builder /app/gosensuccess/dist /var/www/html

# Copy Ledo
COPY --from=builder /app/ledo/dist /var/www/html/ledo

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 📝 URLs finales

| Application | URL |
|-------------|-----|
| Gosen Success | http://72.62.181.239:8086/ |
| Ledo | http://72.62.181.239:8086/ledo |
| API Gosen | http://72.62.181.239:8085/api/ |

## 🎨 Thème Ledo

- **Fond**: Blanc (#ffffff)
- **Couleurs**: Vert (#10B981), Orange (#F59E0B), Violet (#8B5CF6)
