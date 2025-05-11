import React, { useState, useEffect } from 'react'
import { Container, Logo, LogoutBtn } from '../index'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/Logo2.png';
import { motion, AnimatePresence } from 'framer-motion';

function Header() {
  const user = useSelector(state => state.auth.status)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', slug: '/', active: true },
    { name: "Login", slug: '/login', active: !user },
    { name: "Signup", slug: '/signup', active: !user },
    { name: "All Posts", slug: '/all-posts', active: user },
    { name: "Add Post", slug: '/add-post', active: user },
  ]
  
  const handleNavigation = (slug) => {
    navigate(slug);
    setIsMobileMenuOpen(false);
  }
  
  const sidebarVariants = {
    closed: {
      x: "100%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    },
    open: {
      x: "0%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  // Sidebar item animation variants
  const itemVariants = {
    closed: { x: 20, opacity: 0 },
    open: { x: 0, opacity: 1 }
  };

  // Hamburger button animation variants
  const topLineVariants = {
    closed: { rotate: 0, translateY: 0 },
    open: { rotate: 45, translateY: 8 }
  };
  
  const middleLineVariants = {
    closed: { opacity: 1 },
    open: { opacity: 0 }
  };
  
  const bottomLineVariants = {
    closed: { rotate: 0, translateY: 0 },
    open: { rotate: -45, translateY: -8 }
  };

  return (
    <header className='py-2 shadow bg-transparent backdrop-blur-sm fixed w-full z-10'>
      <Container>
        <nav className='flex items-center justify-between'>
          <div className='mr-4'>
            <Link to='/'>
              <img src={logo} alt="Logo" width="55px" />
            </Link>
          </div>
          
          {/* Desktop Navigation - Hidden on mobile */}
          <ul className='hidden md:flex ml-auto my-1'>
            {navItems.map((item) =>
              item.active ? (
                <li key={item.name}>
                  <button
                    onClick={() => navigate(item.slug)}
                    className='inline-block px-6 py-2 rounded-full 
                    text-black text-2xl font-bold font-serif tracking-wide'
                  >{item.name}</button>
                </li>
              ) : null
            )}
            {user && (
              <li>
                <LogoutBtn />
              </li>
            )}
          </ul>
          
          {/* Mobile Menu Button - Only visible on mobile */}
          <motion.button
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-md"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            initial="closed"
            animate={isMobileMenuOpen ? "open" : "closed"}
          >
            <motion.span
              className="w-6 h-0.5 bg-black mb-1.5 block"
              variants={topLineVariants}
            />
            <motion.span
              className="w-6 h-0.5 bg-black mb-1.5 block"
              variants={middleLineVariants}
            />
            <motion.span
              className="w-6 h-0.5 bg-black block"
              variants={bottomLineVariants}
            />
          </motion.button>
        </nav>
      </Container>
      
      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-20 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sidebar - Solid white background for mobile only */}
            <motion.div
              className="fixed top-0 right-0 bottom-0 w-[250px] bg-white z-30 shadow-xl p-5 h-full min-h-screen overflow-y-auto md:hidden"
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className="flex justify-end items-center mb-8">
                {/* Logo removed as requested */}
                <motion.button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2"
                  whileTap={{ scale: 0.9 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </motion.button>
              </div>

              <ul className="flex flex-col space-y-4">
                {navItems.map((item) =>
                  item.active ? (
                    <motion.li key={item.name} variants={itemVariants}>
                      <motion.button
                        onClick={() => handleNavigation(item.slug)}
                        className='w-full text-left px-6 py-2 rounded-lg text-black text-2xl font-bold font-serif tracking-wide hover:bg-gray-100'
                      >
                        {item.name}
                      </motion.button>
                    </motion.li>
                  ) : null
                )}
                {user && (
                  <motion.li variants={itemVariants}>
                    <div onClick={() => setIsMobileMenuOpen(false)}>
                      <LogoutBtn className="w-full text-left px-4 py-3" />
                    </div>
                  </motion.li>
                )}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Header
