const fs = require("fs");
const http = require("http");
const host = '0.0.0.0';
const port = 8080;
const server = http.createServer();

const { Client } = require('pg');

const client = new Client({
    user: process.env.PGUSER || 'appuser',
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE || 'application_image',
    port: Number(process.env.PGPORT || 5432)
});

client.connect()
    .then(() => {
        console.log('Connected to database');
    })
    .catch((e) => {
        console.log('Error connecting to database');
        console.log(e);
    });

server.on("request", async (req, res) => {
    // --- Gestion des fichiers statiques (CSS, Images) ---
    if (req.method === 'GET' && req.url.startsWith('/public/')) {
        try {
            const fichier = fs.readFileSync('.' + req.url);
            res.end(fichier);
        } catch (err) {
            console.log(err);
            res.writeHead(404);
            res.end("erreur ressource");
        }
    
    // --- Gestion de la page d'une image spécifique ---
    } else if (req.url.startsWith('/page-image/')) {
        try {
            let urlParts = req.url.split('/');
            let clef = parseInt(urlParts[2], 10);

            // Requête SQL corrigée pour tout récupérer en une fois
            const sqlQuery = `
                SELECT
                    img.nom AS image_nom,
                    img.fichier,
                    img.texte AS image_texte,
                    aut.nom AS auteur_nom,
                    aut.prenom AS auteur_prenom,
                    ch.texte1,
                    ch.id_image_dst1,
                    ch.texte2,
                    ch.id_image_dst2
                FROM
                    images AS img
                JOIN
                    auteurs AS aut ON img.id_auteur = aut.id
                LEFT JOIN -- LEFT JOIN au cas où une image n'a pas de choix
                    choix AS ch ON img.id = ch.id_image_src
                WHERE
                    img.id = $1;
            `;
            
            const sqlResult = await client.query(sqlQuery, [clef]);

            // Vérifier si l'image existe
            if (sqlResult.rows.length === 0) {
                res.writeHead(404);
                res.end('Image non trouvée');
                return;
            }

            const data = sqlResult.rows[0]; // Toutes nos données sont ici

            // Construction de la page HTML
            let pageHTML2 = `
            <!DOCTYPE html>
            <html>
                <head>
                    <link rel="stylesheet" href="/public/style.css">
                    <title>${data.image_nom}</title>
                    <meta charset="UTF-8">
                </head>
                <body>
                    <div class="page-container">
                        <div class="centre">
                            <img class="image-principale" src="/public/images/${data.fichier}" alt="${data.image_nom}">
                            <p class="auteur">Auteur de l'image : ${data.auteur_prenom} ${data.auteur_nom}</p>
                            <p class="description">${data.image_texte}</p>
                        </div>
                        
                        <div class="choix-container">`;
            
            // Ajouter les choix seulement s'ils existent
            if (data.texte1 && data.texte2) {
                pageHTML2 += `
                            <div class="gauche">
                                <a href="/page-image/${data.id_image_dst2}">${data.texte2}</a>
                            </div>
                            <div class="droite">
                                <a href="/page-image/${data.id_image_dst1}">${data.texte1}</a>
                            </div>
                `;
            }
            
            pageHTML2 += `
                        </div>
                    </div>
                </body>
            </html>`;
            
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(pageHTML2);

        } catch (err) {
            console.log(err);
            res.writeHead(500);
            res.end('Erreur serveur');
        }

    // --- Gestion de la page d'accueil (Mur d'images) ---
    } else {
        try {
            const sqlQuery = `SELECT * FROM images ORDER BY id`;
            const sqlResult = await client.query(sqlQuery);
            const images = sqlResult.rows;

            let pageHTML = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Mur d'images</title>
                    <meta charset="UTF-8">
                    <link rel="stylesheet" href="/public/style.css">
                </head>
                <body>
                <h1>Mur d'images</h1>
                    <div id="mur">
            `;
            for (let i = 0; i < images.length; i++) {
                pageHTML += `
                        <a href="/page-image/${images[i].id}"><img src="/public/images/${images[i].fichier}" alt="${images[i].nom}"></a>
                `;
            }
            pageHTML += `
                    </div>
                </body>
            </html>`;

            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(pageHTML);
        } catch (err) {
            console.log(err);
            res.writeHead(500);
            res.end('Erreur lors de la récupération des images');
        }
    }
});

server.listen(port, host, () => {
    console.log(`Server running at http://localhost:${port}/`);
});