# VickyShop Frontend

Frontend moderne pour la plateforme e-commerce Vicky-Shop, développé avec **React**, **Vite** et **Vanilla CSS**.

---

## 🚀 Technologies utilisées

- **React 18** : Interface utilisateur réactive et modulaire.
- **Vite** : Environnement de développement ultra-rapide et bundler optimisé.
- **Socket.IO Client** : Communications en temps réel pour le Dashboard administrateur et le suivi des commandes.
- **Lucide React & FontAwesome** : Icônes vectorielles modernes.
- **Canvas Confetti** : Animations visuelles d'interaction et de validation.

---

## 🛠️ Installation & Démarrage local

1. **Installation des dépendances :**
   ```bash
   npm install
   ```

2. **Configuration de l'environnement :**
   Créez un fichier `.env` basé sur `.env.example` :
   ```env
   VITE_URL=http://localhost:5000
   ```

3. **Lancement du serveur de développement :**
   ```bash
   npm run dev
   ```

4. **Compilation pour la production :**
   ```bash
   npm run build
   ```

---

## 🌐 Déploiement sur Vercel

1. Connectez le dépôt GitHub `vickyshop-frontend` à Vercel.
2. Définissez la variable d'environnement :
   - `VITE_URL` : `https://vickyshop-backend.onrender.com`
3. Le fichier `vercel.json` gère automatiquement le routage SPA et le build Vite.
