import { Repository } from "typeorm";
import { User } from "../entity/User";
import { LimitedUserData, UserData, UserQueryParams } from "../types";
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
    restaurantId,
  }: UserData) {
    const isUserAlreadyExist = await this.userRepository.findOne({
      where: { email: email },
    });
    if (isUserAlreadyExist) {
      throw createHttpError(400, "Email is already exists!");
    }
    if (restaurantId && role !== "manager") {
      throw createHttpError(
        403,
        "Only users with the 'manager' role can be assigned a restaurant.",
      );
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
      restaurant:
        role === "manager" && restaurantId ? { id: restaurantId } : undefined,
    });
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
      },
    });
  }
  async findByEmailWithPass(email: string) {
    return await this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.restaurant", "restaurant")
      .where("user.email = :email", { email })
      .addSelect("user.password") // Explicitly include the password field
      .getOne();
  }

  async findById(id: number) {
    return await this.userRepository.findOne({
      where: {
        id,
      },

      relations: ["restaurant"], // Include the 'restaurant' relation
    });
  }
  async update(userId: number, { firstName, lastName }: LimitedUserData) {
    try {
      return await this.userRepository.update(userId, {
        firstName,
        lastName,
      });
    } catch (err) {
      const error = createHttpError(
        500,
        "Failed to update the user in the database",
      );
      throw error;
    }
  }
  async getAll({ items = 5, page = 1, q, role }: UserQueryParams) {
    const queryBuilder = this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.restaurant", "restaurant") // Join the restaurant relation
      .orderBy("user.createdAt", "DESC"); // Order users by createdAt field

    // Apply search filter if 'q' is provided
    if (q) {
      queryBuilder.andWhere(
        "(user.firstName ILIKE :q OR user.lastName ILIKE :q OR user.email ILIKE :q)",
        { q: `%${q}%` },
      );
    }
    // Apply role filter if 'role' is provided
    if (role) {
      queryBuilder.andWhere("user.role = :role", { role });
    }

    // Apply pagination
    queryBuilder.skip((page - 1) * items).take(items);

    // Execute query and get results
    const [users, total] = await queryBuilder.getManyAndCount();
    return {
      data: users,
      total,
      page,
      items,
    };
  }
  async deleteById(userId: number) {
    return await this.userRepository.delete(userId);
  }
}
