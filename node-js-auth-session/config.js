export const {
  PORT = 3001,
  SALT_ROUNDS = 10,
  SECRET_JWT_KEY = "this-is-an-awesome-key",
  ALLOWED_ORIGINS = ["http://localhost:3001", "http://localhost:3000"],
} = process.env;
