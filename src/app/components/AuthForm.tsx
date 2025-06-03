'use client'

import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type FormData = {
  email: string
  password: string
}

interface AuthFormProps {
  type: 'login' | 'register'
}

export default function AuthForm({ type }: AuthFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onSubmit = (data: FormData) => {
    setLoading(true)
    console.log(`${type} data:`, data)

    // Mock submit delay
    setTimeout(() => {
      setLoading(false)
      if (type === 'login') {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-sm">
      <h2 className="text-2xl font-bold">{type === 'login' ? 'Login' : 'Register'}</h2>

      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          {...register('email', { required: 'Email is required' })}
          className="w-full border p-2 rounded mt-1"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Password</label>
        <input
          type="password"
          {...register('password', { required: 'Password is required' })}
          className="w-full border p-2 rounded mt-1"
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
      >
        {loading ? 'Please wait...' : type === 'login' ? 'Login' : 'Register'}
      </button>
    </form>
  )
}
