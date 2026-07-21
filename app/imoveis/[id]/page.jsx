'use client'

import Sidebar from "../../components/sidebar/page";
import { useEffect, useState, use } from 'react'
import { supabase } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Edit3, 
  Save, 
  Trash2, 
  X, 
  Upload, 
  Bed, 
  Bath, 
  Car, 
  Maximize, 
  MapPin, 
  Loader2,
  Check,
  Star
} from 'lucide-react'

const DIFERENCIAIS_LISTA = [
  { key: 'suites', label: 'Suítes' },
  { key: 'sala_estar', label: 'Sala de Estar' },
  { key: 'sala_jantar', label: 'Sala de Jantar' },
  { key: 'sacada', label: 'Sacada / Varanda' },
  { key: 'ar_condicionado', label: 'Ar Condicionado' },
  { key: 'armario_cozinha', label: 'Armário Cozinha' },
  { key: 'churrasqueira', label: 'Churrasqueira' },
  { key: 'piscina', label: 'Piscina' },
  { key: 'portaria_24h', label: 'Portaria 24h' },
  { key: 'elevador', label: 'Elevador' },
  { key: 'aceita_pets', label: 'Aceita Pets' }
]

export default function ImovelPage({ params }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const id = resolvedParams.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const [imovel, setImovel] = useState(null)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    async function fetchImovel() {
      try {
        const { data, error } = await supabase
          .from('imoveis')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error

        const fotosFormatadas = (data.fotos || []).map((item, idx) => {
          if (typeof item === 'string') {
            return { url: item, path: '', capa: idx === 0 }
          }
          return item
        })

        const dataTratada = { ...data, fotos: fotosFormatadas }

        setImovel(dataTratada)
        setFormData(dataTratada)
      } catch (err) {
        console.error('Erro ao buscar imóvel:', err)
        setFeedback({ type: 'error', message: 'Erro ao carregar dados do imóvel.' })
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchImovel()
  }, [id])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    let val = value

    if (type === 'checkbox') {
      val = checked
    } else if (type === 'number') {
      val = value === '' ? '' : Number(value)
    }

    setFormData((prev) => ({ ...prev, [name]: val }))
  }

  const handleImageUpload = async (e) => {
    try {
      setUploadingImage(true)
      const file = e.target.files?.[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
      const filePath = `imoveis/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('imoveis')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('imoveis')
        .getPublicUrl(filePath)

      const isFirst = (formData.fotos || []).length === 0

      const novaFoto = {
        url: publicUrlData.publicUrl,
        path: filePath,
        capa: isFirst,
        ordem: (formData.fotos || []).length
      }

      setFormData((prev) => ({ ...prev, fotos: [...(prev.fotos || []), novaFoto] }))
      setFeedback({ type: 'success', message: 'Imagem adicionada com sucesso!' })
    } catch (err) {
      console.error(err)
      setFeedback({ type: 'error', message: 'Erro ao fazer upload da imagem.' })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = (indexToRemove) => {
    const fotosAtuais = formData.fotos || []
    const updatedFotos = fotosAtuais.filter((_, idx) => idx !== indexToRemove)
    
    if (fotosAtuais[indexToRemove]?.capa && updatedFotos.length > 0) {
      updatedFotos[0].capa = true
    }

    setFormData((prev) => ({ ...prev, fotos: updatedFotos }))
  }

  const handleSetCapa = (indexCapa) => {
    const updated = (formData.fotos || []).map((foto, idx) => ({
      ...foto,
      capa: idx === indexCapa
    }))
    setFormData((prev) => ({ ...prev, fotos: updated }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFeedback(null)

    try {
      const { error } = await supabase
        .from('imoveis')
        .update(formData)
        .eq('id', id)

      if (error) throw error

      setImovel(formData)
      setIsEditing(false)
      setFeedback({ type: 'success', message: 'Imóvel atualizado com sucesso!' })
    } catch (err) {
      console.error(err)
      setFeedback({ type: 'error', message: 'Erro ao salvar alterações.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza de que deseja excluir este imóvel? Esta ação é irreversível.')) return

    try {
      const { error } = await supabase.from('imoveis').delete().eq('id', id)
      if (error) throw error
      router.push('/')
    } catch (err) {
      console.error(err)
      setFeedback({ type: 'error', message: 'Erro ao excluir imóvel.' })
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
      </div>
    )
  }

  if (!imovel) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-zinc-50 gap-4">
        <p className="text-zinc-600 font-medium">Imóvel não encontrado.</p>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm font-semibold text-zinc-900 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Dashboard
        </button>
      </div>
    )
  }

  const enderecoFormatado = [imovel.logradouro, imovel.numero, imovel.bairro, imovel.cidade]
    .filter(Boolean)
    .join(', ') || imovel.endereco || 'Endereço não informado'

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <div className="w-64 flex-shrink-0"><Sidebar /></div>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-6">
          
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition-all hover:bg-zinc-100"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>

            <div className="flex items-center gap-3">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 transition-all"
                  >
                    <Edit3 className="w-4 h-4" /> Editar Imóvel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" /> Excluir
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setFormData(imovel)
                    setIsEditing(false)
                  }}
                  className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 transition-all"
                >
                  <X className="w-4 h-4" /> Cancelar
                </button>
              )}
            </div>
          </div>

          {feedback && (
            <div
              className={`mb-6 rounded-2xl p-4 text-sm font-medium ${
                feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedback.message}
            </div>
          )}

          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              
              <div className="lg:col-span-2 space-y-8">
                <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm space-y-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Código Interno: {imovel.codigo || id}
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        name="titulo"
                        value={formData.titulo || ''}
                        onChange={handleInputChange}
                        placeholder="Título do Imóvel"
                        className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-xl font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                      />
                    ) : (
                      <h1 className="text-3xl font-extrabold text-zinc-900 mt-1">
                        {imovel.titulo || 'Sem título'}
                      </h1>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 block">Galeria de Fotos</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {(formData.fotos || []).map((fotoObj, index) => {
                        const imgUrl = typeof fotoObj === 'string' ? fotoObj : fotoObj.url
                        const isCapa = typeof fotoObj === 'object' && fotoObj.capa

                        return (
                          <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100">
                            <img src={imgUrl} alt={`Foto ${index}`} className="w-full h-full object-cover" />
                            
                            {isCapa && (
                              <span className="absolute top-2 left-2 rounded-lg bg-zinc-900/80 backdrop-blur-sm px-2 py-1 text-[10px] font-bold text-white flex items-center gap-1">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Capa
                              </span>
                            )}

                            {isEditing && (
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                {!isCapa && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetCapa(index)}
                                    title="Definir como Capa"
                                    className="rounded-full bg-white p-2 text-zinc-900 hover:bg-zinc-100 transition-all"
                                  >
                                    <Star className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(index)}
                                  title="Remover Imagem"
                                  className="rounded-full bg-rose-600 p-2 text-white hover:bg-rose-700 transition-all"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}

                      {isEditing && (
                        <label className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-zinc-200 hover:border-zinc-400 bg-zinc-50 cursor-pointer transition-all">
                          {uploadingImage ? (
                            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                          ) : (
                            <>
                              <Upload className="w-6 h-6 text-zinc-400 mb-1" />
                              <span className="text-xs font-semibold text-zinc-500">Adicionar</span>
                            </>
                          )}
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                        </label>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 block">Descrição</label>
                    {isEditing ? (
                      <textarea
                        name="descricao"
                        rows={6}
                        value={formData.descricao || ''}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-zinc-200 p-4 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                      />
                    ) : (
                      <p className="text-zinc-600 text-sm leading-relaxed whitespace-pre-line">
                        {imovel.descricao || 'Nenhuma descrição fornecida.'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold text-zinc-900">Características Principais</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatInput
                      icon={<Bed className="w-4 h-4 text-zinc-500" />}
                      label="Quartos"
                      name="quartos"
                      value={isEditing ? formData.quartos : imovel.quartos}
                      isEditing={isEditing}
                      onChange={handleInputChange}
                    />
                    <StatInput
                      icon={<Bath className="w-4 h-4 text-zinc-500" />}
                      label="Banheiros"
                      name="banheiros"
                      value={isEditing ? formData.banheiros : imovel.banheiros}
                      isEditing={isEditing}
                      onChange={handleInputChange}
                    />
                    <StatInput
                      icon={<Car className="w-4 h-4 text-zinc-500" />}
                      label="Vagas"
                      name="vagas_garagem"
                      value={isEditing ? formData.vagas_garagem : imovel.vagas_garagem}
                      isEditing={isEditing}
                      onChange={handleInputChange}
                    />
                    <StatInput
                      icon={<Maximize className="w-4 h-4 text-zinc-500" />}
                      label="Área Total (m²)"
                      name="area_total"
                      value={isEditing ? formData.area_total : imovel.area_total}
                      isEditing={isEditing}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-zinc-900">Diferenciais & Comodidades</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {DIFERENCIAIS_LISTA.map((item) => {
                      const isActive = isEditing ? formData[item.key] : imovel[item.key]

                      if (!isEditing && !isActive) return null

                      return (
                        <div key={item.key} className="flex items-center gap-2">
                          {isEditing ? (
                            <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                              <input
                                type="checkbox"
                                name={item.key}
                                checked={!!formData[item.key]}
                                onChange={handleInputChange}
                                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                              />
                              {item.label}
                            </label>
                          ) : (
                            <div className="flex items-center gap-2 rounded-xl bg-zinc-50 px-3 py-2 border border-zinc-100 w-full">
                              <Check className="w-4 h-4 text-emerald-600" />
                              <span className="text-xs font-semibold text-zinc-700">{item.label}</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm space-y-6">
                  
                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">Valores & Finalidade</label>
                    
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-medium text-zinc-500 mb-1 block">Finalidade</label>
                          <select
                            name="finalidade"
                            value={formData.finalidade || 'venda'}
                            onChange={handleInputChange}
                            className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                          >
                            <option value="venda">Venda</option>
                            <option value="aluguel">Aluguel</option>
                            <option value="ambos">Venda e Aluguel</option>
                          </select>
                        </div>

                        {(formData.finalidade === 'venda' || formData.finalidade === 'ambos') && (
                          <div>
                            <label className="text-xs font-medium text-zinc-500 mb-1 block">Preço de Venda (R$)</label>
                            <input
                              type="number"
                              name="preco_venda"
                              value={formData.preco_venda ?? ''}
                              onChange={handleInputChange}
                              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            />
                          </div>
                        )}

                        {(formData.finalidade === 'aluguel' || formData.finalidade === 'ambos') && (
                          <div>
                            <label className="text-xs font-medium text-zinc-500 mb-1 block">Preço do Aluguel (R$)</label>
                            <input
                              type="number"
                              name="preco_aluguel"
                              value={formData.preco_aluguel ?? ''}
                              onChange={handleInputChange}
                              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs font-medium text-zinc-500 mb-1 block">Condomínio (R$)</label>
                            <input
                              type="number"
                              name="valor_condominio"
                              value={formData.valor_condominio ?? ''}
                              onChange={handleInputChange}
                              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-zinc-500 mb-1 block">IPTU (R$)</label>
                            <input
                              type="number"
                              name="valor_iptu"
                              value={formData.valor_iptu ?? ''}
                              onChange={handleInputChange}
                              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {imovel.preco_venda && (
                          <div>
                            <span className="text-xs text-zinc-400 block font-medium">Venda</span>
                            <span className="text-3xl font-black text-zinc-900">
                              R$ {Number(imovel.preco_venda).toLocaleString('pt-BR')}
                            </span>
                          </div>
                        )}
                        {imovel.preco_aluguel && (
                          <div>
                            <span className="text-xs text-zinc-400 block font-medium">Aluguel</span>
                            <span className="text-2xl font-bold text-zinc-900">
                              R$ {Number(imovel.preco_aluguel).toLocaleString('pt-BR')} <span className="text-xs text-zinc-500 font-normal">/mês</span>
                            </span>
                          </div>
                        )}
                        <div className="flex gap-4 text-xs font-semibold text-zinc-500 pt-2 border-t border-zinc-100">
                          {imovel.valor_condominio && <span>Cond.: R$ {imovel.valor_condominio}</span>}
                          {imovel.valor_iptu && <span>IPTU: R$ {imovel.valor_iptu}</span>}
                        </div>
                      </div>
                    )}
                  </div>

                  <hr className="border-zinc-100" />

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1 block">Status</label>
                      {isEditing ? (
                        <select
                          name="situacao"
                          value={formData.situacao || formData.status || 'disponivel'}
                          onChange={handleInputChange}
                          className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                        >
                          <option value="disponivel">Disponível</option>
                          <option value="vendido">Vendido</option>
                          <option value="alugado">Alugado</option>
                          <option value="reservado">Reservado</option>
                        </select>
                      ) : (
                        <span className="inline-block rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 capitalize">
                          {imovel.situacao || imovel.status || 'Disponível'}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1 block">Localização</label>
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            name="logradouro"
                            placeholder="Rua / Avenida"
                            value={formData.logradouro || ''}
                            onChange={handleInputChange}
                            className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              name="numero"
                              placeholder="Número"
                              value={formData.numero || ''}
                              onChange={handleInputChange}
                              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            />
                            <input
                              type="text"
                              name="bairro"
                              placeholder="Bairro"
                              value={formData.bairro || ''}
                              onChange={handleInputChange}
                              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            />
                          </div>
                          <input
                            type="text"
                            name="cidade"
                            placeholder="Cidade"
                            value={formData.cidade || ''}
                            onChange={handleInputChange}
                            className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                          />
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-zinc-700 flex items-start gap-1.5">
                          <MapPin className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                          {enderecoFormatado}
                        </p>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-white shadow-md hover:bg-zinc-800 transition-all disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Salvar Modificações
                    </button>
                  )}
                </div>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function StatInput({ icon, label, name, value, isEditing, onChange }) {
  return (
    <div className="flex flex-col justify-center rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-semibold text-zinc-500 uppercase">{label}</span>
      </div>
      {isEditing ? (
        <input
          type="number"
          name={name}
          value={value ?? ''}
          onChange={onChange}
          className="w-full rounded-lg border border-zinc-200 px-2 py-1 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      ) : (
        <span className="text-lg font-extrabold text-zinc-900">{value ?? '-'}</span>
      )}
    </div>
  )
}