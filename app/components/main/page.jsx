'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase/client'
import { Home, Users, Briefcase, ArrowRight } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    imoveis: 0,
    clientes: 0,
    corretores: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getStats() {
      try {
        const [imoveisRes, clientesRes, corretoresRes] = await Promise.all([
          supabase.from('imoveis').select('*', { count: 'exact', head: true }),
          supabase.from('clientes').select('*', { count: 'exact', head: true }),
          supabase.from('corretores').select('*', { count: 'exact', head: true })
        ])

        setStats({
          imoveis: imoveisRes.count || 0,
          clientes: clientesRes.count || 0,
          corretores: corretoresRes.count || 0
        })
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
      } finally {
        setLoading(false)
      }
    }

    getStats()
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-8">
          
          <header className="mb-10">
            <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Bem-vindo ao Portal</h1>
            <p className="text-zinc-500 mt-2 text-lg">Aqui está o resumo da sua imobiliária hoje.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <StatCard 
              title="Imóveis" 
              count={stats.imoveis} 
              label="cadastrados" 
              icon={<Home className="w-6 h-6" />}
              color="bg-blue-600"
              loading={loading}
            />

            <StatCard 
              title="Clientes" 
              count={stats.clientes} 
              label="na base de dados" 
              icon={<Users className="w-6 h-6" />}
              color="bg-emerald-600"
              loading={loading}
            />

            <StatCard 
              title="Corretores" 
              count={stats.corretores} 
              label="equipe ativa" 
              icon={<Briefcase className="w-6 h-6" />}
              color="bg-purple-600"
              loading={loading}
            />

          </div>

          <div className="mt-12 rounded-3xl bg-zinc-900 p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold">Dica do dia</h2>
              <p className="mt-2 text-zinc-400 max-w-md">
                Mantenha as fotos dos seus imóveis atualizadas. Imóveis com fotos recentes têm 40% mais cliques dos clientes.
              </p>
            </div>
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-zinc-800 rounded-full blur-3xl opacity-50"></div>
          </div>

        </div>
      </div>
    </div>
  )
}

function StatCard({ title, count, label, icon, color, loading }) {
  return (
    <div className="group rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-zinc-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl text-white ${color} shadow-lg shadow-inherit/20`}>
          {icon}
        </div>
        <ArrowRight className="w-5 h-5 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
      </div>
      
      {loading ? (
        <div className="h-10 w-24 bg-zinc-100 animate-pulse rounded-lg mb-2"></div>
      ) : (
        <h3 className="text-5xl font-black text-zinc-900 leading-none tabular-nums">
          {count}
        </h3>
      )}
      
      <p className="mt-2 font-bold text-zinc-800 uppercase tracking-wider text-xs">
        {title}
      </p>
      <p className="text-zinc-400 text-sm">
        {label}
      </p>
    </div>
  )
}