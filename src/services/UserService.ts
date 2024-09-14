import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserData } from "../types";
import createHttpError from "http-errors";
import { Roles } from "../constants";
import bcrypt from "bcrypt";

export class UserService {
  constructor(private userRepository: Repository<User>) {}
  async create({ firstName, lastName, email, password }: UserData) {
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
      role: Roles.CUSTOMER,
    });
  }
}
