import { GlobalConfig } from '../../app.config'

export async function GET(request: Request) {
  const res = await fetch(GlobalConfig.apiURL, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json'
    },
  })
  const data = await res.json()
 
  return Response.json({ data })
}