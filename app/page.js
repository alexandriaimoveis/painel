'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './lib/supabase/client'
import Sidebar from "./components/sidebar/page";
import Main from "./components/main/page";

export default function Home() {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
      } else {
        setCheckingAuth(false)
      }
    }
    
    checkUser()
  }, [router])

  if (checkingAuth) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-50">
        <div className="text-sm font-medium text-zinc-500 animate-pulse">
          Verificando autenticação...
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <div className="w-72 flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-black">
        <div className="mx-auto max-w-6xl p-6">
          <Main />
        </div>
      </div>
    </div>
  );
}