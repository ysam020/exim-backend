import express from "express";
import bcrypt from "bcrypt";
import User from "../models/userModel.mjs";

const router = express.Router();

router.post("/api/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        res.send({ message: "User already registered" });
      } else {
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
            res.send(err);
          } else {
            const user = new User({
              username,
              email,
              password: hashedPassword,
              role,
            });
            user
              .save()
              .then(() => {
                res.send({
                  message: "Successfully registered",
                });
              })
              .catch((err) => {
                res.send(err);
              });
          }
        });
      }
    })
    .catch((err) => {
      res.send(err);
    });
});

export default router;
