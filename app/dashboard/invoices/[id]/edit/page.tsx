import { notFound } from 'next/navigation'
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data'
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs'
import Form from '@/app/ui/invoices/edit-form'

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id
  const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers()
  ])

  if (invoice == null) {
    notFound()
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Facturas', href: '/dashboard/invoices' },
          {
            label: 'Editar factura',
            href: `/dashboard/invoices/${id}/edit`,
            active: true
          }
        ]}
      />
      <Form invoice={invoice} customers={customers} />
    </main>
  )
}
