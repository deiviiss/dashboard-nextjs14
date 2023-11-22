import { sql } from '@vercel/postgres'
import { prisma } from "@/app/lib/prisma";
import { unstable_noStore as noStore } from 'next/cache'
import {
  type CustomerField,
  type InvoiceForm,
  type InvoicesTable,
  type LatestInvoiceRaw,
  type User,
  type Revenue
} from './definitions'
import { formatCurrency } from './utils'

const ITEMS_PER_PAGE = 6

export async function fetchRevenue() {
  noStore()
  try {
    // Artificially delay a reponse for demo purposes.
    // Don't do this in real life :)
    // console.log('Fetching revenue data...')
    // await new Promise((resolve) => setTimeout(resolve, 5000))

    const data = await sql<Revenue>`SELECT * FROM revenue`
    // console.log('Data fetch complete after 3 seconds.')

    return data.rows
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch revenue data.')
  }
}

export async function fetchLatestInvoices() {
  noStore()
  try {

    const data = await sql<LatestInvoiceRaw>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`

    const latestInvoices = data.rows.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount)
    }))
    return latestInvoices
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch the latest invoices.')
  }
}

export async function fetchCardData() {
  noStore()
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise
    ])

    const numberOfInvoices = Number(data[0].rows[0].count ?? '0')
    const numberOfCustomers = Number(data[1].rows[0].count ?? '0')
    const totalPaidInvoices = formatCurrency(data[2].rows[0].paid ?? '0')
    const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? '0')

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices
    }
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to card data.')
  }
}

export async function fetchFilteredInvoices(
  query: string,
  currentPage: number
) {
  noStore()
  const offset = (currentPage - 1) * ITEMS_PER_PAGE

  try {
    const invoices = await sql<InvoicesTable>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `

    return invoices.rows
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch invoices.')
  }
}

export async function fetchInvoicesPages(query: string) {
  noStore()
  try {
    const count = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE)
    return totalPages
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch total number of invoices.')
  }
}

export async function fetchInvoiceById(id: string) {
  noStore()
  try {
    const data = await sql<InvoiceForm>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `

    const invoice = data.rows.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100
    }))

    return invoice[0]
  } catch (error) {
    console.error('Database Error:', error)
  }
}

export async function fetchCustomers() {
  try {
    const data = await sql<CustomerField>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `

    const customers = data.rows
    return customers
  } catch (err) {
    console.error('Database Error:', err)
    throw new Error('Failed to fetch all customers.')
  }
}

export async function fetchFilteredCustomers(query: string, currentPage: number) {
  noStore()
  const offset = (currentPage - 1) * ITEMS_PER_PAGE
  try {
    const customers = await prisma.customers.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        invoices: {
          select: {
            id: true,
            amount: true,
            status: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      take: ITEMS_PER_PAGE, // Estableces el límite aquí
      skip: offset, // Aplicas el offset para la paginación
    });

    const formattedCustomersStatistics = customers.map((customer) => {
      const total_invoices = customer.invoices.length;
      const total_pending = customer.invoices.reduce((sum, invoice) => {
        return sum + (invoice.status === 'pending' ? invoice.amount : 0);
      }, 0);
      const total_paid = customer.invoices.reduce((sum, invoice) => {
        return sum + (invoice.status === 'paid' ? invoice.amount : 0);
      }, 0);

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        image_url: customer.image_url,
        total_invoices,
        total_pending: formatCurrency(total_pending),
        total_paid: formatCurrency(total_paid),
      };
    });

    return formattedCustomersStatistics;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch customers filtered.');
  }
}

export async function fetchCustomersPages(query: string) {
  noStore()
  try {
    const count = await prisma.customers.count({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { image_url: { contains: query, mode: 'insensitive' } },
        ],
      }
    });

    // Paso 2: Calcular el número total de páginas
    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchCustomerById(id: string) {
  noStore()
  try {
    const customer = await prisma.customers.findUnique({
      where: {
        id: id
      },
      select: {
        id: true,
        name: true,
        email: true,
        image_url: true
      }
    });

    // Verificar si se encontró el cliente
    if (customer) {

    }

    return customer;
  } catch (error) {
    console.error('Database Error:', error)
  }
}

export async function getUser(email: string) {
  try {
    const user = await sql`SELECT * from USERS where email=${email}`
    return user.rows[0] as User
  } catch (error) {
    console.error('Failed to fetch user:', error)
    throw new Error('Failed to fetch user.')
  }
}
