import { Suspense } from 'react'
import { fetchCustomersPages } from '@/app/lib/data'
import { lusitana } from '@/app/ui/fonts'
import Pagination from '@/app/ui/pagination'
import Table from '@/app/ui/customers/table'
import Search from '@/app/ui/search'
import { CustomersTableSkeleton } from '@/app/ui/skeletons'
import { CreateCustomer } from "@/app/ui/customers/buttons";

export default async function CustomersPage({
  searchParams
}: {
  searchParams?: {
    query?: string
    page?: string
  }
}) {
  const query = searchParams?.query || ''
  const currentPage = Number(searchParams?.page) || 1
  const totalPages = await fetchCustomersPages(query)
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Clientes</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Buscar cliente..." />
        <CreateCustomer />
      </div>

      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>

      <Suspense key={query + currentPage} fallback={<CustomersTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
    </div>
  )
}
