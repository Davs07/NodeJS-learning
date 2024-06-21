import express from "express";
import { ALLOWED_ORIGINS, PORT, SECRET_JWT_KEY } from "./config.js";
import { UserRepository } from "./user-repository.js";
import { CandidatoDataRepository } from "./candidato-repository.js";
import { EmpresaDataRepository } from "./empresa-repository.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import cors from "cors";

const app = express();

// Configuración de CORS
/* app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // This is needed if you want to allow cookies to be sent with requests
  })
); */
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
    ],
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

// Middleware (Para verificar el token y establecer la sesión del usuario)
/* app.use((req, res, next) => {
  const token = req.cookies.access_token;

  req.session = { user: null };

  try {
    const data = jwt.verify(token, SECRET_JWT_KEY);
    req.session.user = data;
    res.status(400).json({ Xd: "Xd" });
  } catch (error) {
    console.log("Token verification error:", error);
  }

  next();
}); */

app.get("/", (req, res) => {
  const { user } = req.session;
  res.render("landing", user);

  if (!token) return res.render("landing");
  try {
    const data = jwt.verify(token, SECRET_JWT_KEY);
    res.render("protected", data);
  } catch (error) {
    res.status(401).json("Access not authorized");
  }
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
        httpOnly: true, // la cookie solo se puede acceder en el servidor
        secure: process.env.NODE_ENV === "production", //la cookie solo se puede acceder en https
        sameSite: "strict", //la cookie solo se puede acceder en el mismo dominio
        maxAge: 1000 * 60 * 60, // la cookie tiene un tiempo de validez de 1 hora
      })
      .status(200)
      .json({ user });
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
});
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  console.log({ username, password });

  try {
    const id = await UserRepository.create({ username, password });
    res.status(201).json({ id });
  } catch (error) {
    res.status(500).json({ error: "Error creating user" });
  }
});
app.post("/logout", (req, res) => {
  res.clearCookie("access_token").status(200).json("Logged out");
});

app.get("/app", (req, res) => {
  const { user } = req.session;
  if (!user) return res.status(403).json("Access not authorized");

  res.render("protected", user);
});

// Candidato Datos

app.get("/user", async (req, res) => {
  const { user } = req.session;
  if (!user) return res.status(403).json("Access not authorized");
});

app.post("/candidato", async (req, res) => {
  /*  const { user } = req.session;
  if (!user) return res.status(403).json("Access not authorized"); */

  const data = req.body;
  console.log(data);

  try {
    const candidato = await CandidatoDataRepository.create({
      ...data,
    });
    console.log("candidato", candidato);
    res.status(201).json(candidato);
  } catch (error) {
    res.json(error.message);
  }
  console.log(req.body);
  /* res.json(req.body); */
});

app.post("/empresa", async (req, res) => {
  const data = req.body;

  try {
    const empresa = await EmpresaDataRepository.create({
      ...data,
    });
    res.status(201).json(empresa);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Ruta para hacer match
app.post('/api/match', async (req, res) => {
  try {
    const response = await axios.post('http://localhost:8000/match', req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error al hacer match:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error al procesar la solicitud de match' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
