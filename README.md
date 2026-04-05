# mAI Chatbot

<div align="center">

![Chatbot Banner](app/(chat)/opengraph-image.png)

**Chatbot intelligent et polyvalent construit avec Next.js et AI SDK**

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org)
[![AI SDK](https://img.shields.io/badge/AI%20SDK-6.0-purple)](https://ai-sdk.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org)

[ Fonctionnalités ](#fonctionnalités) • [ Démarrage rapide ](#démarrage-rapide) • [ Configuration ](#configuration) • [ Architecture ](#architecture) • [ API & Routes ](#api--routes) • [ Tests ](#tests) • [ Déploiement ](#déploiement)

</div>

---

## 📖 Table des matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Technologies utilisées](#technologies-utilisées)
- [Démarrage rapide](#démarrage-rapide)
- [Configuration](#configuration)
  - [Variables d'environnement](#variables-denvironnement)
  - [Configuration de la base de données](#configuration-de-la-base-de-données)
- [Architecture du projet](#architecture-du-projet)
- [Fonctionnalités détaillées](#fonctionnalités-détaillées)
  - [Système de chat IA](#système-de-chat-ia)
  - [Gestion des utilisateurs](#gestion-des-utilisateurs)
  - [Système d'abonnement](#système-dabonnement)
  - [Artifacts et documents](#artifacts-et-documents)
  - [Modèles IA disponibles](#modèles-ia-disponibles)
- [API & Routes](#api--routes)
- [Commandes disponibles](#commandes-disponibles)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [Structure des fichiers](#structure-des-fichiers)
- [Licence](#licence)

---

## 🎯 Aperçu

mAI Chatbot est une application de chat IA open-source et gratuite, construite avec **Next.js 16** et **AI SDK**. Elle permet de créer rapidement des applications de chatbot puissantes avec persistance des données, authentification sécurisée et support de multiples fournisseurs de modèles IA.

Ce template inclut :
- Une interface de chat moderne et réactive
- Support de nombreux modèles IA (Mistral, DeepSeek, OpenAI, xAI, Gemini, etc.)
- Authentification complète (utilisateurs réguliers et invités)
- Système d'abonnement avec 4 niveaux (Free, Plus, Pro, Max)
- Persistance des conversations avec PostgreSQL
- Génération et édition de documents (texte, code, feuilles de calcul)
- Recherche web intégrée
- Support des artifacts interactifs

---

## ✨ Fonctionnalités

### Core
- **Next.js 16 App Router** - Routage avancé avec React Server Components (RSC) et Server Actions
- **AI SDK v6** - API unifiée pour la génération de texte, objets structurés et appels d'outils
- **Auth.js (NextAuth)** - Authentification simple et sécurisée avec support utilisateur invité
- **PostgreSQL (Neon)** - Base de données serverless pour l'historique des chats et données utilisateurs
- **Vercel Blob** - Stockage efficace des fichiers
- **shadcn/ui + Tailwind CSS** - Interface moderne et responsive
- **Radix UI** - Composants accessibles et flexibles

### IA & Modèles
- **Multi-fournisseurs** - Support natif de Mistral, DeepSeek, Moonshot AI, OpenAI, xAI, Cerebras, Gemini
- **Vercel AI Gateway** - Routage intelligent vers différents providers
- **Outils IA** - Création/édition de documents, recherche web, météo, suggestions
- **Vision & Raisonnement** - Support des modèles avec capacités visuelles et de raisonnement

### Utilisateur
- **4 niveaux d'abonnement** - Free, Plus, Pro, Max avec limites personnalisées
- **Mode invité** - Utilisation sans inscription requise
- **Historique des conversations** - Sauvegarde et reprise des chats
- **Visibilité des chats** - Public ou privé
- **Système de votes** - Feedback sur les réponses IA

### Artifacts
- **Éditeur de code** - Support Python avec CodeMirror
- **Documents texte** - Édition riche avec Streamdown
- **Feuilles de calcul** - Grilles de données interactives
- **Images** - Génération via Flux, Kling

---

## 🛠 Technologies utilisées

| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| **Framework** | Next.js | 16.2.0 |
| **Langage** | TypeScript | 5.6.3 |
| **React** | React / React DOM | 19.0.1 |
| **IA** | AI SDK | 6.0.116 |
| **Auth** | NextAuth | 5.0.0-beta.25 |
| **Base de données** | Drizzle ORM + PostgreSQL | 0.34.0 |
| **Migrations** | Drizzle Kit | 0.25.0 |
| **UI** | shadcn/ui, Radix UI, Framer Motion | - |
| **Style** | Tailwind CSS | 4.1.13 |
| **Éditeur** | CodeMirror | 6.x |
| **Tests** | Playwright | 1.50.1 |
| **Linting** | Biome, Ultracite | - |
| **Package Manager** | pnpm | 10.32.1 |

---

## 🚀 Démarrage rapide

### Prérequis

- **Node.js** 20+ recommandé
- **pnpm** installé globalement (`npm install -g pnpm`)
- Compte **Vercel** (optionnel, pour déploiement facile)
- Accès à une base de données **PostgreSQL**

### Installation

```bash
# 1. Cloner le repository
git clone <repository-url>
cd chatbot

# 2. Installer les dépendances
pnpm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés API

# 4. Initialiser la base de données
pnpm db:generate
pnpm db:migrate

# 5. Lancer le serveur de développement
pnpm dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Configuration

### Variables d'environnement

Copiez `.env.example` vers `.env.local` et configurez les variables suivantes :

```bash
# Authentification
# Générer un secret aléatoire : openssl rand -base64 32
AUTH_SECRET=votre_secret_securise

# Vercel AI Gateway (requis pour déploiements non-Vercel)
# https://vercel.com/ai-gateway
AI_GATEWAY_API_KEY=votre_cle_gateway

# Stockage
BLOB_READ_WRITE_TOKEN=votre_token_blob_vercel

# Base de données PostgreSQL
# https://vercel.com/docs/postgres ou https://neon.tech
POSTGRES_URL=postgresql://user:password@host:port/database

# Redis (optionnel, pour cache/rate limiting)
REDIS_URL=redis://localhost:6379

# Codes d'activation premium
MAI_PLUS=code_activation_plus
MAI_PRO=code_activation_pro
MAI_MAX=code_activation_max

# Providers low-cost (texte)
CEREBRAS_API_KEY=votre_cle_cerebras
MISTRAL_API_KEY=votre_cle_mistral

# Providers optionnels (endpoints custom)
# CEREBRAS_API_BASE_URL=https://api.cerebras.ai/v1
# MISTRAL_API_BASE_URL=https://api.mistral.ai/v1

# CometAPI (pour GPT models)
COMET_API_KEY_1=votre_cle_comet_1
COMET_API_KEY_2=votre_cle_comet_2

# Google Gemini
GEMINI_API_KEY_1=votre_cle_gemini_1
GEMINI_API_KEY_2=votre_cle_gemini_2
GEMINI_API_KEY_3=votre_cle_gemini_3

# URLs custom optionnelles
# COMET_API_BASE_URL=https://api.cometapi.com/v1
# GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com/v1beta
```

> ⚠️ **Important** : Ne commitez jamais votre fichier `.env.local` dans Git. Il contient des secrets qui ne doivent pas être exposés.

### Configuration de la base de données

Le projet utilise **Drizzle ORM** pour la gestion de la base de données PostgreSQL.

```bash
# Générer les migrations
pnpm db:generate

# Appliquer les migrations
pnpm db:migrate

# Ouvrir l'interface de studio (développement)
pnpm db:studio

# Autres commandes utiles
pnpm db:push      # Push schema directement
pnpm db:pull      # Pull schema depuis la DB
pnpm db:check     # Vérifier les changements
pnpm db:up        # Appliquer toutes les migrations
```

---

## 🏗 Architecture du projet

```
chatbot/
├── app/                          # Application Next.js (App Router)
│   ├── (auth)/                   # Routes d'authentification
│   │   ├── auth.ts               # Configuration NextAuth
│   │   └── api/auth/             # Endpoints d'authentification
│   ├── (chat)/                   # Routes principales du chat
│   │   ├── chat/                 # Interface de chat
│   │   ├── api/                  # API routes
│   │   ├── Health/               # Section santé
│   │   ├── news/                 # Recherche d'actualités
│   │   ├── pricing/              # Page tarifs
│   │   ├── settings/             # Paramètres utilisateur
│   │   ├── studio/               # Studio de création
│   │   └── translation/          # Traduction
│   ├── api/                      # API endpoints globaux
│   │   ├── agents/               # Gestion des agents IA
│   │   ├── projects/             # Gestion des projets
│   │   ├── coder/                # Assistant codeur
│   │   └── subscription/         # Gestion abonnements
│   ├── layout.tsx                # Layout racine
│   └── globals.css               # Styles globaux
│
├── components/                   # Composants React
│   ├── ai-elements/              # Éléments IA spécifiques
│   ├── chat/                     # Composants du chat
│   ├── ui/                       # Composants UI de base
│   └── theme-provider.tsx        # Provider de thème
│
├── lib/                          # Logique métier et utilitaires
│   ├── ai/                       # Configuration IA
│   │   ├── models.ts             # Définition des modèles
│   │   ├── providers.ts          # Providers IA
│   │   ├── tools/                # Outils IA
│   │   │   ├── create-document.ts
│   │   │   ├── edit-document.ts
│   │   │   ├── web-search.ts
│   │   │   └── ...
│   │   └── prompts.ts            # Prompts système
│   ├── db/                       # Base de données
│   │   ├── schema.ts             # Schéma Drizzle
│   │   ├── queries.ts            # Requêtes DB
│   │   ├── migrate.ts            # Script de migration
│   │   └── migrations/           # Fichiers de migration
│   ├── artifacts/                # Gestion des artifacts
│   ├── editor/                   # Configuration éditeurs
│   ├── constants.ts              # Constantes globales
│   ├── subscription.ts           # Logique d'abonnement
│   ├── ratelimit.ts              # Rate limiting
│   ├── usage-limits.ts           # Limites d'usage
│   └── utils.ts                  # Utilitaires
│
├── hooks/                        # Hooks React personnalisés
│   ├── use-active-chat.tsx       # Gestion chat actif
│   ├── use-artifact.ts           # Gestion artifacts
│   ├── use-subscription-plan.ts  # Plan d'abonnement
│   └── ...
│
├── tests/                        # Tests E2E (Playwright)
│   ├── e2e/                      # Tests end-to-end
│   ├── pages/                    # Page objects
│   └── fixtures.ts               # Fixtures de test
│
├── public/                       # Assets statiques
├── artifacts/                    # Templates d'artifacts
│
├── package.json                  # Dépendances et scripts
├── tsconfig.json                 # Configuration TypeScript
├── next.config.ts                # Configuration Next.js
├── drizzle.config.ts             # Configuration Drizzle
├── playwright.config.ts          # Configuration Playwright
├── tailwind.config.ts            # Configuration Tailwind
└── README.md                     # Ce fichier
```

---

## 💡 Fonctionnalités détaillées

### Système de chat IA

Le cœur de l'application est un système de chat puissant alimenté par l'**AI SDK v6**.

**Caractéristiques :**
- Streaming des réponses en temps réel
- Support des messages multimodaux (texte, images, fichiers)
- Historique des conversations persistant
- Système de votes (upvote/downvote)
- Partage de conversations (public/privé)
- Agents IA spécialisés
- Projets organisés

**Utilisation :**
```typescript
// Exemple d'utilisation dans un composant
import { useChat } from 'ai/react';

const { messages, input, handleInputChange, handleSubmit } = useChat({
  api: '/api/chat',
  modelId: 'moonshotai/kimi-k2-0905',
});
```

### Gestion des utilisateurs

Deux types d'utilisateurs sont supportés :

| Type | Description | Persistance |
|------|-------------|-------------|
| **Regular** | Utilisateur inscrit avec email/mot de passe | Complète |
| **Guest** | Utilisateur invité (création automatique) | Session uniquement |

**Authentification :**
- Inscription/connexion par email
- Mode invité sans inscription
- Sessions sécurisées avec NextAuth
- Protection des routes sensibles

### Système d'abonnement

Quatre niveaux d'abonnement avec limites personnalisées :

#### mAI Free
- 3 fichiers/jour (max 10 MB)
- 2 quiz/jour
- 50 unités de mémoire
- 10 messages/heure
- 30 crédits codeur
- 2 images/semaine

#### mAI Plus (+)
- 10 fichiers/jour (max 50 MB)
- 10 quiz/jour
- 75 unités de mémoire
- 30 messages/heure
- 50 crédits codeur
- 3 images/semaine

#### mAI Pro (Recommandé)
- 20 fichiers/jour (max 100 MB)
- 20 quiz/jour
- 100 unités de mémoire
- 50 messages/heure
- 75 crédits codeur
- 4 images/semaine

#### mAI Max
- 50 fichiers/jour (max 200 MB)
- Quiz illimités
- 200 unités de mémoire
- 200 messages/heure
- 150 crédits codeur
- 5 images/semaine

**Activation :** Via codes promo (MAI_PLUS, MAI_PRO, MAI_MAX)

### Artifacts et documents

Le système supporte plusieurs types d'artifacts :

| Type | Usage | Technologies |
|------|-------|--------------|
| **Code** | Scripts, algorithmes | CodeMirror, syntax highlighting |
| **Texte** | Documents, essais | Streamdown, Markdown |
| **Sheet** | Données, tableaux | React Data Grid |
| **Image** | Génération visuelle | Flux, Kling AI |

**Outils IA disponibles :**
- `createDocument` - Créer un nouvel artifact
- `editDocument` - Modifier un artifact existant
- `updateDocument` - Mettre à jour le contenu
- `requestSuggestions` - Obtenir des suggestions
- `webSearch` - Recherche internet
- `getWeather` - Informations météo

### Modèles IA disponibles

L'application utilise le **Vercel AI Gateway** pour accéder à de multiples fournisseurs :

#### Modèles principaux (Gateway)

| Modèle | Provider | Cas d'usage |
|--------|----------|-------------|
| DeepSeek V3.2 | DeepSeek | Tâches générales, outils |
| Mistral Codestral | Mistral | Code, débogage |
| Mistral Small | Mistral | Rapidité, vision |
| Kimi K2 0905 | Moonshot AI | Conversations longues |
| Kimi K2.5 | Moonshot AI | Cas complexes (premium) |
| GPT OSS 20B | OpenAI | Raisonnement léger |
| GPT OSS 120B | OpenAI | Tâches avancées |
| Grok 4.1 Fast | xAI | Réponses instantanées |

#### Modèles économiques (Direct)

- **CometAPI** : GPT-5.4 Nano, GPT-5.4 Mini
- **Gemini** : Modèles Gemini via API directe
- **Cerebras** : Llama 3.1 8B, Qwen 3 32B
- **Mistral API** : Ministral 3B, Ministral 8B

#### Génération d'images

- **Flux 2 Max** - Qualité maximale
- **Flux 2 Pro** - Équilibre qualité/vitesse
- **Flux 2 Flex** - Flexible et économique
- **Kling Image** - Spécialisé images

---

## 🌐 API & Routes

### Routes principales

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/chat` | POST | Endpoint principal de chat |
| `/api/agents` | GET/POST | Gestion des agents IA |
| `/api/agents/[id]` | GET/PUT/DELETE | Opérations sur un agent |
| `/api/projects` | GET/POST | Gestion des projets |
| `/api/projects/[id]` | GET/PUT/DELETE | Opérations sur un projet |
| `/api/coder/task` | POST | Soumettre une tâche au codeur |
| `/api/news/search` | GET | Recherche d'actualités |
| `/api/studio` | GET/POST | Studio de création |
| `/api/export` | POST | Exporter des données |
| `/api/subscription/activate` | POST | Activer un code promo |
| `/api/restricted-access` | GET | Vérifier l'accès restreint |
| `/api/auth/guest` | POST | Créer un utilisateur invité |
| `/api/auth/[...nextauth]` | GET/POST | Endpoints NextAuth |

### API Internes (Chat)

| Route | Description |
|-------|-------------|
| `/api/suggestions` | Suggestions de messages |
| `/api/document` | CRUD documents |
| `/api/models` | Liste des modèles disponibles |

---

## 📦 Commandes disponibles

```bash
# Développement
pnpm dev              # Lancer le serveur de développement (turbo mode)
pnpm build            # Build de production avec migrations DB
pnpm start            # Démarrer le serveur de production

# Base de données
pnpm db:generate      # Générer les migrations Drizzle
pnpm db:migrate       # Appliquer les migrations
pnpm db:studio        # Ouvrir Drizzle Studio (GUI)
pnpm db:push          # Push schema directement en DB
pnpm db:pull          # Pull schema depuis la DB
pnpm db:check         # Vérifier les changements de schema
pnpm db:up            # Appliquer toutes les migrations en attente

# Code quality
pnpm check            # Vérifier le code avec Ultracite
pnpm fix              # Corriger automatiquement les problèmes

# Tests
pnpm test             # Exécuter les tests Playwright
```

---

## 🧪 Tests

Le projet utilise **Playwright** pour les tests end-to-end.

### Configuration

Les tests sont configurés dans `playwright.config.ts` :
- Port par défaut : 3000
- Timeout : 240 secondes
- Workers : 2 (pour éviter les crashes navigateur)
- Trace : Conservé en cas d'échec

### Exécuter les tests

```bash
# Tous les tests
pnpm test

# Tests spécifiques
export PLAYWRIGHT=True && pnpm exec playwright test tests/e2e/chat.spec.ts

# Avec UI
pnpm exec playwright test --ui

# En mode headless CI
CI=true pnpm test
```

### Structure des tests

```
tests/
├── e2e/              # Tests end-to-end
├── pages/            # Page Object Models
├── fixtures.ts       # Fixtures partagées
├── helpers.ts        # Fonctions utilitaires
└── prompts/          # Prompts de test
```

---

## 🚀 Déploiement

### Déploiement sur Vercel (Recommandé)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/templates/next.js/chatbot)

1. Cliquez sur le bouton "Deploy with Vercel"
2. Connectez votre compte GitHub
3. Configurez les variables d'environnement
4. Déployez !

**Pour Vercel :** L'authentification AI Gateway est gérée automatiquement via OIDC.

### Déploiement manuel

```bash
# 1. Build
pnpm build

# 2. Démarrer
pnpm start
```

Ou utilisez Docker / votre propre infrastructure.

### Variables d'environnement en production

Assurez-vous de configurer toutes les variables nécessaires :
- `AUTH_SECRET` - Secret d'authentification
- `AI_GATEWAY_API_KEY` - Clé AI Gateway (sauf Vercel)
- `POSTGRES_URL` - URL de connexion PostgreSQL
- `BLOB_READ_WRITE_TOKEN` - Token Vercel Blob
- `REDIS_URL` - URL Redis (optionnel)
- Toutes les clés API des providers utilisés

---

## 📁 Structure des fichiers clés

### Configuration

| Fichier | Description |
|---------|-------------|
| `package.json` | Dépendances et scripts npm |
| `tsconfig.json` | Configuration TypeScript |
| `next.config.ts` | Configuration Next.js |
| `drizzle.config.ts` | Configuration Drizzle ORM |
| `playwright.config.ts` | Configuration Playwright |
| `biome.jsonc` | Configuration Biome (linting) |
| `components.json` | Configuration shadcn/ui |

### Base de données

| Fichier | Description |
|---------|-------------|
| `lib/db/schema.ts` | Schéma de la base de données |
| `lib/db/queries.ts` | Fonctions de requêtage |
| `lib/db/migrate.ts` | Script de migration |
| `lib/db/migrations/` | Fichiers de migration générés |

### IA

| Fichier | Description |
|---------|-------------|
| `lib/ai/models.ts` | Configuration des modèles IA |
| `lib/ai/providers.ts` | Configuration des providers |
| `lib/ai/prompts.ts` | Prompts système |
| `lib/ai/tools/` | Outils IA (création doc, search, etc.) |
| `lib/ai/external-providers.ts` | Providers externes directs |
| `lib/ai/affordable-models.ts` | Modèles économiques |

### Authentification

| Fichier | Description |
|---------|-------------|
| `app/(auth)/auth.ts` | Configuration NextAuth |
| `app/(auth)/auth.config.ts` | Options d'authentification |
| `app/(auth)/actions.ts` | Server Actions auth |

---

## 📄 Licence

Ce projet est distribué sous la licence **Apache License 2.0**.

Consultez le fichier [LICENSE](LICENSE) pour plus de détails.

```
Copyright 2024 Vercel, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Veuillez suivre ces étapes :

1. Fork le repository
2. Créez une branche de fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

---

## 📞 Support

- **Documentation** : [Lire les docs](https://chatbot.ai-sdk.dev/docs)
- **Demo** : [Essayer la démo](https://chatbot.ai-sdk.dev/demo)
- **Issues** : [GitHub Issues](../../issues)

---

<div align="center">

**Construit avec ❤️ en utilisant Next.js et AI SDK**

</div>
