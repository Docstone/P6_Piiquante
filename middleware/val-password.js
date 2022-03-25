const passwordValidator = require('password-validator');

const passwordSchema = new passwordValidator();

passwordSchema
  .is().min(8)
  .is().max(20)
  .has().uppercase()
  .has().lowercase()
  .has().digits(2)
  .is().not().oneOf(['Passw0rd', 'Password123']);

console.log("contenu passwordSchema");
console.log(passwordSchema)

module.exports = (req, res, next) => {
    if ( !passwordSchema.validate(req.body.password) ) {
        return res.status(400).json({ message : `Mot de passe trop faible:   ${passwordSchema.validate(req.body.password, { list: true }) }`})
    } else {
        next();
    }
};
