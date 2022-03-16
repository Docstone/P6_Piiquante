const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce)
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
    .then(() => res.status(201).json({ message : 'Sauce aujoutée'}))
    .catch(error => res.status(400).json({ error }));
}

exports.updateSauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
    const filename = sauce.imageUrl.split('/images/')[1];
    fs.unlink(`images/${filename}`, () => {
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce modifié !'}))
        .catch(error => res.status(400).json({ error }));
    });
  })

};

exports.getSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
  .then(sauce => res.status(200).json(sauce))
  .catch(error => res.status(404).json({ error }))
};

exports.getAllSauces =  (req, res, next) => {
  Sauce.find()
  .then(sauces => res.status(200).json(sauces))
  .catch(error => res.status(404).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then( sauce => {
      if (!sauce) {
        return res.status(404).json({
          error: new Error("Sauce non trouvé !")
        });
      }
      if (sauce.userId !== req.auth.userId) {
        return res.status(401).json({
          error: new Error("Requete non autorisée")
        })
      }
      Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
            .catch(error => res.status(400).json({ error }));
        });
      })
      .catch(error => res.status(500).json({ error }));
    })
    .catch( error => res.status(500).json({ error}));
};

exports.likeSauce = (req, res, next) => {
  Sauce.findOne({  _id: req.params.id })
  .then( sauce => {
    if ( sauce.like == 1 ) {
      Sauce.usersLiked.push(sauce.userId);
      Sauce.likes ++;
    } else if ( sauce.like == -1 ) {
      Sauce.usersDisliked.push(sauce.userId);
      Sauce.dislikes ++;
    } else if ( sauce.like == 0 ) {
      if( Sauce.usersLiked.includes(sauce.userId) ){
        Sauce.usersLiked.splice(Sauce.usersLiked.indexOf(sauce.userId));
        Sauce.likes --;
      } else if ( Sauce.usersDisliked.includes(sauce.userId) ){
        Sauce.usersDisliked.splice(Sauce.usersDisliked.indexOf(sauce.userId));
        Sauce.dislikes --;
      }
    }
    const sauceObject = JSON.parse(req.body.sauce);
  }).catch( error => res.status(400).json({ error }));
  Sauce.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce liké !'}))
        .catch(error => res.status(400).json({ error }));
 };