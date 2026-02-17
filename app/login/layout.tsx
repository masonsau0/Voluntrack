import RedirectIfAuthenticated from "@/components/auth/RedirectIfAuthenticated"

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RedirectIfAuthenticated>{children}</RedirectIfAuthenticated>
}
