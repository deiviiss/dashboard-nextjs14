'use server'

import { sql } from '@vercel/postgres'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { signIn } from '@/auth';

const FormSchemaInvoice = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Por favor seleccione un cliente.',
  }),
  amount: z.coerce
    .number()
    .gt(0, {
      message: 'Por favor ingrese una cantidad mayor que $0.'
    }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Seleccione un estado de factura.',
  }),
  date: z.string()
})
const CreateInvoice = FormSchemaInvoice.omit({ id: true, date: true })
const UpdateInvoice = FormSchemaInvoice.omit({ id: true, date: true })

// This is temporary until @types/react-dom is updated
export type StateInvoice = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevStateInvoice: StateInvoice, formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Campos faltantes. No se pudo crear la factura.',
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
     INSERT INTO invoices (customer_id, amount, status, date)
     VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
   `
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.'
    }
  }

  revalidatePath('/dashboard/invoices')
  redirect('/dashboard/invoices')
}

export async function updateInvoice(id: string, prevStateInvoice: StateInvoice, formData: FormData) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Campos faltantes. No se pudo crear la factura.',
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `
  } catch (error) {
    return {
      message: 'Database Error: Failed to Update Invoice.'
    }
  }

  revalidatePath('/dashboard/invoices')
  redirect('/dashboard/invoices')
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`
    revalidatePath('/dashboard/invoices')
    return { message: 'Deleted Invoice.' }
  } catch (error) {
    return {
      message: 'Database Error: Failed to Delete Invoice.'
    }
  }
}

const FormCustomerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, {
    message: 'Por favor escriba un nombre.',
  }),
  email: z.string().email({
    message: 'Por favor escriba un correo electrónico.',
  }),
  image_file: z.custom((value) => {
    if (value == null || !(value instanceof Blob) || value.size === 0) {
      return false
    }
    return value;
  }, 'Por favor, seleccione un archivo válido.'),
})
const CreateCustomerSchema = FormCustomerSchema.omit({ id: true })
const UpdateCustomer = FormCustomerSchema.omit({ id: true, date: true })

// This is temporary until @types/react-dom is updated
export type StateCustomer = {
  errors?: {
    name?: string[];
    email?: string[];
    image_file?: string[];
  };
  message?: string | null;
};

export async function createCustomer(prevStateCustomer: StateCustomer, formData: FormData) {
  const validatedFields = CreateCustomerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    image_file: formData.get('image'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Campos faltantes. No se pudo crear el cliente.',
    };
  }

  // Prepare data for insertion into the database
  const { name, email, image_file } = validatedFields.data;

  //* save image in cloudinary
  // console.log('Image File')
  // console.log(image_file) // en este punto se guardara en cloudinary

  //* url from cloudinary
  const imageUrl = '/customers/customer-default.png'

  try {
    await sql`
     INSERT INTO customers (name, email, image_url)
     VALUES (${name}, ${email}, ${imageUrl})
   `
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Customer.'
    }
  }

  revalidatePath('/dashboard/customers')
  redirect('/dashboard/customers')
}

export async function updateCustomer(id: string, prevStateCustomer: StateCustomer, formData: FormData) {
  const validatedFields = UpdateCustomer.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    image_file: formData.get('image'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Campos faltantes. No se pudo crear la factura.',
    };
  }

  // Prepare data for insertion into the database
  const { name, email, image_file } = validatedFields.data;

  //* save image in cloudinary
  // console.log('Image File')
  // console.log(image_file) // en este punto se actualizara en cloudinary

  //* url from cloudinary
  const imageUrl = '/customers/customer-default.png'

  try {
    await sql`
    UPDATE customers
    SET name = ${name}, email = ${email}, image_url = ${imageUrl}
    WHERE id = ${id}
  `
  } catch (error) {
    return {
      message: 'Database Error: Failed to Update Invoice.'
    }
  }

  revalidatePath('/dashboard/customers')
  redirect('/dashboard/customers')
}

export async function deleteCustomer(id: string) {
  try {
    await sql`DELETE FROM customers WHERE id = ${id}`
    revalidatePath('/dashboard/customers')
    return { message: 'Deleted Customer.' }
  } catch (error) {
    return {
      message: 'Database Error: Failed to Delete Customer.'
    }
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', Object.fromEntries(formData));
  } catch (error) {
    if ((error as Error).message.includes('CredentialsSignin')) {
      return 'CredentialsSignin';
    }
    throw error;
  }
}