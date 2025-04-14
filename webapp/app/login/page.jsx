"use client"
import React, { useEffect } from 'react'
import SignupFormDemo from "@/components/signup-form-demo"
import {BackgroundBeams} from "@/components/ui/background-beams"
import LampDemo from "@/components/ui/lamp"

const loginSignup = () => {

    // Put this in a client component
useEffect(() => {
    if (localStorage.theme === 'dark' || 
       (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return (
    <div>
        <div className='absolute inset-0 z-0'>
        <LampDemo />

        </div>
          <div className='flex w-screen items-center bg-black justify-center'>
        <div className=' w-3/5  min-h-screen'>
        <BackgroundBeams/>
        </div>

        <SignupFormDemo className="z-10"/>
    </div>
    
    </div>
  
  )
}

export default loginSignup