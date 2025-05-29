const { comparePassword, hashPassword } = require("../helpers/hash");
const { generateToken } = require("../helpers/jwt");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();

const { User } = require("../models");

module.exports = class AuthController {
   static async register(req, res, next) {
      try {
         const { username, email, password } = req.body;

         let data = await User.create({
            username,
            email,
            password,
         });

         res.status(201).json({
            message: "User registered successfully",
            data: {
               id: data.id,
               username: data.username,
               email: data.email,
            },
         });
      } catch (error) {
         console.log(error);
         next(error);
      }
   }
   static async login(req, res, next) {
      try {
         const { email, password } = req.body;
         if (!email) {
            throw {
               name: "SequelizeValidationError",
               message: "Email is required",
            };
         }
         if (!password) {
            throw {
               name: "SequelizeValidationError",
               message: "Password is required",
            };
         }
         let user = await User.findOne({
            where: {
               email,
            },
         });
         if (!user) {
            throw {
               name: "Unauthorized",
               message: "Invalid email or password",
            };
         }
         let compare = comparePassword(password, user.password);
         if (!compare) {
            throw {
               name: "Unauthorized",
               message: "Invalid email or password",
            };
         }
         let payload = {
            id: user.id,
            email: user.email,
         };
         let token = generateToken(payload);
         res.status(200).json({
            message: "Login successful",
            access_token: token,
         });
      } catch (error) {
         console.log(error);
         next(error);
      }
   }
   /* istanbul ignore next */
   static async googleLogin(req, res, next) {
      try {
         const { googleToken } = req.body;
         if (!googleToken)
            throw { name: "BadRequest", message: "Google Token is required" };

         const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: process.env.CLIENT_ID,
         });
         console.log(ticket, "ticket from google");

         const payload = ticket.getPayload();

         const [user] = await User.findOrCreate({
            where: { email: payload.email },
            defaults: {
               password: hashPassword(payload.sub), // Use sub as a unique identifier
               username: payload.name,
            },
         });
         console.log(user, "user from google");

         const access_token = generateToken({ id: user.id });
         res.status(200).json({ access_token });
      } catch (err) {
         next(err);
      }
   }
};
