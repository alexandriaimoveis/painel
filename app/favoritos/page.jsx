"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase/client"; // Verifique se este é o seu caminho correto do Supabase
import Sidebar from "../components/sidebar/page";
import { Loader2, Trash2, User, MapPin, DollarSign, Heart, Calendar } from "lucide-react";

export default function FavoritosPage() {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchFavoritos();
  }, []);

  async function fetchFavoritos() {
    setLoading(true);
    try {
      // 1. Limpa o estado anterior para evitar acúmulos na memória do React
      setFavoritos([]);

      // Puxa os favoritos cruzando diretamente com as tabelas de imóveis e clientes pelas FKs corretas
      const { data, error } = await supabase
        .from("favoritos")
        .select(`
          id,
          created_at,
          imovel_id,
          imoveis!imovel_id (
            id,
            codigo,
            titulo,
            tipo,
            finalidade,
            preco_venda,
            preco_aluguel,
            bairro,
            cidade
          ),
          clientes!cliente_id (
            id,
            nome,
            email,
            telefone
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const linhasValidas = data || [];

      // 2. Cria um mapa estático de contagem baseado estritamente nos dados do banco
      const contagemMapa = {};
      linhasValidas.forEach(item => {
        if (item.imovel_id) {
          contagemMapa[item.imovel_id] = (contagemMapa[item.imovel_id] || 0) + 1;
        }
      });

      // 3. Injeta a contagem matemática precisa em cada linha (CORRIGIDO AQUI)
      const favoritosComContagem = linhasValidas.map(item => ({
        ...item,
        totalFavoritos: contagemMapa[item.imovel_id] || 1
      }));

      setFavoritos(favoritosComContagem);
    } catch (error) {
      console.error("Erro ao buscar favoritos:", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveFavorito(id) {
    if (!confirm("Remover este imóvel da lista de desejos do cliente?")) return;

    try {
      const { error } = await supabase
        .from("favoritos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setMessage("Favorito removido com sucesso!");

      // Remove localmente do estado e recalcula as frequências para manter a tela atualizada
      setFavoritos((prev) => {
        const filtrados = prev.filter((item) => item.id !== id);

        const novoMapa = {};
        filtrados.forEach(item => {
          if (item.imovel_id) {
            novoMapa[item.imovel_id] = (novoMapa[item.imovel_id] || 0) + 1;
          }
        });

        return filtrados.map(item => ({
          ...item,
          totalFavoritos: novoMapa[item.imovel_id] || 1
        }));
      });

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      alert("Erro ao remover: " + error.message);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <div className="w-64 flex-shrink-0"><Sidebar /></div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-6">

          <header className="mb-8">
            <div className="flex items-center gap-2 text-[#E09C2D]">
              <Heart className="fill-current" size={24} />
              <h1 className="text-3xl font-black text-[#1D2D44] tracking-tight">
                Imóveis Favoritados
              </h1>
            </div>
            <p className="text-sm text-zinc-500 mt-1">
              Monitore os imóveis salvos pelos usuários do site para identificar potenciais leads.
            </p>
          </header>

          {message && (
            <div className="mb-6 rounded-xl p-4 text-sm font-semibold border bg-emerald-50 text-emerald-600 border-emerald-100">
              {message}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 size={36} className="text-[#E09C2D] animate-spin" />
              <p className="text-sm text-zinc-500 font-medium">Cruzando tabelas do banco de dados...</p>
            </div>
          ) : favoritos.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
              <p className="text-zinc-500 font-medium">Nenhum imóvel favoritado no site até o momento.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase text-[11px] font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Imóvel Favoritado</th>
                      <th className="px-6 py-4">Preço / Finalidade</th>
                      <th className="px-6 py-4">Interessado (Cliente)</th>
                      <th className="px-6 py-4"><span className="flex items-center gap-1"><Calendar size={13} /> Data</span></th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {favoritos.map((fav) => {
                      const imovel = fav.imoveis;
                      const cliente = fav.clientes;

                      // Pula a renderização se por acaso o imóvel associado tiver sido excluído do banco
                      if (!imovel) return null;

                      const precoExibicao = imovel.finalidade?.toLowerCase().includes("aluguel")
                        ? `R$ ${Number(imovel.preco_aluguel || 0).toLocaleString("pt-BR")}/mês`
                        : `R$ ${Number(imovel.preco_venda || 0).toLocaleString("pt-BR")}`;

                      return (
                        <tr key={fav.id} className="hover:bg-zinc-50/50 transition">
                          {/* Dados do Imóvel */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-[#E09C2D] uppercase tracking-wider">
                                  Código: {imovel.codigo || "N/A"}
                                </span>

                                {/* Badge de Contagem Real e Precisa baseada no item injetado */}
                                <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
                                  ★ {fav.totalFavoritos}x salvo
                                </span>
                              </div>

                              <span className="font-bold text-zinc-900 line-clamp-1 mt-1">
                                {imovel.titulo}
                              </span>
                              <span className="text-xs text-zinc-400 flex items-center gap-0.5 mt-0.5">
                                <MapPin size={12} /> {imovel.bairro}, {imovel.cidade}
                              </span>
                            </div>
                          </td>

                          {/* Preço */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-[#1D2D44] flex items-center gap-0.5 text-xs">
                                <DollarSign size={14} className="text-emerald-600" />
                                {precoExibicao}
                              </span>
                              <span className="text-[10px] uppercase font-bold text-zinc-400 mt-0.5">
                                {imovel.finalidade}
                              </span>
                            </div>
                          </td>

                          {/* Cliente */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col text-xs">
                              <span className="font-bold text-zinc-800 flex items-center gap-1">
                                <User size={12} className="text-zinc-400" />
                                {cliente?.nome || "Cliente Desconhecido"}
                              </span>
                              <span className="text-zinc-500 mt-0.5">{cliente?.email || "Sem e-mail"}</span>
                              <span className="text-zinc-600 font-semibold mt-0.5">{cliente?.telefone || "Sem telefone"}</span>
                            </div>
                          </td>

                          {/* Data */}
                          <td className="px-6 py-4 text-xs text-zinc-500 font-medium">
                            {new Date(fav.created_at).toLocaleDateString("pt-BR")}
                          </td>

                          {/* Ações */}
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleRemoveFavorito(fav.id)}
                              className="text-zinc-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition-colors cursor-pointer inline-flex"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}