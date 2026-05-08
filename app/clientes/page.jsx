'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase/client'
import Sidebar from "../components/sidebar/page";

function Toggle({ enabled, onChange, loading }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      disabled={loading}
      className={`${
        enabled ? 'bg-zinc-900' : 'bg-zinc-300'
      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50`}
    >
      <span
        className={`${
          enabled ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
      />
    </button>
  )
}

const initialState = {
  id: null,
  nome: '',
  telefone: '',
  email: '',
  observacoes: '',
  ativo: true,
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState([])
  const [form, setForm] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setClientes(data)
  }

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleEdit = (cliente) => {
    setForm(cliente)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleToggleAtivo(id, statusAtual) {
    try {
      const response = await fetch('/api/clientes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ativo: !statusAtual })
      })

      if (!response.ok) throw new Error('Erro ao atualizar status')

      setClientes(prev => prev.map(c => 
        c.id === id ? { ...c, ativo: !statusAtual } : c
      ))
    } catch (error) {
      alert("Erro ao mudar status: " + error.message)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const method = form.id ? 'PUT' : 'POST'
      const response = await fetch('/api/clientes', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Erro ao processar.')

      setMessage(form.id ? 'Cliente atualizado!' : 'Cliente cadastrado!')
      setForm(initialState)
      setShowForm(false)
      fetchData()
    } catch (error) {
      setMessage('Erro: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <div className="w-56 flex-shrink-0"><Sidebar /></div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-6">
          
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900">Gestão de Clientes</h1>
              <p className="text-zinc-500">Controle sua base de contatos e interessados.</p>
            </div>
            <button 
              onClick={() => { setShowForm(!showForm); setForm(initialState); setMessage(''); }}
              className={`rounded-xl px-6 py-3 text-sm font-semibold transition ${showForm ? 'bg-white border border-zinc-300 text-zinc-600' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
            >
              {showForm ? 'Voltar para Lista' : '+ Novo Cliente'}
            </button>
          </header>

          {message && (
            <div className={`mb-6 rounded-xl p-4 text-sm font-medium ${message.includes('Erro') ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {message}
            </div>
          )}

          {!showForm ? (
            <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Nome</th>
                    <th className="px-6 py-4 font-semibold">Contato</th>
                    <th className="px-6 py-4 font-semibold text-center">Status</th>
                    <th className="px-6 py-4 font-semibold">Data Cadastro</th>
                    <th className="px-6 py-4 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {clientes.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/50 transition">
                      <td className="px-6 py-4 font-bold text-zinc-900">{item.nome}</td>
                      <td className="px-6 py-4 text-zinc-600">
                        <div>{item.telefone}</div>
                        <div className="text-xs text-zinc-400">{item.email || 'Sem e-mail'}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Toggle 
                            enabled={item.ativo} 
                            onChange={() => handleToggleAtivo(item.id, item.ativo)} 
                          />
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                            {item.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-500">
                        {new Date(item.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleEdit(item)} className="text-zinc-900 font-bold hover:underline">Editar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 pb-20">
              <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                <div className="mb-6 flex items-center justify-between border-b pb-2">
                   <h2 className="text-lg font-semibold text-zinc-800">Informações de Contato</h2>
                   <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-zinc-500">Cliente Ativo?</span>
                      <Toggle 
                        enabled={form.ativo} 
                        onChange={() => setField('ativo', !form.ativo)} 
                      />
                   </div>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Field 
                      label="Nome Completo *" 
                      value={form.nome} 
                      onChange={v => setField('nome', v)} 
                      required 
                      placeholder="Ex: Maria Oliveira" 
                    />
                  </div>
                  <Field 
                    label="Telefone / WhatsApp *" 
                    value={form.telefone} 
                    onChange={v => setField('telefone', v)} 
                    required 
                    placeholder="(00) 00000-0000" 
                  />
                  <Field 
                    label="E-mail" 
                    value={form.email} 
                    onChange={v => setField('email', v)} 
                    placeholder="exemplo@email.com" 
                  />
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-zinc-700">Observações Internas</label>
                    <textarea 
                      className="min-h-[120px] w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-200 transition" 
                      value={form.observacoes} 
                      onChange={e => setField('observacoes', e.target.value)}
                      placeholder="Interesse em casas no bairro X, perfil investidor..."
                    />
                  </div>
                </div>
              </section>

              <div className="flex items-center justify-end gap-4 border-t pt-8">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  className="rounded-xl px-6 py-3 text-sm font-semibold text-zinc-600 hover:bg-zinc-100"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="rounded-xl bg-zinc-900 px-10 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-zinc-800 disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : (form.id ? 'Salvar Alterações' : 'Cadastrar Cliente')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, required = false, placeholder = "" }) {
  return (
    <div className="w-full">
      <label className="mb-2 block text-sm font-medium text-zinc-700">{label}</label>
      <input
        className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-200 transition"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
      />
    </div>
  )
}