"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { FiMenu, FiX } from "react-icons/fi";
// import { BsSunFill, BsMoonFill } from "react-icons/bs";

// Theme Toggle Hook
// function useTheme() {
//   const [theme, setTheme] = useState<"dark" | "light">("dark");

//   useEffect(() => {
//     const stored = localStorage.getItem("theme") || "dark";
//     setTheme(stored as "dark" | "light");
//     document.documentElement.classList.toggle("light", stored === "light");
//   }, []);

//   const toggleTheme = () => {
//     const newTheme = theme === "dark" ? "light" : "dark";
//     setTheme(newTheme);
//     localStorage.setItem("theme", newTheme);
//     document.documentElement.classList.toggle("light", newTheme === "light");
//   };

//   return { theme, toggleTheme };
// }

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  // const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-[color:var(--bg-dark)/80] backdrop-blur-md py-4 px-6 md:px-10 flex justify-between items-center z-50">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3">
        <div className="relative h-8 w-8">
          <Image
            src="/HubZeroLogoICO.png"
            alt="Hub Zero Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-xl font-bold text-[var(--text)]">HUBZERO</h1>
      </Link>

      {/* Hamburger icon for mobile */}
      <button
        className="md:hidden text-[var(--text)] text-2xl z-50"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Desktop Nav */}
      <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center gap-8">
        <a href="/about" className="text-[var(--text-muted)] hover:text-[var(--text)] transition">ABOUT US</a>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-[var(--text-muted)] hover:text-[var(--text)] transition flex items-center gap-1"
          >
            OUR SERVICES <span className="text-xs">▼</span>
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="absolute left-0 mt-2 w-52 rounded-md shadow-xl overflow-hidden border border-[var(--border-muted)] backdrop-blur-md bg-[rgba(18,18,18,0.95)]"
              >
                <a
                  href="/web-development"
                  className="block px-4 py-2 text-[var(--text-muted)] hover:bg-[var(--bg-light)/60] hover:text-[var(--text)] transition"
                >
                  Web Development
                </a>
                <a
                  href="/ui-ux"
                  className="block px-4 py-2 text-[var(--text-muted)] hover:bg-[var(--bg-light)/60] hover:text-[var(--text)] transition"
                >
                  UI/UX Design
                </a>
                <a
                  href="/branding"
                  className="block px-4 py-2 text-[var(--text-muted)] hover:bg-[var(--bg-light)/60] hover:text-[var(--text)] transition"
                >
                  Branding
                </a>
                <a
                  href="/seo"
                  className="block px-4 py-2 text-[var(--text-muted)] hover:bg-[var(--bg-light)/60] hover:text-[var(--text)] transition"
                >
                  SEO Optimization
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link href="/work" className="text-[var(--text-muted)] hover:text-[var(--text)] transition">
          WORK WITH US
        </Link>
        <Link href="/blog" className="text-[var(--text-muted)] hover:text-[var(--text)] transition">
          BLOG
        </Link>

      </div>

      {/* Right Controls */}
      <div className="hidden md:flex items-center gap-4">
        <a
          href="/contact"
          className="relative items-center text-[var(--text-muted)] hover:text-[var(--text)] transition"
        >
          <span className="before:content-[''] before:w-3 before:h-3 before:rounded-full before:bg-gradient-to-r before:from-[#665DCD] before:to-[#5FA4E6] before:inline-block before:mr-2"></span>
          GET IN TOUCH
        </a>

        {/* Theme Toggle */}
        {/* <button
          onClick={toggleTheme}
          className="text-[var(--text)] text-xl hover:text-[var(--accent)] transition"
          aria-label="Toggle theme"
        >
          {theme === "light" ? <BsMoonFill /> : <BsSunFill />}
        </button> */}
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-0 w-[80vw] bg-[rgba(18,18,18,0.95)] rounded-2xl m-10 mt-0 backdrop-blur-md flex flex-col items-center py-6 gap-6 md:hidden z-40"
          >
            <a href="/about" className="text-[var(--text-muted)] hover:text-[var(--text)] transition">ABOUT US</a>

            <div className="flex flex-col items-center gap-1">
              <span className="text-[var(--text-muted)] text-sm mb-1">OUR SERVICES</span>
              <a href="/web-development" className="text-[var(--text-muted)] hover:text-[var(--text)] transition">Web Development</a>
              <a href="/ui-ux" className="text-[var(--text-muted)] hover:text-[var(--text)] transition">UI/UX Design</a>
              <a href="/branding" className="text-[var(--text-muted)] hover:text-[var(--text)] transition">Branding</a>
              <a href="/seo" className="text-[var(--text-muted)] hover:text-[var(--text)] transition">SEO Optimization</a>
            </div>

            <a href="/contact" className="text-[var(--text-muted)] hover:text-[var(--text)] transition">WORK WITH US</a>
            <a href="#blog" className="text-[var(--text-muted)] hover:text-[var(--text)] transition">BLOG</a>
            <a href="/contact" className="text-[var(--text)] font-medium mt-2">GET IN TOUCH</a>

            {/* Theme Toggle (Mobile)
            <button
              onClick={toggleTheme}
              className="mt-2 text-xl text-[var(--text-muted)] hover:text-[var(--text)] transition"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <BsMoonFill /> : <BsSunFill />}
            </button> */}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
