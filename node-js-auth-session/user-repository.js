import crypto from "node:crypto";
import DBLocal from "db-local";
import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "./config.js";

const { Schema } = new DBLocal({ path: "./db" });

const User = Schema("User", {
  _id: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  /*  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  role: {
    type: String,
    enum: ["admin", "empresa", "camdidato"],
    default: "candidato",
  }, */
});



export class UserRepository {
  static async create({ username, password }) {
    // 1. Validaciones de Username y Password (opcional: usar Zod

    Validation.username(username);

    Validation.password(password);

    // 2. Asegurarme que el Username no existe

    const user = User.findOne({ username });

    if (user) throw new Error("username already exists");

    // 4. Cifrar la contraseña
    const hashedPassword = await bcrypt.hashSync(password, SALT_ROUNDS);

    // 3. Crear el usuario
    const id = crypto.randomUUID();

    User.create({ _id: id, username, password: hashedPassword }).save();

    return id;
  }
  static async login({ username, password }) {
    // 1. Validaciones de Username y Password (opcional: usar Zod
    Validation.username(username);
    Validation.password(password);

    // 2. Validación de Usuario q
    const user = User.findOne({ username });
    if (!user) throw new Error("invalid username");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("invalid password");

    // 3. Devolver el usuario

    return {
      id: user._id,
      username: user.username,
    };
  }
}
class Validation {
  static username(username) {
    if (typeof username !== "string")
      throw new Error("username must be a string");
    if (username.length < 3)
      throw new Error("username must be at least 3 characters");
  }
  static password(password) {
    if (typeof password !== "string")
      throw new Error("password must be a string");
    if (password.length < 8)
      throw new Error("password must be at least 8 characters");
  }
}
