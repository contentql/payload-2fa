import { checkOTPExpiration } from './CheckOTPExpiration'
import './styles.css'

const TFAProvider = async (props: { children?: React.ReactNode }) => {
  const res = await fetch(`${process.env.PAYLOAD_URL}/api/users/me`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const { user } = await res.json()

  if (user && window.location.pathname !== '/admin/tfa') {
    console.log(user, 'from tfa')
    if (
      !user.otp?.otpVerified ||
      !user.otp.otpSessionExpires ||
      !checkOTPExpiration(user.otp.otpSessionExpires)
    ) {
      window.location.href = '/admin/tfa'
    }
  }
  return <main>{props.children}</main>
}

export default TFAProvider
