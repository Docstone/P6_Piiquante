const express = require('express');
const router  = express.Router();

const sauceCtrl = require('../controllers/sauce');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

// Create new sauce
router.post('/',auth, multer, sauceCtrl.createSauce);
// Update sauce 
router.put('/:id',auth, multer, sauceCtrl.updateSauce);
// Delete Sauce
router.delete('/:id',auth, sauceCtrl.deleteSauce);
// Return array of all Sauces
router.get('/',auth, sauceCtrl.getAllSauces)
// Return sauce with given Id
router.get('/:id',auth, sauceCtrl.getSauce);
//Define like status
router.post('/:id/like',auth, sauceCtrl.likeSauce);


module.exports = router;