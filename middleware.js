import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Recupera o usuário atual
  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // LISTA DE PROTEÇÃO: Se não houver usuário e ele tentar acessar essas pastas
  const protectedPaths = ['/imoveis', '/corretores', '/clientes', '/api']
  const isProtected = protectedPaths.some(path => url.pathname.startsWith(path))

  if (isProtected && !user) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Se já estiver logado e tentar ir para o login, manda para os imóveis
  if (user && url.pathname === '/login') {
    url.pathname = '/imoveis'
    return NextResponse.redirect(url)
  }

  return response
}

// O matcher diz ao Next.js em quais arquivos o middleware deve rodar
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}