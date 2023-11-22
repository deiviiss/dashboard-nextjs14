import { notFound } from 'next/navigation'
import { fetchCustomerById } from '@/app/lib/data'
import Breadcrumbs from '@/app/ui/breadcrumbs'
import Form from '@/app/ui/customers/edit-form'

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id
  const [customer] = await Promise.all([
    fetchCustomerById(id),
  ])

  if (customer == null) {
    notFound()
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Clientes', href: '/dashboard/customers' },
          {
            label: 'Editar cliente',
            href: `/dashboard/customers/${id}/edit`,
            active: true
          }
        ]}
      />
      <Form customer={customer} />
    </main>
  )
}
