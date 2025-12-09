'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, LogIn } from 'lucide-react'
import { loginSchema, type LoginFormData } from '@/lib/validations'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'

interface LoginFormProps {
  onSubmit?: (data: LoginFormData) => void
  isLoading?: boolean
}

export default function LoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  })

  const handleFormSubmit = async (data: LoginFormData) => {
    try {
      setLoginError('')
      if (onSubmit) {
        onSubmit(data)
      } else {
        await login(data.email, data.password, data.rememberMe || false)
      }
    } catch (error) {
      setLoginError('Invalid email or password. Please try again.')
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6"
    >
      {/* Login Error */}
      {loginError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-sm text-red-600">{loginError}</p>
        </motion.div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            {...register('email')}
            type="email"
            id="email"
            placeholder="Enter your email"
            className={cn(
              "w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all",
              errors.email ? "border-red-500" : "border-gray-300"
            )}
          />
        </div>
        {errors.email && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-1 text-sm text-red-600"
          >
            {errors.email.message}
          </motion.p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            id="password"
            placeholder="Enter your password"
            className={cn(
              "w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all",
              errors.password ? "border-red-500" : "border-gray-300"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-1 text-sm text-red-600"
          >
            {errors.password.message}
          </motion.p>
        )}
      </div>

      {/* Remember Me Checkbox */}
      <motion.div
        className="flex items-center space-x-2"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <input
            {...register('rememberMe')}
            type="checkbox"
            id="rememberMe"
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
          />
        </motion.div>
        <motion.label
          htmlFor="rememberMe"
          className="text-sm text-gray-700 cursor-pointer select-none"
          whileHover={{ color: "#1d4ed8" }}
          transition={{ duration: 0.2 }}
        >
          Remember me for 30 days
        </motion.label>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isSubmitting || isLoading}
        className={cn(
          "w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2",
          isSubmitting || isLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
        )}
      >
        {isSubmitting || isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full"
          />
        ) : (
          <>
            <LogIn className="h-5 w-5" />
            Sign In
          </>
        )}
      </motion.button>

      <div className="text-center">
        <a
          href="#"
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          Forgot your password?
        </a>
      </div>
    </motion.form>
  )
}