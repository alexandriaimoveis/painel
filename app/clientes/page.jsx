import Sidebar from "../components/sidebar/page";

export default function CadastrarClientes() {
  return (

    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <div className="w-72 flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-black">
        <div className="mx-auto max-w-6xl p-6">
          <h1 className="mb-6 text-2xl font-semibold text-zinc-800">Cadastro de Clientes</h1>
        </div>
      </div>
    </div>

  )
}