import Sidebar from "./components/sidebar/page";

export default function CadastrarClientes() {
  return (

    <div className="flex">
      <div className="flex-1/12">
        <Sidebar />
      </div>

      <div className="flex-10/12">
        <h1 className="text-4xl font-bold">CADASTRAR CLIENTES</h1>
      </div>
    </div>

  )
}