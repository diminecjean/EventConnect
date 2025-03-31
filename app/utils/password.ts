"use server";

/**
 *
 * @param password
 * @returns hashed password
 * @description Hashes the password using bcrypt, using 10 salt rounds
 * Customize hashing configurations here
 */
export async function hashPassword(password: string) {
  const bcrypt = require("bcrypt");
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

export async function passwordMatch(password: any, hashedPassword: string) {
  const bcrypt = require("bcrypt");
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
}
