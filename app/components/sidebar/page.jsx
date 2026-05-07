import Link from "next/link"
import Image from "next/image"

export default function Sidebar() {
  return (
    <section className="bg-black text-white px-2 py-4 h-screen flex flex-col overflow-y-auto">
      <Image src="/logo.png" alt="Logo" width={150} height={50} className="p-2 mb-6" />
      
      <ul className="flex-1 space-y-2">
        <li>
          <Link href="/" className="flex items-center p-2 hover:bg-gray-700 rounded">
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link href="/imoveis" className="flex items-center p-2 hover:bg-gray-700 rounded">
            <span>Imóveis</span>
          </Link>
        </li>
        <li>
          <Link href="/clientes" className="flex items-center p-2 hover:bg-gray-700 rounded">
            <span>Clientes</span>
          </Link>
        </li>
        <li>
          <Link href="/corretores" className="flex items-center p-2 hover:bg-gray-700 rounded">
            <span>Corretores</span>
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
