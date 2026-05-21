'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
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
      className={`${enabled ? 'bg-zinc-900' : 'bg-zinc-300'
        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50`}
    >
      <span
        className={`${enabled ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
      />
    </button>
  )
}

const initialState = {
  id: null,
  nome: '',
  creci: '',
  telefone: '',
  email: '',
  ativo: true,
  foto_url: ''
}

export default function CorretoresPage() {
  const [corretores, setCorretores] = useState([])
  const [form, setForm] = useState(initialState)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data, error } = await supabase
      .from('corretores')
      .select('*')
      .order('nome', { ascending: true })

    if (error) {
      console.error('Erro ao buscar corretores:', error.message)
      return
    }
    setCorretores(data || [])
  }

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleEdit = (corretor) => {
    setForm({
      id: corretor.id,
      nome: corretor.nome || '',
      creci: corretor.creci || '',
      telefone: corretor.telefone || '',
      email: corretor.email || '',
      ativo: corretor.ativo ?? true,
      foto_url: corretor.foto_url || ''
    })
    setFile(null)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleToggleAtivo(id, statusAtual) {
    try {
      const formData = new FormData()
      formData.append('data', JSON.stringify({ id, ativo: !statusAtual }))

      const response = await fetch('/api/corretores', {
        method: 'PUT',
        body: formData
      })

      if (!response.ok) throw new Error('Erro ao atualizar status')

      setCorretores(prev => prev.map(c =>
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
      const formData = new FormData()
      let dadosParaEnviar = { ...form }

      if (!dadosParaEnviar.id) {
        delete dadosParaEnviar.id
      }

      formData.append('data', JSON.stringify(dadosParaEnviar))

      if (file) {
        formData.append('file', file)
      }

      const method = form.id ? 'PUT' : 'POST'
      const response = await fetch('/api/corretores', {
        method,
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao processar requisição.')
      }

      setMessage(form.id ? 'Corretor updated successfully!' : 'Corretor registered successfully!')

      setForm(initialState)
      setFile(null)
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
      <div className="w-56 flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-6">

          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900">
                {showForm ? (form.id ? 'Editar Corretor' : 'Novo Corretor') : 'Equipe de Corretores'}
              </h1>
              <p className="text-zinc-500">
                {showForm ? 'Preencha os dados abaixo.' : 'Gerencie os profissionais da sua imobiliária.'}
              </p>
            </div>
            <button
              onClick={() => {
                setShowForm(!showForm);
                setForm(initialState);
                setFile(null);
                setMessage('');
              }}
              className={`rounded-xl px-6 py-3 text-sm font-semibold transition shadow-sm ${showForm
                  ? 'bg-white border border-zinc-300 text-zinc-600 hover:bg-zinc-50'
                  : 'bg-zinc-900 text-white hover:bg-zinc-800'
                }`}
            >
              {showForm ? 'Voltar para Lista' : '+ Adicionar Corretor'}
            </button>
          </header>

          {message && (
            <div className={`mb-6 rounded-xl p-4 text-sm font-medium border ${message.includes('Erro')
                ? 'bg-red-50 text-red-600 border-red-100'
                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
              }`}>
              {message}
            </div>
          )}

          {!showForm ? (
            <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Corretor</th>
                    <th className="px-6 py-4 font-semibold">CRECI</th>
                    <th className="px-6 py-4 font-semibold">Contato</th>
                    <th className="px-6 py-4 font-semibold text-center">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {corretores.length > 0 ? (
                    corretores.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-zinc-200 border border-zinc-100">
                              {item.foto_url ? (
                                <Image
                                  src={item.foto_url}
                                  alt={item.nome}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-zinc-400">
                                  {item.nome?.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <span className="font-bold text-zinc-900">{item.nome}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-zinc-600">{item.creci}</td>
                        <td className="px-6 py-4 text-zinc-600 text-xs">
                          <div className="font-medium">{item.email}</div>
                          <div>{item.telefone}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Toggle
                              enabled={item.ativo}
                              onChange={() => handleToggleAtivo(item.id, item.ativo)}
                            />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase">
                              {item.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-zinc-900 font-bold hover:underline"
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-zinc-500">
                        Nenhum corretor cadastrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 pb-20">

              <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                <div className="mb-6 flex items-center justify-between border-b pb-2">
                  <h2 className="text-lg font-semibold text-zinc-800">1. Dados Profissionais</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-zinc-500 italic">Visível no site?</span>
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
                      placeholder="Nome para exibição no site"
                    />
                  </div>
                  <Field
                    label="CRECI *"
                    value={form.creci}
                    onChange={v => setField('creci', v)}
                    required
                    placeholder="Ex: 12.345-F"
                  />
                  <Field
                    label="Telefone/WhatsApp *"
                    value={form.telefone}
                    onChange={v => setField('telefone', v)}
                    required
                    placeholder="(00) 00000-0000"
                  />
                  <div className="md:col-span-2">
                    <Field
                      label="E-mail Profissional *"
                      value={form.email}
                      onChange={v => setField('email', v)}
                      required
                      placeholder="exemplo@imobiliaria.com.br"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-lg font-semibold text-zinc-800 border-b pb-2">2. Foto de Perfil</h2>
                <div className="flex items-center gap-8">
                  <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-zinc-100 bg-zinc-50 shadow-inner">
                    {file ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={URL.createObjectURL(file)}
                        className="h-full w-full object-cover"
                        alt="Preview"
                      />
                    ) : form.foto_url ? (
                      <Image
                        src={form.foto_url}
                        alt="Foto Atual"
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-center text-[10px] text-zinc-400 p-2">
                        Sem Foto
                      </div>
                    )}
                  </div>

                  <div className="group relative flex-1 flex min-h-[128px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 transition hover:bg-zinc-100 hover:border-zinc-400">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 cursor-pointer opacity-0"
                      onChange={e => setFile(e.target.files?.[0])}
                    />
                    <div className="text-center p-4">
                      <p className="text-sm font-bold text-zinc-900">
                        {file ? 'Trocar foto selecionada' : 'Clique para selecionar foto'}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">PNG, JPG ou WEBP (Recomendado 500x500px)</p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex items-center justify-end gap-4 border-t border-zinc-200 pt-8">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl px-8 py-4 text-sm font-semibold text-zinc-600 hover:bg-zinc-100 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-zinc-900 px-12 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processando...' : (form.id ? 'Salvar Alterações' : 'Finalizar Cadastro')}
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
      <label className="mb-2 block text-sm font-bold text-zinc-700">{label}</label>
      <input
        className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-500 transition placeholder:text-zinc-400"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
      />
    </div>
  )
}