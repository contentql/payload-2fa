'use client'

import React, { useState, useEffect } from 'react'

import { TextInput, Button } from '@payloadcms/ui'

import QRCode from 'react-qr-code'
import './styles.css'
import { User } from '@/payload-types'

interface GetOTPResponse {
  otpauth_url: string
  base32Secret: string
}

const getOTP = async (): Promise<GetOTPResponse> => {
  const res = await fetch('/api/tfa/generate', {
    method: 'POST',
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  return res.json()
}

const verifyOTP = async (code: string) => {
  const res = await fetch('/api/tfa/verify', {
    method: 'POST',
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
    credentials: 'include',
  })
  return res.json()
}

const validateOTP = async (code: string) => {
  const res = await fetch('/api/tfa/validate', {
    method: 'POST',
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
    credentials: 'include',
  })
  return res.json()
}

const TFAPage = () => {
  const [code, setCode] = useState('')
  const [optauthUrl, setOtpauthUrl] = useState('')
  const [otpSecret, setOtpSecret] = useState('')
  const [invalidCode, setInvalidCode] = useState(false)
  const [user, setUser] = useState<User>()

  const sendValidate = async () => {
    const res = await validateOTP(code)
    if (!res.error) return (window.location.href = '/admin')
    setInvalidCode(true)
  }

  const sendVerify = async () => {
    const res = await verifyOTP(code)
    if (!res.error) return (window.location.href = '/admin')
    setInvalidCode(true)
  }

  useEffect(() => {
    const getMe = async () => {
      const res = await fetch(`/api/users/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const { user } = await res.json()

      setUser(user)

      if (!user.otp?.otpVerified) {
        getOTP().then((res) => {
          setOtpSecret(res.base32Secret)
          setOtpauthUrl(res.otpauth_url)
        })
      }
    }

    getMe()
  }, [])

  return (
    <div className="wrap">
      <div className="header">
        <div>Hello, {user?.email}</div>
        <a href="/admin/logout">Logout</a>
      </div>
      {user?.otp?.otpVerified ? (
        <div className="input">
          <TextInput
            name={'code'}
            path={'code'}
            label="Code"
            value={code}
            onChange={(e: any) => setCode(e.target.value)}
          />
          <Button onClick={sendValidate}>Confirm</Button>
          {invalidCode && <p>Code is invalid</p>}
        </div>
      ) : (
        <div className="input">
          <QRCode
            value={optauthUrl}
            style={{
              padding: '20px',
              backgroundColor: '#fff',
              margin: '0 auto',
            }}
          />
          {/* <div className="secret">Secret: {otpSecret}</div> */}
          <TextInput
            name={'code'}
            path={'code'}
            value={code}
            placeholder={'012345'}
            onChange={(e: any) => setCode(e.target.value)}
          />
          <Button onClick={sendVerify}>Confirm</Button>
          {invalidCode && <p>Code is invalid</p>}
        </div>
      )}
    </div>
  )
}

export default TFAPage
