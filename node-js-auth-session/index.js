import express from "express";
import { PORT, SECRET_JWT_KEY } from "./config.js";
import { UserRepository } from "./user-repository.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());

app.set("view engine", "ejs");

app.use(express.json());

app.use(cookieParser());

app.use((req, res, next) => {
  const token = req.cookies.access_token;

  req.session = { user: null };

  try {
    const data = jwt.verify(token, SECRET_JWT_KEY);
    req.session.user = data;
  } catch (error) {
    console.log(error);
  }

  next();
});

app.get("/", (req, res) => {
  const { user } = req.session;
  res.render("landing", user);

  /*   if (!token) return res.render("landing");
  try {
    const data = jwt.verify(token, SECRET_JWT_KEY);
    res.render("protected", data);
  } catch (error) {
    res.status(401).json("Access not authorized");
  } */
});

// Endpoints

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await UserRepository.login({ username, password });
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      SECRET_JWT_KEY,
      {
        expiresIn: "1h",
      }
    );
    res
      .cookie("access_token", token, {
        httpOnly: true, // la cookise solo se puede acceder en el servidor
        secure: process.env.NODE_ENV === "production", //la cookie solo se puede acceder en https
        sameSite: "strict", //la cookie solo se puede acceder en el mismo dominio
        maxAge: 1000 * 60 * 60, // la cookie tiene un tiempo de validez de 1 hora
      })
      .status(200)
      .json({ user });
  } catch (error) {
    res.status(401).json(error.message);
  }
});
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  console.log({ username, password });

  try {
    const id = await UserRepository.create({ username, password });
    res.status(201).json({ id });
  } catch (error) {
    res.status(400).json(error.message);
  }
});
app.post("/logout", (req, res) => {
  res.clearCookie("access_token").status(200).json("Logged out");
});

app.get("/protected", (req, res) => {
  const { user } = req.session;
  if (!user) return res.status(403).json("Access not authorized");

  res.render("protected", user);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
