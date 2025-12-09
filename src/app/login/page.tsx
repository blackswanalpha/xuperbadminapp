'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Users, Truck, Star, Sparkles, Zap } from 'lucide-react'
import Image from 'next/image'
import LoginForm from '@/components/login-form'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

const floatingAnimation = {
  y: [-10, 10, -10],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut" as const
  }
}

const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut" as const
  }
}

const sparkleAnimation = {
  opacity: [0, 1, 0],
  scale: [0, 1, 0],
  rotate: [0, 180, 360],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut" as const,
    delay: Math.random() * 2
  }
}

export default function LoginPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        router.push('/admin')
      } else if (user.role === 'SUPERVISOR') {
        router.push('/supervisor')
      } else {
        router.push('/admin') // Default fallback
      }
    }
  }, [isAuthenticated, isLoading, user, router])

  // Enhanced loading animation
  if (isLoading) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="text-center">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-600 font-medium"
          >
            Loading Xuperb...
          </motion.p>
        </div>
      </motion.div>
    )
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null
  }

  return (
    <motion.div 
      className="min-h-screen flex relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Floating Background Elements */}
      <motion.div
        className="absolute top-20 left-20 text-blue-200"
        animate={sparkleAnimation}
      >
        <Sparkles className="h-6 w-6" />
      </motion.div>
      <motion.div
        className="absolute top-40 right-32 text-indigo-200"
        animate={{
          ...sparkleAnimation,
          transition: { ...sparkleAnimation.transition, delay: 0.5 }
        }}
      >
        <Star className="h-4 w-4" />
      </motion.div>
      <motion.div
        className="absolute bottom-32 left-16 text-purple-200"
        animate={{
          ...sparkleAnimation,
          transition: { ...sparkleAnimation.transition, delay: 1 }
        }}
      >
        <Zap className="h-5 w-5" />
      </motion.div>

      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-20 xl:px-24 relative">
        <motion.div 
          className="mx-auto w-full max-w-sm lg:w-96"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <div className="text-center">
              <motion.div
                className="flex justify-center"
                animate={pulseAnimation}
              >
                <motion.div 
                  className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mb-6 shadow-lg overflow-hidden"
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: 5,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Image
                    src="/logo.jpg"
                    alt="Xuperb Logo"
                    width={56}
                    height={56}
                    className="rounded-lg object-contain"
                    priority
                  />
                </motion.div>
              </motion.div>
              
              <motion.h2 
                className="text-3xl font-bold tracking-tight text-gray-900"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Welcome Back
              </motion.h2>
              
              <motion.p 
                className="mt-2 text-sm text-gray-600"
                variants={itemVariants}
              >
                Sign in to your Xuperb admin account
              </motion.p>
            </div>

            <motion.div 
              className="mt-8"
              variants={itemVariants}
            >
              <LoginForm />
            </motion.div>

            <motion.div 
              className="mt-6"
              variants={itemVariants}
            >
              <div className="relative">
                <motion.div 
                  className="absolute inset-0 flex items-center"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  <div className="w-full border-t border-gray-300" />
                </motion.div>
                <div className="relative flex justify-center text-sm">
                  <motion.span 
                    className="bg-white px-2 text-gray-500"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                  >
                    Need help?
                  </motion.span>
                </div>
              </div>
              <motion.div 
                className="mt-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                <p className="text-xs text-gray-500">
                  Contact your system administrator for support
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Feature Showcase */}
      <div className="hidden lg:flex lg:flex-1 lg:relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
        {/* Floating Elements on Right Side */}
        <motion.div
          className="absolute top-16 right-16 text-white/20"
          animate={floatingAnimation}
        >
          <Truck className="h-8 w-8" />
        </motion.div>
        <motion.div
          className="absolute top-1/3 right-8 text-white/15"
          animate={{
            ...floatingAnimation,
            transition: { ...floatingAnimation.transition, delay: 1 }
          }}
        >
          <Users className="h-6 w-6" />
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-20 text-white/10"
          animate={{
            ...floatingAnimation,
            transition: { ...floatingAnimation.transition, delay: 2 }
          }}
        >
          <Shield className="h-7 w-7" />
        </motion.div>

        <div className="relative z-10 flex flex-col justify-center px-12 py-12 text-white">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 
              className="text-4xl font-bold leading-tight mb-8"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Fleet Management
              </motion.span>
              <br />
              <motion.span 
                className="text-blue-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                Made Simple
              </motion.span>
            </motion.h1>
            
            <motion.div 
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                variants={itemVariants}
                className="flex items-center space-x-4 group cursor-pointer"
                whileHover={{ 
                  x: 10,
                  transition: { type: "spring", stiffness: 300 }
                }}
              >
                <motion.div 
                  className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center"
                  whileHover={{ 
                    scale: 1.1, 
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                    rotate: 5
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Truck className="h-6 w-6" />
                </motion.div>
                <div>
                  <h3 className="font-semibold group-hover:text-blue-200 transition-colors">Vehicle Management</h3>
                  <p className="text-blue-100 text-sm">Track and manage your entire fleet efficiently</p>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex items-center space-x-4 group cursor-pointer"
                whileHover={{ 
                  x: 10,
                  transition: { type: "spring", stiffness: 300 }
                }}
              >
                <motion.div 
                  className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center"
                  whileHover={{ 
                    scale: 1.1, 
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                    rotate: -5
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Users className="h-6 w-6" />
                </motion.div>
                <div>
                  <h3 className="font-semibold group-hover:text-blue-200 transition-colors">User Management</h3>
                  <p className="text-blue-100 text-sm">Control access and manage team permissions</p>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex items-center space-x-4 group cursor-pointer"
                whileHover={{ 
                  x: 10,
                  transition: { type: "spring", stiffness: 300 }
                }}
              >
                <motion.div 
                  className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center"
                  whileHover={{ 
                    scale: 1.1, 
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                    rotate: 5
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Shield className="h-6 w-6" />
                </motion.div>
                <div>
                  <h3 className="font-semibold group-hover:text-blue-200 transition-colors">Secure Platform</h3>
                  <p className="text-blue-100 text-sm">Enterprise-grade security for your data</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Background Image with Animation */}
        <motion.div 
          className="absolute inset-0 opacity-20"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10 }}
        >
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')"
            }}
          />
        </motion.div>
        
        {/* Animated Overlay Pattern */}
        <motion.div 
          className="absolute inset-0 opacity-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ delay: 1, duration: 2 }}
        >
          <motion.svg 
            className="w-full h-full" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            <defs>
              <pattern id="pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="2" fill="white" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#pattern)" />
          </motion.svg>
        </motion.div>
      </div>
    </motion.div>
  )
}