'use client'

import React, { useEffect } from 'react'

import { checkOTPExpiration } from './CheckOTPExpiration'
import './styles.css'

const TFAProvider = (props: { children?: React.ReactNode }) => {
  useEffect(() => {
    console.log('main fta provider')
    const getMe = async () => {
      console.log('main fta provider in get me')
      const res = await fetch(`/api/users/me`, {
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
    }

    getMe()
  }, [])
  return <main>{props.children}</main>
}

export default TFAProvider
