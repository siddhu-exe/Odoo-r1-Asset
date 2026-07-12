import { useNavigate, Link } from 'react-router-dom'

import { toast } from 'sonner'
import { User, Mail, Lock, Loader, Phone } from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import { useForm } from '../../hooks/useForm'
import { validateEmail } from '../../utils/helpers'

export default function Signup() {
  const navigate = useNavigate()
  const { signup, isLoading } = useAuth()

  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, setFieldError } = useForm(
    { firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '' },
    async (formValues) => {
      if (!formValues.firstName.trim()) {
        setFieldError('firstName', 'First name is required')
        return
      }
      if (!formValues.lastName.trim()) {
        setFieldError('lastName', 'Last name is required')
        return
      }
      if (!validateEmail(formValues.email)) {
        setFieldError('email', 'Invalid email address')
        return
      }
      if (formValues.password.length < 8) {
        setFieldError('password', 'Password must be at least 8 characters')
        return
      }
      if (formValues.password !== formValues.confirmPassword) {
        setFieldError('confirmPassword', 'Passwords do not match')
        return
      }

      try {
        await signup(
          formValues.firstName.trim(),
          formValues.lastName.trim(),
          formValues.email,
          formValues.password,
          formValues.phone.trim() || undefined
        )
        toast.success('Account created successfully!')
        navigate('/dashboard')
      } catch (error) {
        const detail = error?.response?.data?.detail
        if (typeof detail === 'string') {
          toast.error(detail)
        } else {
          toast.error('Signup failed. Please try again.')
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
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl mb-4 shadow-lg shadow-primary/30">
            <span className="text-2xl font-bold text-background">AF</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2 text-gradient">AssetFlow</h1>
          <p className="text-text-secondary">Join your organisation</p>
        </div>

        <div className="bg-bg-secondary/50 backdrop-blur-xl border border-border-color rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">Create Account</h2>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="label-base">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-text-secondary" size={20} />
                <input
                  type="text"
                  name="firstName"
                  placeholder="Priya"
                  value={values.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyPress={handleKeyPress}
                  className="input-base pl-10"
                />
              </div>
              {touched.firstName && errors.firstName && (
                <p className="text-danger text-sm mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="label-base">Last Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-text-secondary" size={20} />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Sharma"
                  value={values.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyPress={handleKeyPress}
                  className="input-base pl-10"
                />
              </div>
              {touched.lastName && errors.lastName && (
                <p className="text-danger text-sm mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="mb-5">
            <label className="label-base">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-text-secondary" size={20} />
              <input
                type="email"
                name="email"
                placeholder="priya@company.com"
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

          <div className="mb-5">
            <label className="label-base">Phone (optional)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 text-text-secondary" size={20} />
              <input
                type="tel"
                name="phone"
                placeholder="+91-9876543210"
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyPress={handleKeyPress}
                className="input-base pl-10"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="label-base">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-text-secondary" size={20} />
              <input
                type="password"
                name="password"
                placeholder="Min. 8 characters"
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

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading}
            className="btn-primary w-full mb-6 flex items-center justify-center gap-2"
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

          <p className="text-center text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-dark font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>

        <div className="text-center mt-8">
          <p className="text-xs text-text-secondary/60">
            New accounts are assigned the <strong>employee</strong> role by default.
          </p>
        </div>
      </div>
    </div>
  )
}
