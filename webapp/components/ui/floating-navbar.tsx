"use client";
import React, { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: React.ReactElement;
  }[];
  className?: string;
}) => {
  const { scrollYProgress } = useScroll();
  const [isScrollable, setIsScrollable] = useState(false);
  const [visible, setVisible] = useState(true);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (!isScrollable) return; // 👈 early exit if not scrollable

    if (typeof current === "number") {
      const direction = current - scrollYProgress.getPrevious()!;
      
      if (direction < 0) {
        setVisible(true); // ✅ Scroll up => Show navbar
      } else {
        setVisible(false); // ⬇️ Scroll down => Hide navbar
      }
    }
  });
  useEffect(() => {
    const scrollable =
      document.body.scrollHeight > window.innerHeight;
    setIsScrollable(scrollable);
  }, []);
  

  return (
    <AnimatePresence mode="wait">
      {visible && ( <motion.div
        initial={{
          opacity: 1,
          y: -100,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          "flex max-w-fit fixed top-10 inset-x-0 mx-auto z-[999999] px-6 py-2 items-center justify-center space-x-4",
          "rounded-full border backdrop-blur-md shadow transition-colors duration-300",
          // 🌗 Background
          "bg-white/70 dark:bg-zinc-900/70",
          // 🧃 Border
          "border-neutral-300 dark:border-white/20",
          // 💡 Shadow glow
          "shadow-[0_0_20px_rgba(0,0,0,0.05)] dark:shadow-[0_0_20px_rgba(0,255,255,0.1)]",
          "hover:shadow-[0_0_35px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_35px_rgba(0,255,255,0.25)]", "hover:transition-shadow hover:duration-300",
          className
        )}
        //  className={cn(
        //   "flex max-w-fit fixed top-10 inset-x-0 mx-auto z-[999999] px-6 py-2 items-center justify-center space-x-4",
        //   "rounded-full border border-white/20 backdrop-blur-md",
        //   "bg-gradient-to-r from-white/10 via-white/5 to-white/10 dark:from-white/10 dark:via-white/5 dark:to-white/10",
        //   "shadow-[0_0_20px_rgba(0,255,255,0.1)] hover:shadow-[0_0_35px_rgba(0,255,255,0.25)]",
        //   "hover:transition-shadow hover:duration-300", // Only transition shadow on hover
        //   className
        // )}
        
        
      >
        {navItems.map((navItem, idx: number) => (
          <Link  prefetch={true}
            key={`link=${idx}`}
            href={navItem.link}
            className={cn(
              "relative flex items-center space-x-1 text-sm",
              "text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white",
              "transition-colors duration-200"
            )}>
            <span className="block sm:hidden">{navItem.icon}</span>
            <span className="hidden sm:block text-sm">{navItem.name}</span>
          </Link>
        ))}

        <Link href="/login">
        <button  className={cn(
              "relative px-4 py-2 rounded-full text-sm font-medium border",
              "text-black dark:text-white",
              "border-neutral-300 dark:border-white/20",
              "hover:bg-black/5 dark:hover:bg-white/10 transition"
            )}>
          <span>Login</span>
          <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent  h-px" />
        </button>
        </Link>
        
      </motion.div>
      )}
      
    </AnimatePresence>
  );
};
