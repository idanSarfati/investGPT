import { UserForm } from "@/components/UserForm"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
         <div className="z-10 max-w-5xl w-full items-center justify-between text-sm">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          InvestGPT
        </h1>
        <p className="text-center mb-12 text-gray-600 dark:text-gray-300">
          Get personalized investment recommendations based on your goals and preferences
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <UserForm />
        </div>
        </div>
      </main>
  )
}
