import Link from "next/link"

export default function Sidebar() {
  return (
    <section className="bg-black text-white px-2 py-4 h-screen flex flex-col">
      <h3 className="pb-6 font-bold text-2xl">MENU</h3>
      
      <ul className="flex-1 space-y-2">
        <li>
          <Link href="/" className="flex items-center p-2 hover:bg-gray-700 rounded">
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link href="/cadastrar-imovel" className="flex items-center p-2 hover:bg-gray-700 rounded">
            <span>Cadastrar Imóvel</span>
          </Link>
        </li>
        <li>
          <Link href="/cadastrar-clientes" className="flex items-center p-2 hover:bg-gray-700 rounded">
            <span>Cadastrar Clientes</span>
          </Link>
        </li>
        <li>
          <Link href="/perfil" className="flex items-center p-2 hover:bg-gray-700 rounded">
            <span>Perfil</span>
          </Link>
        </li>
      </ul>

      <div className="mt-auto pt-4 border-t border-gray-700">
        <Link href="/" className="flex items-center p-2 hover:bg-gray-700 rounded">
          <span>Sair</span>
        </Link>
      </div>
    </section>
  )
}
