import configPromise from '@payload-config'
import { getPayload } from 'payload'
import crypto from 'crypto'
import { encode } from 'hi-base32'
import * as OTPAuth from 'otpauth'

const generateRandomBase32 = () => {
  const buffer = crypto.randomBytes(15)
  const base32 = encode(buffer).replace(/=/g, '').substring(0, 24)
  return base32
}

export const POST = async (req: any, res: any) => {
  console.log('generated here')
  const payload = await getPayload({
    config: configPromise,
  })

  const { user } = await payload.auth(req)
  console.log(user)

  // const user = await payload.findByID({
  //   collection: 'users',
  //   id: req.user!.id,
  //   depth: 0,
  // })

  if (!user) {
    throw new Error('User not found')
  }

  if (user.otp!.otpVerified) {
    throw new Error('OTP already verified')
  }

  const base32Secret = generateRandomBase32()

  const totp = new OTPAuth.TOTP({
    issuer: 'PayloadCMS TFA',
    label: user.email,
    algorithm: 'SHA1',
    digits: 6,
    secret: base32Secret,
  })

  const otpauth_url = totp.toString()

  await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      otp: {
        otpBase32Secret: base32Secret,
        otpauthUrl: otpauth_url,
      },
    },
  })

  return Response.json({
    otpauth_url,
    base32Secret,
  })
}
