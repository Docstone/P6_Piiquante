const express = require('express');

// xxs-clean controle les données req.body, req.query, and req.params
const xss = require('xss-clean');

// helmet est une collection de middleware
// configurant des Headers HTTP et ammeliorant la securité
const helmet = require('helmet');

// nocache configure des Headers HTTP
// afin de desactiver la mise en cache coté client
const nocache = require('nocache');

// express-rate-limit afin de 
// limiter les requêtes entrantes.
const rateLimit = require("express-rate-limit");

// Sanitize les entrés utilisateurs contre les injections SQL
const mongoSanitize = require('express-mongo-sanitize');

const mongoose = require('mongoose');
const path = require('path');


const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

const app = express();
app.use(xss());


// Création d'un limiteur avec la fonction rateLimit
// max contient le nombre maximum de requêtes et windows
// le temp en millisecond pour le nombre de requêtes possible 
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from this IP"
});

// Ajout du limiteur au middleware express
// afin que toutes les requêtes venant de l'utilisateur
// passent par le middleware
app.use(limiter);


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

mongoose.connect('mongodb+srv://docstone:w565iSGAWwtA76L@docstonecluster.hckhk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


app.use(express.json());
app.use(mongoSanitize());


app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(helmet());
app.use(nocache());

app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;