# Projet LCO

Application web Node.js utilisant PostgreSQL pour afficher et commenter des images.

## Pré-requis

- Node.js et npm
- PostgreSQL
- Un compte PostgreSQL local ou distant

## Configuration de PostgreSQL

Les scripts `start.sh` et `stop.sh` démarrent et arrêtent PostgreSQL sur une machine Linux utilisant systemd. Adaptez-les si votre système utilise un autre service.

Initialisez la base et chargez les données :

```bash
./start.sh
sudo -u postgres psql -f application-image.sql
psql -d application_image -f auteurs.sql
psql -d application_image -f choix.sql
psql -d application_image -f images.sql
```

Configurez ensuite les paramètres de connexion avant de lancer le serveur :

```bash
export PGUSER=appuser
export PGPASSWORD='votre-mot-de-passe'
export PGDATABASE=application_image
export PGPORT=5432
```

Le rôle PostgreSQL indiqué par `PGUSER` doit exister et avoir les droits sur `application_image`.

## Installer et lancer

```bash
npm install
npm start
```

Le serveur écoute sur <http://localhost:8080/>. Pour arrêter PostgreSQL :

```bash
./stop.sh
```

"'## Avertissement

Ce dépôt contient un projet étudiant réalisé à des fins pédagogiques et académiques. Il peut contenir des limitations, des choix simplifiés ou des failles de sécurité ; il n est pas destiné à un usage professionnel, à la production ou au traitement de données réelles. Utilisez-le uniquement dans un environnement de test et adaptez-le avant toute réutilisation.
'"
