export async function GET(request) {
  return Response.json({ message: 'Hello from Next.js API!' })
}

export async function POST(request) {
  const body = await request.json()
  return Response.json({ received: body })
}
