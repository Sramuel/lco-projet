\c postgres
DROP DATABASE IF EXISTS "application_image";
CREATE DATABASE "application_image";

\c "application_image"

CREATE TABLE auteurs (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL
);

CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    date DATE,
    fichier VARCHAR(255) NOT NULL,
    id_auteur int references auteurs(id)
);

CREATE TABLE textes (
    id SERIAL PRIMARY KEY,
    texte TEXT NOT NULL,
    id_image int references images(id)
);

CREATE TABLE choix (
    id SERIAL PRIMARY KEY,
    id_image_src INT REFERENCES images(id) ON DELETE CASCADE,
    texte1 VARCHAR(255) NOT NULL,
    texte2 VARCHAR(255) NOT NULL,
    id_image_dst1 INT REFERENCES images(id) ON DELETE CASCADE,
    id_image_dst2 INT REFERENCES images(id) ON DELETE CASCADE
);


\i auteurs.sql

\i images.sql