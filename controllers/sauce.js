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

exports.likeDislike = (req, res, next) => {
  let like = req.body.like
  let userId = req.body.userId
  let sauceId = req.params.id

  //S'il s'agit un like
  if (like === 1) {
      Sauce.updateOne({
              _id: sauceId
          }, {
              $push: {
                  usersLiked: userId // On ajoute dans le tableau
              },
              $inc: {
                  likes: +1 // On incrémente de 1
              },
          })
          .then(() => res.status(200).json({
              message: 'like added !'
          }))
          .catch((error) => res.status(400).json({
              error
          }))
  }
  // S'il s'agit d'un dislike
  if (like === -1) {
      Sauce.updateOne({
              _id: sauceId
          }, {
              $push: {
                  usersDisliked: userId
              },
              $inc: {
                  dislikes: +1
              },
          })
          .then(() => {
              res.status(200).json({
                  message: 'Dislike added !'
              })
          })
          .catch((error) => res.status(400).json({
              error
          }))
  }
  // Si il s'agit d'annuler un like ou un dislike
  if (like === 0) {
      Sauce.findOne({
              _id: sauceId
          })
          .then((sauce) => {
              // Si il s'agit d'annuler un like
              if (sauce.usersLiked.includes(userId)) {
                  Sauce.updateOne({
                          _id: sauceId
                      }, {
                          $pull: {
                              usersLiked: userId
                          },
                          $inc: {
                              likes: -1
                          },
                      })
                      .then(() => res.status(200).json({
                          message: 'Like removed !'
                      }))
                      .catch((error) => res.status(400).json({
                          error
                      }))
              }
              // Si il s'agit d'annuler un dislike
              if (sauce.usersDisliked.includes(userId)) {
                  Sauce.updateOne({
                          _id: sauceId
                      }, {
                          $pull: {
                              usersDisliked: userId
                          },
                          $inc: {
                              dislikes: -1
                          },
                      })
                      .then(() => res.status(200).json({
                          message: 'Dislike removed !'
                      }))
                      .catch((error) => res.status(400).json({
                          error
                      }))
              }
          })
          .catch((error) => res.status(404).json({
              error
          }))
  }
}