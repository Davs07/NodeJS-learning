import crypto from "node:crypto";
import { SALT_ROUNDS } from "./config.js";
import bcrypt from "bcrypt";

import DBLocal from "db-local";

const { Schema } = new DBLocal({ path: "./db" });

const DataCandidato = Schema("CandidatoData", {
  _id: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
  },
  name: {
    type: String,
  },
  surname: {
    type: String,
  },
  dni: {
    type: String,
  },
  email: {
    type: String,
  },
  jobLocation: {
    type: String,
  },
  jobMode: {
    type: String,
  },
  jobSchedule: {
    type: String,
  },
  education: {
    type: String,
  },
  experience: {
    type: String,
  },
  skills: {
    type: Array,
  },
  interests: {
    type: String,
  },
  desiredSalary: {
    type: Number,
  },
});

export class CandidatoDataRepository {
  static async create({
    name,
    userId,
    surname,
    dni,
    email,
    jobLocation,
    jobMode,
    jobSchedule,
    education,
    experience,
    skills,
    interests,
    desiredSalary,
  }) {
    const id = crypto.randomUUID();
    const candidato = DataCandidato.create({
      _id: id,
      userId,
      name,
      surname,
      dni,
      email,
      jobLocation,
      jobMode,
      jobSchedule,
      education,
      experience,
      skills,
      interests,
      desiredSalary,
    }).save();
    return candidato;
  }
  static async update({
    _id,
    name,
    surname,
    dni,
    email,
    jobLocation,
    jobMode,
    jobSchedule,
    education,
    experience,
    skills,
    interests,
    desiredSalary,
  }) {
    const candidato = DataCandidato.findOne({ _id });
    if (!candidato) throw new Error("invalid username");
    candidato.name = name;
    candidato.surname = surname;
    candidato.dni = dni;
    candidato.email = email;
    candidato.jobLocation = jobLocation;
    candidato.jobMode = jobMode;
    candidato.jobSchedule = jobSchedule;
    candidato.education = education;
    candidato.experience = experience;
    candidato.skills = skills;
    candidato.interests = interests;
    candidato.desiredSalary = desiredSalary;
    candidato.save();
    return candidato;
  }
}
