import configPromise from '@payload-config'
import { getPayload } from 'payload'
import * as OTPAuth from 'otpauth'

export const POST = async (req: Request) => {
  const payload = await getPayload({
    config: configPromise,
  })

  const data = await req.json()
  const { code } = data

  if (!code) {
    throw new Error('Code is required')
  }

  if (code.length !== 6) {
    throw new Error('Invalid code length')
  }

  // const user = await payload.findByID({
  //   collection: 'users',
  //   id: req.user!.id,
  //   depth: 0,
  // })

  const { user } = await payload.auth(req)

  const totp = new OTPAuth.TOTP({
    issuer: 'PayloadCMS TFA',
    label: user?.email,
    algorithm: 'SHA1',
    digits: 6,
    secret: user?.otp!.otpBase32Secret!,
  })

  let delta = totp.validate({ token: code })

  if (delta === null) {
    throw new Error('Invalid code')
  }

  const updatedUser = await payload.update({
    collection: 'users',
    id: user?.id!,
    data: {
      otp: {
        otpVerified: true,
        otpSessionExpires: new Date(Date.now() + 1000 * 60 * 60 * 24).getTime(), // 24hours
      },
    },
  })

  return Response.json(updatedUser.otp)
}
