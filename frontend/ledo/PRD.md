# PRD - Ledo
## Gestion Financière Personnelle - Architecture Multi-Applications

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture Multi-Applications](#architecture-multi-applications)
3. [Objectifs](#objectifs)
4. [Architecture technique](#architecture-technique)
5. [Fonctionnalités principales](#fonctionnalites-principales)
6. [Structure des données](#structure-des-donnees)
7. [Interface utilisateur](#interface-utilisateur)
8. [Règles métier](#regles-metier)
9. [Wireframes](#wireframes)
10. [Plan d'implémentation](#plan-dimplementation)

---

## 🎯 Vue d'ensemble

**Ledo** est une Single Page Application (SPA) de gestion financière personnelle, développée en React, permettant de suivre ses entrées, dépenses et épargne selon des principes de gestion financière basés sur la dîme (dixième).

**Ledo sera déployé sur le même VPS que Gosen Success** (72.62.181.239:8086) en utilisant une architecture multi-applications partageant le même conteneur frontend.

---

## 🏗️ Architecture Multi-Applications

### Contexte actuel

Le VPS **Salon** (72.62.181.239) héberge déjà :

| Application | Port | Dossier | Conteneur | Technologie |
|-------------|------|---------|-----------|-------------|
| **Gosen Success** | 8086 | `/root/organisation/frontend` | `organisation-web` | React + Nginx |
| Gosen Success API | 8085 | `/root/organisation/backend` | `organisation-api` | Django |

### Solution Architecture : Base Path Routing

Ledo sera intégré dans le **même conteneur frontend** que Gosen Success en utilisant un système de **Base Path Routing**.

```
┌─────────────────────────────────────────────────────────────────┐
│                         VPS Salon                                 │
│                      72.62.181.239                               │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│  organisation-web (Nginx + React Static Files)                   │
│  Port 8086 → Port 80 interne                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  /var/www/html/                                                  │
│  ├── index.html              → Gosen Success App                 │
│  ├── assets/                 → Shared assets                     │
│  │                                                          │
│  └── ledo/                   → Ledo App (Base Path: /ledo)       │
│      ├── index.html                                             │
│      └── assets/                                                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
         ┌──────────────────┐        ┌──────────────────┐
         │  Gosen Success   │        │      Ledo        │
         │   (Root: /)      │        │  (Base Path:     │
         │                  │        │   /ledo)         │
         │  - Pronostics    │        │                  │
         │  - Turf          │        │  - Finances      │
         │  - Paris         │        │  - Entrées       │
         │                  │        │  - Dépenses      │
         └──────────────────┘        │  - Épargne       │
                                     │  - Graphiques    │
                                     └──────────────────┘
```

### Routage Nginx

```nginx
# /etc/nginx/conf.d/default.conf

server {
    listen 80;
    server_name _;

    # Root pour Gosen Success (application par défaut)
    root /var/www/html;
    index index.html;

    # Gosen Success - Application principale
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Ledo - Application secondaire
    location /ledo {
        alias /var/www/html/ledo;
        try_files $uri $uri/ /ledo/index.html;

        # Configuration pour le router React en base path
        # Rewrite pour gérer les routes internes de Ledo
        rewrite ^/ledo/(.*)$ /ledo/index.html break;
    }

    # Assets partagés
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Structure des dossiers sur le VPS

```
/root/organisation/
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── gosensuccess/          ← Application Gosen Success
│   │   ├── index.html
│   │   ├── assets/
│   │   └── ...
│   │
│   └── ledo/                  ← Application Ledo (NOUVEAU)
│       ├── index.html
│       ├── assets/
│       └── ...
│
└── backend/                   ← API Django partagée
    ├── manage.py
    ├── gosensuccess/          ← App Gosen Success
    └── ledo/                  ← App Ledo (NOUVEAU)
        ├── models.py
        ├── views.py
        └── urls.py
```

### Configuration React pour le Base Path

```javascript
// ledo/vite.config.ts
export default defineConfig({
  base: '/ledo/',  // Base path pour le routing
  plugins: [react()],
  // ...
})

// ledo/src/App.tsx
import { BrowserRouter } from 'react-router-dom';

<BrowserRouter basename="/ledo">
  {/* Routes */}
</BrowserRouter>
```

### URLs finales

| Application | URL | Description |
|-------------|-----|-------------|
| Gosen Success | `http://72.62.181.239:8086/` | App principale (root) |
| Ledo | `http://72.62.181.239:8086/ledo` | App secondaire |
| Gosen API | `http://72.62.181.239:8085/api/` | API principale |
| Ledo API | `http://72.62.181.239:8085/api/ledo/` | API Ledo (sous-route) |

---

## 🎯 Objectifs

### Objectif principal
Permettre à l'utilisateur de :
- Suivre ses entrées journalières
- Calculer automatiquement sa dîme (10%)
- Catégoriser ses dépenses
- Visualiser son épargne constituée (Entrée - Dîme)
- Analyser l'évolution de ses finances via des graphiques

### Objectifs secondaires
- Interface intuitive et responsive
- Fonctionnement offline (IndexedDB)
- Filtres puissants avec logique ET
- Export des données
- Intégration transparente avec Gosen Success

---

## 🏗️ Architecture technique

### Frontend

```
React 18+ SPA (Base Path: /ledo)
├── Vite (build tool)
├── TypeScript
├── Tailwind CSS (styling)
├── React Router (navigation avec basename)
├── Zustand (state management)
├── Recharts (graphiques)
└── Dexie.js (IndexedDB wrapper)
```

### Structure des dossiers de développement (local)

```
ledo/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   ├── dashboard/
│   │   │   ├── TransactionGrid.tsx
│   │   │   ├── CategoryMenu.tsx
│   │   │   └── FilterBar.tsx
│   │   ├── charts/
│   │   │   ├── LineChart.tsx
│   │   │   ├── PieChart.tsx
│   │   │   └── BarChart.tsx
│   │   ├── transactions/
│   │   │   ├── TransactionForm.tsx
│   │   │   └── TransactionList.tsx
│   │   └── shared/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       └── Modal.tsx
│   ├── stores/
│   │   ├── transactionStore.ts
│   │   ├── filterStore.ts
│   │   └── categoryStore.ts
│   ├── db/
│   │   └── db.ts (IndexedDB setup)
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── calculations.ts
│   │   └── filters.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
├── vite.config.ts     ← Configuration du base path
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

### Configuration Vite pour le Base Path

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/ledo/',  // Important pour le déploiement
  plugins: [react()],
  server: {
    port: 3001,    // Port local différent de Gosen Success
    proxy: {
      '/api': {
        target: 'http://localhost:8085',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});
```

### Docker (Intégration dans le conteneur existant)

```dockerfile
# /root/organisation/frontend/Dockerfile (MODIFIÉ)

FROM node:18-alpine as builder

# Gosen Success Build
WORKDIR /app/gosensuccess
COPY gosensuccess/package*.json ./
RUN npm install
COPY gosensuccess/ ./
RUN npm run build

# Ledo Build
WORKDIR /app/ledo
COPY ledo/package*.json ./
RUN npm install
COPY ledo/ ./
RUN npm run build

# Nginx - Production
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy Gosen Success
COPY --from=builder /app/gosensuccess/dist /var/www/html

# Copy Ledo
COPY --from=builder /app/ledo/dist /var/www/html/ledo

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## ✨ Fonctionnalités principales

### 1. Grille principale (Dashboard)

**Colonnes affichées par défaut :**

| Colonne | Description | Calcul |
|---------|-------------|---------|
| Date | Date de la transaction | - |
| Entrée journalière | Montant entré | Saisie utilisateur |
| Dime (10%) | Dixième de l'entrée | `Entrée × 0.10` |
| Dépenses | Total des dépenses du jour | `Somme des dépenses` |
| Épargne | Épargne constituée | `Entrée - Dime` |

**Calcul automatique de la dîme :**
```typescript
const calculateDime = (entree: number): number => {
  return entree * 0.10;
}
```

### 2. Système de catégories

#### Structure hiérarchique

```
📁 DÉPENSES
├── 🏛️ ÉGLISE
│   ├── 💰 Dimes
│   ├── 🕯️ Offrandes
│   ├── 🙏 Vœux
│   ├── 🐑 Sacrifices
│   ├── 🤝 Collecte
│   └── 🌾 Prémices
│
├── 🏠 CHARGES FIXES
│   ├── 🍕 Alimentation
│   ├── 💡 Électricité
│   ├── 🚗 Transport
│   ├── 💼 Travail
│   ├── 🌐 Internet
│   ├── 👫 Conjoint
│   └── 👶 Enfants
│
├── 📈 INVESTISSEMENT
│   └── (sous-catégories personnalisables)
│
└── 🚨 FONDS D'URGENCE
    └── (sous-catégories personnalisables)
```

### 3. Système de filtres

| Filtre | Options |
|--------|---------|
| **Type de dépenses** | Toutes catégories et sous-catégories |
| **Période** | Jour, Semaine, Mois, Année |
| **Entrée** | Montant minimum, Montant maximum |
| **Date** | Date début, Date fin |

### 4. Vues graphiques

- **📈 Graphique linéaire** : Évolution temporelle (Entrées, Dépenses, Épargne)
- **🥧 Graphique camembert** : Répartition des dépenses par catégorie
- **📊 Graphique à barres** : Comparaison des périodes

---

## 📊 Structure des données

### IndexedDB (Local) - Principal storage

```typescript
// Database: LedoDB (v1)

interface Transaction {
  id: string;              // UUID
  date: Date;              // Date de la transaction
  entree: number;          // Entrée journalière
  dime: number;            // Calculé automatiquement (entree * 0.10)
  depenses: Expense[];     // Tableau des dépenses du jour
  epargne: number;         // Calculé automatiquement (entree - dime)
  createdAt: Date;
  updatedAt: Date;
}

interface Expense {
  id: string;
  category: Category;
  subcategory: string;
  amount: number;
  description?: string;
}

interface Category {
  id: string;
  name: string;
  type: 'eglise' | 'charges' | 'investissement' | 'urgence';
  subcategories: string[];
  color: string;
  icon: string;
}
```

### Django API (Optional) - Backup & Sync

```python
# /root/organisation/backend/ledo/models.py
class Transaction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    entree = models.DecimalField(max_digits=10, decimal_places=2)
    dime = models.DecimalField(max_digits=10, decimal_places=2)
    epargne = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        app_label = 'ledo'

class Expense(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    transaction = models.ForeignKey(Transaction, related_name='depenses', on_delete=models.CASCADE)
    category = models.CharField(max_length=50)
    subcategory = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)

    class Meta:
        app_label = 'ledo'
```

---

## 🎨 Interface utilisateur

### Layout principal

```
┌─────────────────────────────────────────────────────────────┐
│  📊 LEDO                    🔙 Gosen Success       ⚙️ 👤    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Catégories: 🏛️ Église 🏠 Charges 📈 Invest. 🚨 Urgence]  │
│                                                              │
│  [Filtres: 📅 Mois ▾ | 💰 Entrée: [Min] [Max] | ✕ Reset]   │
│                                                              │
│  💰 Total Entrées: €2,450  📤 Dîme: €245  📈 Épargne: €2,205│
│                                                              │
│  [📈 Ligne] [🥧 Camembert] [📊 Barres]                       │
│                   [Graphique affiché ici]                    │
│                                                              │
│  ┌─ Transactions ─────────────────────────────────────────┐ │
│  │ Date        │ Entrée  │ Dime   │ Dépenses │ Épargne   │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ 26/03/2026  │ €100   │ €10    │ €45     │ €90       │ │
│  │ 25/03/2026  │ €80    │ €8     │ €32     │ €72       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│                                    [➕ Ajouter] [📤 Exporter]│
└─────────────────────────────────────────────────────────────┘
```

---

## 🛣️ Plan d'implémentation

### Phase 1 - Initialisation (Local)

**Étape 1 : Création du projet local**
```bash
cd C:\Users\AnDy\Desktop\hippique-django
npm create vite@latest ledo -- --template react-ts
cd ledo
npm install
```

**Étape 2 : Installation des dépendances**
```bash
npm install zustand dexie dexie-react-hooks recharts date-fns lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Phase 2 - Développement (Local)

**Étape 3 : Configuration Vite**
```typescript
// vite.config.ts
export default defineConfig({
  base: '/ledo/',
  plugins: [react()],
  server: { port: 3001 }
})
```

**Étape 4 : Implémentation des fonctionnalités**
- Setup IndexedDB (Dexie)
- Stores Zustand
- Composants UI
- Calculs automatiques

### Phase 3 - Intégration VPS

**Étape 5 : Préparation du VPS**
```bash
# SSH sur le VPS
ssh -i "$HOME/.ssh/id_ed25519_claude" root@72.62.181.239

# Créer le dossier ledo
cd /root/organisation/frontend
mkdir -p ledo
```

**Étape 6 : Build et déploiement**
```bash
# Build local
cd C:\Users\AnDy\Desktop\hippique-django\ledo
npm run build

# Upload vers VPS
scp -i "$HOME/.ssh/id_ed25519_claude" -r dist/* root@72.62.181.239:/root/organisation/frontend/ledo/
```

**Étape 7 : Configuration Nginx**
```bash
# Modifier la configuration nginx
nano /etc/nginx/conf.d/default.conf

# Ajouter la location /ledo
location /ledo {
    alias /var/www/html/ledo;
    try_files $uri $uri/ /ledo/index.html;
}

# Recharger nginx
nginx -s reload
```

**Étape 8 : Mise à jour Docker**
```bash
# Modifier le Dockerfile pour builder les deux apps
cd /root/organisation/frontend
nano Dockerfile

# Rebuild et restart
docker-compose down
docker-compose up -d --build
```

### Phase 4 - Tests

**Étape 9 : Vérification**
```bash
# Test Gosen Success
curl http://72.62.181.239:8086/

# Test Ledo
curl http://72.62.181.239:8086/ledo/

# Test dans le navigateur
# Gosen Success: http://72.62.181.239:8086/
# Ledo: http://72.62.181.239:8086/ledo/
```

---

## 📦 Dépendances

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.22.0",
    "zustand": "^4.5.0",
    "dexie": "^3.2.4",
    "dexie-react-hooks": "^1.1.7",
    "recharts": "^2.12.0",
    "date-fns": "^3.3.0",
    "lucide-react": "^0.344.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "vite": "^5.1.0"
  }
}
```

---

## 🔗 Navigation entre applications

Un bouton "🔙 Retour Gosen Success" sera présent dans le header de Ledo pour permettre une navigation facile entre les deux applications.

```tsx
// ledo/src/components/layout/Header.tsx
<Link to="/">🔙 Retour à Gosen Success</Link>
```

---

**Version du PRD :** 2.0 - Architecture Multi-Applications
**Date de création :** 26 Mars 2026
**Date de mise à jour :** 26 Mars 2026
**VPS Cible :** Salon (72.62.181.239)
**Port :** 8086 (partagé avec Gosen Success)
**Base Path :** /ledo
