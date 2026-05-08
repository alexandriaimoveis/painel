"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  UserSquare2, 
  LogOut 
} from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()

  const menuItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Imóveis", href: "/imoveis", icon: Building2 },
    { name: "Clientes", href: "/clientes", icon: Users },
    { name: "Corretores", href: "/corretores", icon: UserSquare2 },
  ]

  const brandColor = "#E09C2D" 

  return (
    <aside className="w-64 bg-[#F1F0E9] text-[#1D2D44] px-4 py-8 h-screen flex flex-col border-r border-gray-200">
      <div className="flex justify-center mb-12">
        <Image 
          src="/logo.png"
          alt="Alexandria Negócios Imobiliários" 
          width={180} 
          height={80} 
          priority
          className="object-contain"
        />
      </div>
      
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`
                flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? "bg-[#E09C2D] text-white shadow-md ring-2 ring-[#E09C2D] ring-offset-2 ring-offset-[#F1F0E9]" 
                  : "text-[#1D2D44] hover:bg-[#E09C2D] hover:text-white hover:ring-2 hover:ring-[#E09C2D] hover:ring-offset-2 hover:ring-offset-[#F1F0E9]"}
              `}
            >
              <item.icon 
                size={22} 
                className={`transition-colors ${isActive ? "text-white" : "text-[#546A7B] group-hover:text-white"}`} 
              />
              <span className="font-semibold text-lg">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-200">
        <Link 
          href="/login" 
          className="flex items-center gap-3 p-3 rounded-xl text-[#546A7B] hover:bg-gray-100 hover:text-[#1D2D44] transition-colors group"
        >
          <LogOut size={22} className="text-[#546A7B] group-hover:text-[#1D2D44]" />
          <span className="font-semibold text-lg">Sair</span>
        </Link>
      </div>
    </aside>
  )
}