const bcrypt = require("bcryptjs");

const hashPassword = (password) => {
   const saltRounds = 10;
   return bcrypt.hashSync(password, saltRounds);
};

const comparePassword = (password, hashedPassword) => {
   return bcrypt.compareSync(password, hashedPassword);
};

module.exports = { hashPassword, comparePassword };
