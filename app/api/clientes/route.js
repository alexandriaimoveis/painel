import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    const { data, error } = await supabase
      .from('clientes')
      .insert([body])
      .select()

    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ success: true, data })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, created_at, ...updates } = body 

    if (!id) {
      return Response.json({ error: "ID não fornecido." }, { status: 400 })
    }

    const { error } = await supabase
      .from('clientes')
      .update(updates)
      .eq('id', id)

    if (error) return Response.json({ error: error.message }, { status: 400 })
    
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}