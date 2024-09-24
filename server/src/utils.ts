
import crypto from 'crypto'
import * as jsRsa from 'jsrsasign'

const SECRET_KEY = 'puppies'

export const generateHash = (args: any) => crypto.createHmac("sha256", SECRET_KEY).update(args).digest("hex")
