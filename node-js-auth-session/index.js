import express from "express";
import { ALLOWED_ORIGINS, PORT, SECRET_JWT_KEY } from "./config.js";
import { UserRepository } from "./user-repository.js";
import { CandidatoDataRepository } from "./candidato-repository.js";
import { EmpresaDataRepository } from "./empresa-repository.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import cors from "cors";
import axios from "axios";


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
    const candidato = req.body

    const data = {
      "candidato": candidato,
      "ofertas": ofertas
    }
    const response = await axios.post('http://localhost:8000/match', data);
    res.json(response.data);
  } catch (error) {
    console.error('Error al hacer match:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error al procesar la solicitud de match' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




const ofertas = [
  {
      "empresa": "Tech Solutions",
      "puesto": "Data Analyst",
      "descripcion": "Buscamos un analista de datos con experiencia en análisis de grandes volúmenes de datos y habilidades en Python y SQL.",
      "experiencia": "2 a 3 años",
      "educacion": "Universitario",
      "jornada": "Completa",
      "modalidad": "Presencial",
      "lugar_trabajo": "Lima",
      "salario_ofrecido": "S/.4000.00 a S/.5000.00"
  },
  {
      "empresa": "Creative Designs",
      "puesto": "Frontend Developer",
      "descripcion": "Estamos en búsqueda de un desarrollador frontend con conocimientos en React y JavaScript para trabajar en proyectos innovadores.",
      "experiencia": "3 a 5 años",
      "educacion": "Universitario",
      "jornada": "Completa",
      "modalidad": "Remoto",
      "lugar_trabajo": "Arequipa",
      "salario_ofrecido": "S/.5000.00 a S/.6000.00"
  },
  {
      "empresa": "Tech Innovators Inc.",
      "puesto": "Desarrollador de Software",
      "descripcion": "Buscamos un desarrollador de software con experiencia en JavaScript y Python para unirse a nuestro equipo de desarrollo ágil.",
      "experiencia": "3 años de experiencia en desarrollo de software",
      "educacion": "Licenciatura en Ciencias de la Computación o afines",
      "jornada": "Tiempo completo",
      "modalidad": "Remoto",
      "lugar_trabajo": "San Francisco, CA",
      "salario_ofrecido": "S/.80.000 - S/.10.000 anuales"
  },
  {
      "empresa": "Green Energy Solutions",
      "puesto": "Ingeniero de Energías Renovables",
      "descripcion": "Estamos buscando un ingeniero con experiencia en energías renovables para liderar proyectos de energía solar y eólica.",
      "experiencia": "5 años en el sector de energías renovables",
      "educacion": "Ingeniería en Energías Renovables o similar",
      "jornada": "Tiempo completo",
      "modalidad": "Presencial",
      "lugar_trabajo": "Austin, TX",
      "salario_ofrecido": "S/.90.000 - S/.11.000 anuales"
  },
  {
      "empresa": "Healthcare United",
      "puesto": "Enfermero/a",
      "descripcion": "Buscamos enfermeros dedicados y compasivos para trabajar en nuestra unidad de cuidados intensivos.",
      "experiencia": "2 años de experiencia en hospitales",
      "educacion": "Licenciatura en Enfermería",
      "jornada": "Turnos rotativos",
      "modalidad": "Presencial",
      "lugar_trabajo": "New York, NY",
      "salario_ofrecido": "S/.70.000 - S/.85.000 anuales"
  },
  {
      "empresa": "MarketMakers Co.",
      "puesto": "Analista de Marketing",
      "descripcion": "Estamos en busca de un analista de marketing que se encargue de desarrollar estrategias de mercado y analizar el comportamiento del consumidor.",
      "experiencia": "3 años en análisis de marketing",
      "educacion": "Licenciatura en Marketing o afines",
      "jornada": "Tiempo completo",
      "modalidad": "Híbrido",
      "lugar_trabajo": "Chicago, IL",
      "salario_ofrecido": "S/.60.000 - S/.75.000 anuales"
  },
  {
      "empresa": "FinancePro Ltd.",
      "puesto": "Contador Público",
      "descripcion": "Se requiere contador público con experiencia en auditoría y fiscalidad para unirse a nuestro equipo financiero.",
      "experiencia": "4 años como contador público",
      "educacion": "Licenciatura en Contaduría Pública",
      "jornada": "Tiempo completo",
      "modalidad": "Presencial",
      "lugar_trabajo": "Miami, FL",
      "salario_ofrecido": "S/.65.000 - S/.80.000 anuales"
  },
  {
      "empresa": "EduTech Solutions",
      "puesto": "Desarrollador de Contenidos Educativos",
      "descripcion": "Buscamos un desarrollador de contenidos educativos para crear materiales didácticos interactivos.",
      "experiencia": "2 años en desarrollo de contenidos educativos",
      "educacion": "Licenciatura en Educación o afines",
      "jornada": "Medio tiempo",
      "modalidad": "Remoto",
      "lugar_trabajo": "Seattle, WA",
      "salario_ofrecido": "S/.40.000 - S/.50.000 anuales"
  },
  {
      "empresa": "BlueOcean Shipping",
      "puesto": "Gerente de Logística",
      "descripcion": "Estamos buscando un gerente de logística con experiencia en la industria marítima para optimizar nuestras operaciones de envío.",
      "experiencia": "6 años en logística y operaciones",
      "educacion": "Licenciatura en Administración de Empresas, Logística o afines",
      "jornada": "Tiempo completo",
      "modalidad": "Presencial",
      "lugar_trabajo": "Houston, TX",
      "salario_ofrecido": "S/.85.000 - S/.10.,000 anuales"
  },
  {
      "empresa": "Green Energy Solutions",
      "puesto": "Ingeniero de Energiáas Renovables",
      "descripcion": "Estamos buscando un ingeniero con experiencia en energías renovables para liderar proyectos de energía solar y eólica.",
      "experiencia": "5 años en el sector de energías renovables",
      "educacion": "Ingeniería en Energías Renovables o similar",
      "jornada": "Tiempo completo",
      "modalidad": "Presencial",
      "lugar_trabajo": "Austin, TX",
      "salario_ofrecido": "S/.90.000 - S/.11.000 anuales"
  }
]