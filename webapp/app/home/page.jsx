"use client"
import React, { useEffect } from 'react'
import SignupFormDemo from "@/components/signup-form-demo"
import {BackgroundBeams} from "@/components/ui/background-beams"
import LampDemo from "@/components/ui/lamp"

const LandingPage = () => {


  return (
    <div className='flex]'>
        <div className='absolute inset-0 z-0'>
        <LampDemo />
        </div>
          <div className='flex w-screen items-center  justify-center'>
        <div className=' w-3/5 '>
        {/* <BackgroundBeams/> */}
        </div>

        {/* <SignupFormDemo className="z-10"/> */}
      </div>
    
    </div>
  
  )
}

export default LandingPage