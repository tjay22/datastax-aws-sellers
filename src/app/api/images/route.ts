export async function GET(request: Request) {
  const res = await fetch('http://52.12.156.81:8980/images', {
    headers: {
      'Content-Type': 'application/json'
    },
  })
  const data = await res.json()
 
  return Response.json({ data })
}