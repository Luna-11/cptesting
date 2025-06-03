import AuthForm from '@/app/components/AuthForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <AuthForm type="login" />
    </div>
  )
}
