export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // This empty layout will prevent the root layout from being applied
    <>{children}</>
  )
}