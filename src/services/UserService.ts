import { Repository } from "typeorm";
import { User } from "../entity/User";
import { LimitedUserData, UserData } from "../types";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";

export class UserService {
  constructor(private userRepository: Repository<User>) {}
  async create({
    firstName,
    lastName,
    email,
    password,
    role,
    tenantId,
  }: UserData) {
    // const userRepository = AppDataSource.getRepository(User);
    // checking email is this exist in db or not?
    const isUserAlreadyExist = await this.userRepository.findOne({
      where: { email: email },
    });

    if (isUserAlreadyExist) {
      throw createHttpError(400, "Email is already exists!");
    }
    // hash the password
    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(password, saltRound);
    return await this.userRepository.save({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      tenant: tenantId ? { id: tenantId } : undefined,
    });
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
      },
    });
  }
  async findById(id: number) {
    return await this.userRepository.findOne({
      where: {
        id,
      },
    });
  }
  async update(userId: number, { firstName, lastName, role }: LimitedUserData) {
    try {
      return await this.userRepository.update(userId, {
        firstName,
        lastName,
        role,
      });
    } catch (err) {
      const error = createHttpError(
        500,
        "Failed to update the user in the database",
      );
      throw error;
    }
  }
  async getAll() {
    return await this.userRepository.find();
  }
  async deleteById(userId: number) {
    return await this.userRepository.delete(userId);
  }
}
