"use client"
import React, { useEffect } from 'react'
import SignupFormDemo from "@/components/signup-form-demo"
import { BackgroundBeams } from "@/components/ui/background-beams"
import LampDemo from "@/components/ui/lamp"
import { FloatingNav } from "../../components/ui/floating-navbar";
import { Home, Info, Phone } from "lucide-react";

const LandingPage = () => {

  const navItems = [
    {
      name: "Home",
      link: "/home",
      icon: <Home size={16} />, // ✅ Now it's a JSX.Element
    },
    {
      name: "About",
      link: "/about",
      icon: <Info size={16} />,
    },
    {
      name: "Contact",
      link: "/contact",
      icon: <Phone size={16} />,
    },
  ];
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
      <FloatingNav navItems={navItems} />

    </div>

  )
}

export default LandingPage