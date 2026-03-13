import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-bold text-lg">Voluntrack Admin</span>
          <nav className="flex gap-6 text-sm">
            <Link href="/admin" className="text-gray-600 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link href="/admin/create-org" className="text-gray-600 hover:text-gray-900 transition-colors">
              Create Org
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
