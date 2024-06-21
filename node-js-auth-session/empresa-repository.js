import crypto from "node:crypto";
import { SALT_ROUNDS } from "./config.js";
import bcrypt from "bcrypt";
import DBLocal from "db-local";

const { Schema } = new DBLocal({ path: "./db" });

const DataEmpresa = Schema("EmpresaData", {
  _id: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
  },
  companyRuc: {
    type: String,
  },
  companyAddress: {
    type: String,
  },
  companyEmail: {
    type: String,
  },
  companyPhone: {
    type: String,
  },
  companyDescription: {
    type: String,
  },
  companyWebsite: {
    type: String,
  },
  companySize: {
    type: String,
  },
  companyIndustry: {
    type: String,
  },
});

export class EmpresaDataRepository {
  static async create({
    companyName,
    companyRuc,
    companyAddress,
    companyEmail,
    companyPhone,
    companyDescription,
    companyWebsite,
    companySize,
    companyIndustry,
  }) {
    const id = crypto.randomUUID();
    const empresa = DataEmpresa.create({
      _id: id,
      companyName,
      companyRuc,
      companyAddress,
      companyEmail,
      companyPhone,
      companyDescription,
      companyWebsite,
      companySize,
      companyIndustry,
    }).save();
    return empresa;
  }

  static async update({
    _id,
    companyName,
    companyRuc,
    companyAddress,
    companyEmail,
    companyPhone,
    companyDescription,
    companyWebsite,
    companySize,
    companyIndustry,
  }) {
    const empresa = DataEmpresa.findOne({ _id });
    if (!empresa) throw new Error("Empresa no encontrada");
    empresa.companyName = companyName;
    empresa.companyRuc = companyRuc;
    empresa.companyAddress = companyAddress;
    empresa.companyEmail = companyEmail;
    empresa.companyPhone = companyPhone;
    empresa.companyDescription = companyDescription;
    empresa.companyWebsite = companyWebsite;
    empresa.companySize = companySize;
    empresa.companyIndustry = companyIndustry;
    empresa.save();
    return empresa;
  }
}
