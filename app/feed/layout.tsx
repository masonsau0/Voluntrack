import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
