import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useForm } from '../../hooks/useForm'
import { validateEmail } from '../../utils/helpers'
import { Mail, Lock, Github, Chrome, Loader } from 'lucide-react'
import { toast } from 'sonner'

export default function Login() {
  const navigate = useNavigate()
  const { login, oauthLogin, isLoading } = useAuth()

  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, setFieldError } = useForm(
    { email: '', password: '' },
    async (formValues) => {
      if (!validateEmail(formValues.email)) {
        setFieldError('email', 'Invalid email address')
        return
      }
      if (!formValues.password) {
        setFieldError('password', 'Password is required')
        return
      }

      try {
        await login(formValues.email, formValues.password)
        toast.success('Login successful!')
        navigate('/dashboard')
      } catch (error) {
        toast.error('Login failed. Please try again.')
      }
    }
  )

  const handleOAuthLogin = async (provider) => {
    try {
      await oauthLogin(provider)
      toast.success(`Logged in with ${provider}!`)
      navigate('/dashboard')
    } catch (error) {
      toast.error(`${provider} login failed`)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSubmit(e)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-bg-secondary to-background flex items-center justify-center px-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl mb-4 shadow-lg shadow-primary/30">
            <span className="text-2xl font-bold text-background">AF</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2 text-gradient">AssetFlow</h1>
          <p className="text-text-secondary">Enterprise Asset Management</p>
        </div>

        {/* Login Card */}
        <div className="bg-bg-secondary/50 backdrop-blur-xl border border-border-color rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">Welcome Back</h2>

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
          <div className="mb-2">
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

          {/* Forgot Password */}
          <div className="text-right mb-6">
            <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-dark transition-colors">
              Forgot password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading}
            className="btn-primary w-full mb-4 flex items-center justify-center gap-2"
          >
            {isSubmitting || isLoading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Logging in...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-color"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-bg-secondary text-text-secondary">Or continue with</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => handleOAuthLogin('github')}
              disabled={isLoading}
              className="btn-secondary flex items-center justify-center gap-2 text-sm"
            >
              <Github size={18} />
              GitHub
            </button>
            <button
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading}
              className="btn-secondary flex items-center justify-center gap-2 text-sm"
            >
              <Chrome size={18} />
              Google
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-primary hover:text-primary-dark font-semibold transition-colors">
              Create Account
            </Link>
          </p>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-xs text-text-secondary/60">
            Demo: Use any email with password
          </p>
        </div>
      </div>
    </div>
  )
}
