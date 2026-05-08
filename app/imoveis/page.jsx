'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase/client'
import Sidebar from "../components/sidebar/page";

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className={`${enabled ? 'bg-zinc-900' : 'bg-zinc-300'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
    >
      <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
    </button>
  )
}

const tiposImovel = [
  'casa', 'apartamento', 'cobertura', 'terreno', 'chacara', 
  'sitio', 'comercial', 'galpao', 'loja', 'sala'
]

const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

const LISTA_DIFERENCIAIS = [
  { key: 'academia', label: 'Academia' }, { key: 'adega', label: 'Adega' }, { key: 'alarme', label: 'Alarme' },
  { key: 'aquecedor', label: 'Aquecedor' }, { key: 'ar_condicionado', label: 'Ar Condicionado' },
  { key: 'area_lazer', label: 'Área de Lazer' }, { key: 'area_verde', label: 'Área Verde' },
  { key: 'arm_cozinha', label: 'Armários Cozinha' }, { key: 'arm_embutido', label: 'Armários Embutidos' },
  { key: 'banheira', label: 'Banheira' }, { key: 'bicicletario', label: 'Bicicletário' },
  { key: 'brinquedoteca', label: 'Brinquedoteca' }, { key: 'campo_futebol', label: 'Campo de Futebol' },
  { key: 'canil', label: 'Canil' }, { key: 'casa_caseiro', label: 'Casa de Caseiro' },
  { key: 'cerca_eletrica', label: 'Cerca Elétrica' }, { key: 'churrasqueira', label: 'Churrasqueira' },
  { key: 'closet', label: 'Closet' }, { key: 'copa', label: 'Copa' }, { key: 'cozinha_americana', label: 'Cozinha Americana' },
  { key: 'cozinha_gourmet', label: 'Cozinha Gourmet' }, { key: 'dep_empregados', label: 'Dep. Empregados' },
  { key: 'deposito', label: 'Depósito' }, { key: 'despensa', label: 'Despensa' },
  { key: 'elevador', label: 'Elevador' }, { key: 'escritorio', label: 'Escritório' },
  { key: 'esgoto', label: 'Esgoto' }, { key: 'espaco_gourmet', label: 'Espaço Gourmet' },
  { key: 'estacionamento', label: 'Estacionamento' }, { key: 'gas_encanado', label: 'Gás Encanado' },
  { key: 'gerador', label: 'Gerador' }, { key: 'hidromassagem', label: 'Hidromassagem' },
  { key: 'home_theater', label: 'Home Theater' }, { key: 'interfone', label: 'Interfone' },
  { key: 'internet', label: 'Internet' }, { key: 'jardim', label: 'Jardim' },
  { key: 'lareira', label: 'Lareira' }, { key: 'lavabo', label: 'Lavabo' },
  { key: 'lavanderia', label: 'Lavanderia' }, { key: 'mezanino', label: 'Mezanino' },
  { key: 'mobiliado', label: 'Mobiliado' }, { key: 'piscina', label: 'Piscina' },
  { key: 'piso_elevado', label: 'Piso Elevado' }, { key: 'playground', label: 'Playground' },
  { key: 'portaria_24h', label: 'Portaria 24h' }, { key: 'quadra_esportiva', label: 'Quadra Esportiva' },
  { key: 'quintal', label: 'Quintal' }, { key: 'sacada', label: 'Sacada' },
  { key: 'salao_festas', label: 'Salão de Festas' }, { key: 'salao_jogos', label: 'Salão de Jogos' },
  { key: 'sauna', label: 'Sauna' }, { key: 'varanda_gourmet', label: 'Varanda Gourmet' }
];

const MAPA_VISIBILIDADE = {
  apartamento: ['elevador', 'portaria_24h', 'sacada', 'salao_festas', 'academia', 'piscina', 'gas_encanado', 'playground', 'bicicletario', 'interfone', 'lavanderia'],
  casa: ['quintal', 'churrasqueira', 'piscina', 'canil', 'jardim', 'alarme', 'cerca_eletrica', 'casa_caseiro', 'copa', 'despensa', 'lareira'],
  terreno: ['esgoto', 'area_verde', 'cerca_eletrica', 'deposito'],
  comercial: ['estacionamento', 'ar_condicionado', 'gerador', 'interfone', 'alarme', 'piso_elevado', 'mezanino', 'escritorio'],
};

const DIFERENCIAIS_GERAIS = ['internet', 'ar_condicionado', 'mobiliado', 'dep_empregados'];

const baseState = {
  id: null,
  codigo: '', 
  tipo: '', 
  finalidade: 'venda', 
  status: 'disponivel',
  preco_venda: '', 
  preco_aluguel: '', 
  valor_condominio: '', 
  valor_iptu: '',
  cep: '', 
  logradouro: '', 
  numero: '', 
  complemento: '', 
  bairro: '', 
  cidade: '', 
  estado: 'MG',
  area_total: '', 
  area_construida: '', 
  quartos: 0, 
  suites: 0, 
  banheiros: 0, 
  vagas_garagem: 0,
  andar: '', 
  total_andares: '', 
  titulo: '', 
  descricao: '', 
  destaque: false, 
  corretor_id: '',
}

const difState = LISTA_DIFERENCIAIS.reduce((acc, item) => {
  acc[item.key] = false;
  return acc;
}, {});

const initialState = { ...baseState, ...difState };

export default function ImoveisPage() {
  const [imoveis, setImoveis] = useState([])
  const [form, setForm] = useState(initialState)
  const [corretores, setCorretores] = useState([])
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: imvs } = await supabase.from('imoveis').select('*').order('created_at', { ascending: false })
    const { data: corrs } = await supabase.from('corretores').select('id, nome').eq('ativo', true).order('nome')
    if (imvs) setImoveis(imvs)
    if (corrs) setCorretores(corrs)
  }

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const diferenciaisExibidos = useMemo(() => {
    if (!form.tipo) return [];
    const permitidos = MAPA_VISIBILIDADE[form.tipo] || [];
    return LISTA_DIFERENCIAIS.filter(item => 
      permitidos.includes(item.key) || DIFERENCIAIS_GERAIS.includes(item.key)
    );
  }, [form.tipo]);

  const handleEdit = (imovel) => {
    const flatDifs = imovel.diferenciais || {};
    setForm({ ...initialState, ...imovel, ...flatDifs });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleToggleStatus(id, currentStatus) {
    const novoStatus = currentStatus === 'disponivel' ? 'indisponivel' : 'disponivel'
    try {
      const body = new FormData()
      body.append('data', JSON.stringify({ id, status: novoStatus }))

      const response = await fetch('/api/imoveis', { method: 'PUT', body })
      if (!response.ok) throw new Error('Erro ao atualizar status')

      setImoveis(prev => prev.map(img => img.id === id ? { ...img, status: novoStatus } : img))
    } catch (error) {
      alert(error.message)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const payload = { ...form };
      const diferenciaisMap = {};
      
      LISTA_DIFERENCIAIS.forEach(item => {
        diferenciaisMap[item.key] = !!payload[item.key];
        delete payload[item.key];
      });

      const dataToSend = { ...payload, diferenciais: diferenciaisMap };
      
      const body = new FormData()
      body.append('data', JSON.stringify(dataToSend))
      files.forEach(file => body.append('files', file))

      const method = form.id ? 'PUT' : 'POST';
      const response = await fetch('/api/imoveis', { method, body })
      const result = await response.json()

      if (!response.ok) throw new Error(result.error || 'Erro ao processar.')

      setMessage(form.id ? 'Imóvel atualizado!' : 'Imóvel cadastrado!')
      setForm(initialState)
      setFiles([])
      setShowForm(false)
      fetchData()
    } catch (error) {
      setMessage("Erro: " + error.message)
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
              <h1 className="text-3xl font-bold text-zinc-900">
                {showForm ? (form.id ? 'Editar Imóvel' : 'Novo Imóvel') : 'Gestão de Imóveis'}
              </h1>
              <p className="text-zinc-500">Administre os anúncios e disponibilidade do portal.</p>
            </div>
            <button 
              onClick={() => { setShowForm(!showForm); setForm(initialState); setMessage(''); }}
              className={`rounded-xl px-6 py-3 text-sm font-semibold shadow-sm transition ${showForm ? 'bg-white border border-zinc-300 text-zinc-600' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
            >
              {showForm ? 'Voltar para Lista' : '+ Novo Imóvel'}
            </button>
          </header>

          {message && (
            <div className={`mb-6 rounded-xl p-4 text-sm font-medium border ${message.includes('Erro') ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
              {message}
            </div>
          )}

          {!showForm ? (
            <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Imóvel</th>
                    <th className="px-6 py-4 font-semibold">Tipo</th>
                    <th className="px-6 py-4 font-semibold">Preço</th>
                    <th className="px-6 py-4 font-semibold text-center">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {imoveis.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-zinc-900">{item.titulo}</div>
                        <div className="text-zinc-400 font-mono text-[11px]">{item.codigo}</div>
                      </td>
                      <td className="px-6 py-4 capitalize text-zinc-600">{item.tipo}</td>
                      <td className="px-6 py-4 font-medium text-zinc-900">
                        {item.preco_venda ? `Venda: R$ ${item.preco_venda.toLocaleString()}` : `Aluguel: R$ ${item.preco_aluguel?.toLocaleString()}`}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center gap-1">
                          <Toggle 
                            enabled={item.status === 'disponivel'} 
                            onChange={() => handleToggleStatus(item.id, item.status)} 
                          />
                          <span className={`text-[10px] font-bold uppercase ${item.status === 'disponivel' ? 'text-emerald-600' : 'text-zinc-400'}`}>
                            {item.status}
                          </span>
                        </div>
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
                  <h2 className="text-lg font-semibold text-zinc-800">1. Identificação</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-zinc-500 italic">Disponível?</span>
                    <Toggle 
                      enabled={form.status === 'disponivel'} 
                      onChange={() => setField('status', form.status === 'disponivel' ? 'indisponivel' : 'disponivel')} 
                    />
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Field label="Título do Anúncio *" value={form.titulo} onChange={v => setField('titulo', v)} required placeholder="Ex: Apartamento decorado no Centro" />
                  </div>
                  <Field label="Código Interno *" value={form.codigo} onChange={v => setField('codigo', v)} required placeholder="Ex: AP001" />
                  
                  <div>
                    <label className="mb-2 block text-sm font-bold text-zinc-700">Corretor Responsável</label>
                    <select className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-200" value={form.corretor_id} onChange={e => setField('corretor_id', e.target.value)}>
                      <option value="">Selecione um corretor...</option>
                      {corretores.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-zinc-700">Tipo de Imóvel *</label>
                    <select className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-200" value={form.tipo} onChange={e => setField('tipo', e.target.value)} required>
                      <option value="">Selecione o tipo...</option>
                      {tiposImovel.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-zinc-700">Finalidade *</label>
                    <select className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-200" value={form.finalidade} onChange={e => setField('finalidade', e.target.value)} required>
                      <option value="venda">Venda</option>
                      <option value="aluguel">Aluguel</option>
                      <option value="venda_aluguel">Venda ou Aluguel</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-lg font-semibold text-zinc-800 border-b pb-2">2. Valores</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Field label="Venda (R$)" value={form.preco_venda} onChange={v => setField('preco_venda', v)} placeholder="0,00" />
                  <Field label="Aluguel (R$)" value={form.preco_aluguel} onChange={v => setField('preco_aluguel', v)} placeholder="0,00" />
                  <Field label="Condomínio (R$)" value={form.valor_condominio} onChange={v => setField('valor_condominio', v)} placeholder="0,00" />
                  <Field label="IPTU (R$)" value={form.valor_iptu} onChange={v => setField('valor_iptu', v)} placeholder="0,00" />
                </div>
              </section>

              <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-lg font-semibold text-zinc-800 border-b pb-2">3. Localização</h2>
                <div className="grid gap-6 md:grid-cols-3">
                  <Field label="CEP *" value={form.cep} onChange={v => setField('cep', v)} required />
                  <div className="md:col-span-2">
                    <Field label="Logradouro *" value={form.logradouro} onChange={v => setField('logradouro', v)} required />
                  </div>
                  <Field label="Número" value={form.numero} onChange={v => setField('numero', v)} />
                  <Field label="Complemento" value={form.complemento} onChange={v => setField('complemento', v)} />
                  <Field label="Bairro *" value={form.bairro} onChange={v => setField('bairro', v)} required />
                  <Field label="Cidade *" value={form.cidade} onChange={v => setField('cidade', v)} required />
                  <div>
                    <label className="mb-2 block text-sm font-bold text-zinc-700">Estado *</label>
                    <select className="w-full rounded-xl border border-zinc-300 px-4 py-3" value={form.estado} onChange={e => setField('estado', e.target.value)} required>
                      {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-lg font-semibold text-zinc-800 border-b pb-2">4. Características</h2>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                  <Field label="Área Total (m²)" value={form.area_total} onChange={v => setField('area_total', v)} />
                  <Field label="Área Útil (m²)" value={form.area_construida} onChange={v => setField('area_construida', v)} />
                  <Field label="Andar" value={form.andar} onChange={v => setField('andar', v)} />
                  <Field label="Total de Andares" value={form.total_andares} onChange={v => setField('total_andares', v)} />
                  <Stepper label="Quartos" value={form.quartos} onChange={v => setField('quartos', v)} />
                  <Stepper label="Suítes" value={form.suites} onChange={v => setField('suites', v)} />
                  <Stepper label="Banheiros" value={form.banheiros} onChange={v => setField('banheiros', v)} />
                  <Stepper label="Vagas Garagem" value={form.vagas_garagem} onChange={v => setField('vagas_garagem', v)} />
                </div>
              </section>

              <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-lg font-semibold text-zinc-800 border-b pb-2">5. Diferenciais</h2>
                <div className="flex flex-wrap gap-3">
                  {diferenciaisExibidos.map(item => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setField(item.key, !form[item.key])}
                      className={`rounded-full border px-5 py-2 text-sm font-medium transition-all ${
                        form[item.key] ? 'border-zinc-900 bg-zinc-900 text-white shadow-md' : 'border-zinc-300 bg-white text-zinc-600 hover:border-zinc-400'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-lg font-semibold text-zinc-800 border-b pb-2">6. Conteúdo e Fotos</h2>
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-zinc-700">Descrição</label>
                    <textarea 
                      className="min-h-[150px] w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-900/10 transition" 
                      value={form.descricao} 
                      onChange={e => setField('descricao', e.target.value)}
                      placeholder="Detalhes do imóvel..."
                    />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="h-5 w-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" checked={form.destaque} onChange={e => setField('destaque', e.target.checked)} />
                    <span className="text-sm font-bold text-zinc-800 uppercase tracking-tight">Destaque na Home</span>
                  </label>

                  <div className="group relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 transition hover:bg-zinc-100">
                    <input type="file" multiple accept="image/*" className="absolute inset-0 cursor-pointer opacity-0" onChange={e => setFiles(Array.from(e.target.files || []))} />
                    <p className="text-sm font-bold text-zinc-900">Adicionar Fotos</p>
                    <p className="text-xs text-zinc-500">Arraste ou clique para selecionar</p>
                  </div>
                  {files.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 italic text-[10px] text-zinc-500">
                      {files.map((f, i) => <div key={i} className="truncate bg-zinc-100 p-1 rounded">● {f.name}</div>)}
                    </div>
                  )}
                </div>
              </section>

              <div className="flex items-center justify-end gap-4 border-t pt-8">
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-sm font-bold text-zinc-500 hover:text-zinc-800">Cancelar</button>
                <button type="submit" disabled={loading} className="rounded-xl bg-zinc-900 px-10 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-zinc-800 disabled:opacity-50">
                  {loading ? 'Gravando...' : (form.id ? 'Atualizar Imóvel' : 'Publicar Imóvel')}
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
        className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-900/10 transition" 
        value={value || ''} 
        onChange={e => onChange(e.target.value)} 
        required={required} 
        placeholder={placeholder} 
      />
    </div>
  )
}

function Stepper({ label, value, onChange }) {
  return (
    <div className="flex flex-col">
      <label className="mb-2 block text-sm font-bold text-zinc-700">{label}</label>
      <div className="flex items-center gap-1">
        <button type="button" className="flex h-12 w-12 items-center justify-center rounded-l-xl border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 font-bold" onClick={() => onChange(Math.max(0, value - 1))}> - </button>
        <div className="flex h-12 w-12 items-center justify-center border-y border-zinc-300 font-bold bg-white"> {value} </div>
        <button type="button" className="flex h-12 w-12 items-center justify-center rounded-r-xl border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 font-bold" onClick={() => onChange(value + 1)}> + </button>
      </div>
    </div>
  )
}