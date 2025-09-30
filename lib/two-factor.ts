import crypto from "crypto"
import { authenticator } from "otplib"

export class TwoFactorAuth {
  static generateSecret(email: string): string {
    return authenticator.generateSecret()
  }

  static generateQRCodeURL(email: string, secret: string): string {
    return authenticator.keyuri(email, "VitaMend", secret)
  }

  static verifyToken(token: string, secret: string): boolean {
    try {
      return authenticator.verify({ token, secret })
    } catch {
      return false
    }
  }

  static generateBackupCodes(): string[] {
    const codes: string[] = []
    for (let i = 0; i < 10; i++) {
      codes.push(crypto.randomBytes(4).toString("hex").toUpperCase())
    }
    return codes
  }
}
