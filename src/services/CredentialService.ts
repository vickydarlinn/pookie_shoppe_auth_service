import bcrypt from "bcrypt";
export class CredentialService {
  async comparePassword(userPassword: string, dbStorePassword: string) {
    return await bcrypt.compare(userPassword, dbStorePassword);
  }
}
