import * as bcrypt from 'bcrypt'

export class PasswordHasher {
  private static readonly SALT_ROUNDS = 10

  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, PasswordHasher.SALT_ROUNDS)
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash)
  }
}
