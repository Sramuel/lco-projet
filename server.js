const fs = require("fs");
const http=require("http");
const host = 'localhost';
const port = 8080;
const server = http.createServer();


const { Client } = require('pg');

const client = new Client({
    user: process.env.PGUSER || 'appuser', 
    password: process.env.PGPASSWORD, 
    database: process.env.PGDATABASE || 'application_image',
    port : 5432
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
    if (req.method === 'GET' && req.url.startsWith('/public/')) {
        try {
            const fichier = fs.readFileSync('.'+req.url);
            res.end(fichier);
        } catch (err) {
            console.log(err);
            res.end("erreur ressource");
        }
    } else if (req.url.startsWith('/page-image/')) {
        try {
            const sqlQuery = `SELECT * FROM images`;
            const sqlResult = await client.query(sqlQuery);
            const images = sqlResult.rows;
            const sqlQuery2 = `SELECT * FROM textes`;
            const sqlResult2 = await client.query(sqlQuery2);
            const textes = sqlResult2.rows;
            let urlParts = req.url.split('/');
            let clef = parseInt(urlParts[2], 10);
            let pageHTML2 = `
        <!DOCTYPE html>
        <html>
            <head>
                <link rel="stylesheet" href="/public/style.css">
                <title>Image${clef}</title>
                <meta charset="UTF-8">
            </head>
            <body>
                <div class="centre">
                    <img src="/public/images/${images[clef-1].fichier}" width="500">
                    <p>${images[clef-1].nom}</p>
                </div>
                <div>
                <p>${textes[clef-1].texte}</p>`;
                if () {
                    pageHTML2 += `
                    `;
                } 
                pageHTML2 += `
                </div>
            </body>
        </html>`;
            res.end(pageHTML2);
        } catch (err) {
            console.log(err);
            res.end('erreur page inconnu');
        }
    } else {
        const sqlQuery = `SELECT * FROM images`;
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
                        <a href="/page-image/${images[i].id}"><img src="/public/images/${images[i].fichier}"></a>
                    `;
                }
            pageHTML += `
            </div>
        </body>
    </html>`;
        res.end(pageHTML);
    }
});

server.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});