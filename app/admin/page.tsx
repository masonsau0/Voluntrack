import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Create Organization</CardTitle>
            <CardDescription>
              Provision a new volunteer organization account and send them a password reset link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/create-org">
              <Button className="w-full">Create Org Account</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
