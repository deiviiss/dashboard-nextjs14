import { fetchCustomers } from '@/app/lib/data'
import Breadcrumbs from '@/app/ui/breadcrumbs'
import Form from '@/app/ui/customers/create-form'

export default async function Page() {
  const customers = await fetchCustomers()

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Clientes', href: '/dashboard/customers' },
          {
            label: 'Crear Cliente',
            href: '/dashboard/customers/create',
            active: true
          }
        ]}
      />
      <Form />
    </main>
  )
}
