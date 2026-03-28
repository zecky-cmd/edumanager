# 🎓 Elite School Management API

[![NestJS](https://img.shields.io/badge/Framework-NestJS%2011-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma&logoColor=white)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Railway](https://img.shields.io/badge/Deploy-Railway-0B0D0E?logo=railway&logoColor=white)](https://railway.app/)

> Une solution backend robuste et scalable pour la digitalisation complète de la gestion académique et administrative.

## 🎯 Objectif du Projet
Le projet **Elite School Management** est né d'un constat : la gestion manuelle des établissements scolaires est source d'erreurs et de perte de temps. Cette API automatise les processus critiques (calculs de moyennes, rangs, bulletins) tout en garantissant une transparence totale entre l'administration, les enseignants, les élèves et les parents.

## 💡 Problématiques résolues
- **Fiabilité des résultats** : Automatisation du moteur de calcul des moyennes pondérées par coefficients.
- **Transparence Financière** : Suivi en temps réel des paiements et des reliquats par élève.
- **Sécurité des données** : Système de permissions granulaire (RBAC) pour protéger les informations sensibles.
- **Interactivité** : Communication fluide via un système de messagerie interne et suivi des présences.

## 🛠️ Stack Technique & Justifications

| Technologie | Rôle | Justification |
| :--- | :--- | :--- |
| **NestJS 11** | Framework | Architecture modulaire, typage fort et maintenabilité à long terme. |
| **Prisma ORM** | Data Access | Typage automatique des requêtes et migrations simplifiées pour un schéma complexe. |
| **PostgreSQL** | Base de données | Fiabilité ACID, indispensable pour la gestion financière et les résultats scolaires. |
| **JWT & Passport** | Sécurité | Authentification Stateless sécurisée avec gestion de sessions par rôles. |
| **Swagger/OpenAPI** | Doc | Contrat d'interface clair facilitant l'intégration avec le frontend (Next.js). |
| **Jest/Supertest** | Tests | Tests de bout en bout (E2E) garantissant l'intégrité du moteur de calcul. |

## 🌟 Fonctionnalités Clés

### 🔒 Sécurité & RBAC (Role-Based Access Control)
Mise en place de Guards personnalisés pour 5 niveaux d'accès : 
- **Admin** : Gestion système et logs d'audit.
- **Directeur** : Pilotage académique et financier.
- **Enseignant** : Saisie des notes et gestion pédagogique.
- **Parent/Élève** : Consultation personnalisée des résultats et de la vie scolaire.

### 📐 Moteur de Calcul Automatisé
- Calcul dynamique des moyennes par période (trimestres/semestres).
- Algorithme d'attribution des rangs par classe avec gestion des ex-æquo.
- Génération de bulletins numériques prêts à l'édition.

### 💰 Module Financier
- Configuration des rubriques (Scolarité, Cantine, Transport).
- Suivi des encaissements et génération de reçus uniques.
- Situation financière globale de l'établissement en un coup d'œil.

## 🧪 Qualité & Tests
Le projet intègre une suite de tests **E2E (End-to-End)** qui simule un cycle scolaire complet (création d'année, inscription, saisie de notes, calcul de rangs).
```bash
# Lancer les tests de validation métier
npm run test:e2e
```

## 🚀 Déploiement
L'API est certifiée "Production Ready" et déployée sur **Railway** avec une architecture de base de données managée sur **Supabase**.
- **URL API** : `https://edumanager.up.railway.app/api`
- **Documentation UI** : `https://edumanager.up.railway.app/api/docs`

---
💾 *Projet développé dans une optique de Clean Architecture et de performance.*
