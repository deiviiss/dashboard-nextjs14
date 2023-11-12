import { fetchRevenue } from "../lib/data";


export default async function DashboardPage() {
  // const reveneu = await fetchRevenue()

  return (
    <>
      <main className="flex min-h-screen flex-col p-6 bg-red-500">
        {/* <h1 className={`${lucitana.clasname} text-3xl`}></h1> */}
        Dashboard
      </main>
    </>
  );
}
