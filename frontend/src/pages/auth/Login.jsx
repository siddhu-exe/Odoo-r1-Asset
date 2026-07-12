import { useNavigate, Link } from 'react-router-dom'

import { toast } from 'sonner'
import { Mail, Lock, Loader } from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import { useForm } from '../../hooks/useForm'
import { validateEmail } from '../../utils/helpers'

export default function Login() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuth()

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
        const detail = error?.response?.data?.detail
        if (typeof detail === 'string') {
          toast.error(detail)
        } else {
          toast.error('Login failed. Please try again.')
        }
      }
    }
  )

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSubmit(e)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-bg-secondary to-background flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-10">
          <img
            src="/WhatsApp Image 2026-07-12 at 2.28.52 PM.jpeg"
            alt="AssetOps Logo"
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg shadow-primary/30 object-cover"
          />
          <h1 className="text-4xl font-bold text-foreground mb-2 text-gradient">AssetOps</h1>
          <p className="text-text-secondary">Enterprise Asset Management</p>
        </div>

        <div className="bg-bg-secondary/50 backdrop-blur-xl border border-border-color rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">Welcome Back</h2>

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

          <div className="mb-2">
            <label className="label-base">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-text-secondary" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyPress={handleKeyPress}
                className="input-base pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-text-secondary hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {touched.password && errors.password && (
              <p className="text-danger text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div className="text-right mb-6">
            <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-dark transition-colors">
              Forgot password?
            </Link>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading}
            className="btn-primary w-full mb-6 flex items-center justify-center gap-2"
          >
            {isSubmitting || isLoading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <p className="text-center text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-primary hover:text-primary-dark font-semibold transition-colors">
              Create Account
            </Link>
          </p>
        </div>

        <div className="text-center mt-8">
          <p className="text-xs text-text-secondary/60">
            Admin: <strong>admin@assetflow.com</strong> / Admin@1234
          </p>
        </div>
      </div>
    </div>
  )
}
