'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase/client'
import { Home, Users, Briefcase, ArrowRight, Search, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    imoveis: 0,
    clientes: 0,
    corretores: 0
  })
  const [loading, setLoading] = useState(true)
  
  // Estados para a busca por ID / Código
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')

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

  // Função para buscar o imóvel e redirecionar o corretor
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setSearchLoading(true)
    setSearchError('')

    try {
      let query = supabase.from('imoveis').select('id')

      // Se for apenas números, busca pelo ID primário. Caso contrário, busca pelo Código Interno.
      if (/^\d+$/.test(searchQuery.trim())) {
        query = query.eq('id', parseInt(searchQuery.trim()))
      } else {
        query = query.ilike('codigo', searchQuery.trim())
      }

      const { data, error } = await query.maybeSingle()

      if (error) throw error

      if (data) {
        // ✅ Corrigido para a pasta correta da sua árvore: app/imoveis/[id]
        router.push(`/imoveis/${data.id}`)
      } else {
        setSearchError('Imóvel não encontrado.')
      }
    } catch (err) {
      console.error(err)
      setSearchError('Erro ao buscar imóvel.')
    } finally {
      setSearchLoading(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-6">

          {/* Header com Grid */}
          <header className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-zinc-100 pb-6">
            <div>
              <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Bem-vindo ao Portal</h1>
              <p className="text-zinc-500 mt-2 text-lg">Aqui está o resumo da sua imobiliária hoje.</p>
            </div>

            {/* 🔍 CAMPO DE BUSCA COM LABEL ADICIONADO */}
            <div className="w-full md:w-80 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">
                Busque pelo imóvel
              </label>
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Digite o ID ou Código..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-zinc-200 bg-white text-sm text-zinc-900 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent placeholder:text-zinc-400"
                />
                <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-3.5" />
                
                {searchLoading && (
                  <Loader2 className="w-5 h-5 text-zinc-500 absolute right-4 top-3.5 animate-spin" />
                )}
              </form>
              {searchError && (
                <p className="text-xs text-rose-600 mt-0.5 ml-1 font-medium">{searchError}</p>
              )}
            </div>
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