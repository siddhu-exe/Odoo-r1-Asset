import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useForm } from '../../hooks/useForm'
import { validateEmail } from '../../utils/helpers'
import { User, Mail, Lock, Github, Chrome, Loader } from 'lucide-react'
import { toast } from 'sonner'

export default function Signup() {
  const navigate = useNavigate()
  const { signup, oauthLogin, isLoading } = useAuth()

  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, setFieldError } = useForm(
    { name: '', email: '', password: '', confirmPassword: '' },
    async (formValues) => {
      if (!formValues.name.trim()) {
        setFieldError('name', 'Name is required')
        return
      }
      if (!validateEmail(formValues.email)) {
        setFieldError('email', 'Invalid email address')
        return
      }
      if (formValues.password.length < 6) {
        setFieldError('password', 'Password must be at least 6 characters')
        return
      }
      if (formValues.password !== formValues.confirmPassword) {
        setFieldError('confirmPassword', 'Passwords do not match')
        return
      }

      try {
        await signup(formValues.email, formValues.password, formValues.name)
        toast.success('Account created successfully!')
        navigate('/dashboard')
      } catch (error) {
        toast.error('Signup failed. Please try again.')
      }
    }
  )

  const handleOAuthSignup = async (provider) => {
    try {
      await oauthLogin(provider)
      toast.success(`Account created with ${provider}!`)
      navigate('/dashboard')
    } catch (error) {
      toast.error(`${provider} signup failed`)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSubmit(e)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-bg-secondary to-background flex items-center justify-center px-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <img
            src="/WhatsApp Image 2026-07-12 at 2.28.52 PM.jpeg"
            alt="AssetOps Logo"
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg shadow-primary/30 object-cover"
          />
          <h1 className="text-4xl font-bold text-foreground mb-2 text-gradient">AssetOps</h1>
          <p className="text-text-secondary">Join our platform</p>
        </div>

        {/* Signup Card */}
        <div className="bg-bg-secondary/50 backdrop-blur-xl border border-border-color rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">Create Account</h2>

          {/* Name Input */}
          <div className="mb-5">
            <label className="label-base">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-text-secondary" size={20} />
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyPress={handleKeyPress}
                className="input-base pl-10"
              />
            </div>
            {touched.name && errors.name && (
              <p className="text-danger text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email Input */}
          <div className="mb-5">
            <label className="label-base">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-text-secondary" size={20} />
              <input
                type="email"
                name="email"
                placeholder="name@company.com"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyPress={handleKeyPress}
                className="input-base pl-10"
              />
            </div>
            {touched.email && errors.email && (
              <p className="text-danger text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="mb-5">
            <label className="label-base">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-text-secondary" size={20} />
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyPress={handleKeyPress}
                className="input-base pl-10"
              />
            </div>
            {touched.password && errors.password && (
              <p className="text-danger text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="mb-6">
            <label className="label-base">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-text-secondary" size={20} />
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyPress={handleKeyPress}
                className="input-base pl-10"
              />
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-danger text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Signup Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading}
            className="btn-primary w-full mb-4 flex items-center justify-center gap-2"
          >
            {isSubmitting || isLoading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-color"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-bg-secondary text-text-secondary">Or sign up with</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => handleOAuthSignup('github')}
              disabled={isLoading}
              className="btn-secondary flex items-center justify-center gap-2 text-sm"
            >
              <Github size={18} />
              GitHub
            </button>
            <button
              onClick={() => handleOAuthSignup('google')}
              disabled={isLoading}
              className="btn-secondary flex items-center justify-center gap-2 text-sm"
            >
              <Chrome size={18} />
              Google
            </button>
          </div>

          {/* Login Link */}
          <p className="text-center text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-dark font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-xs text-text-secondary/60">
            Demo: Create with any email and password
          </p>
        </div>
      </div>
    </div>
  )
}
