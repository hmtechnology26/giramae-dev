import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Autenticação básica via Supabase
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')

    const token = authHeader.replace('Bearer ', '')
    console.log('🔐 Token recebido (primeiros 20 chars):', token.substring(0, 20))

    // 2. Configuração do R2
    const accountId = Deno.env.get('R2_ACCOUNT_ID')
    const accessKeyId = Deno.env.get('R2_ACCESS_KEY_ID')
    const secretAccessKey = Deno.env.get('R2_SECRET_ACCESS_KEY')

    if (!accountId || !accessKeyId || !secretAccessKey) {
      console.error('❌ Variáveis R2 não configuradas:', { 
        hasAccountId: !!accountId, 
        hasAccessKeyId: !!accessKeyId, 
        hasSecretAccessKey: !!secretAccessKey 
      })
      throw new Error('R2 credentials not configured')
    }

    // 3. Recebimento dos dados
    const { action, key, bucket, contentType } = await req.json()
    console.log('📦 Request:', { action, bucket, key, contentType })

    if (!bucket) throw new Error('Bucket missing')
    if (!key) throw new Error('Key missing')

    // 4. Buckets permitidos — carregados do .env automaticamente
    const allowedBucketsEnv = Deno.env.get('R2_ALLOWED_BUCKETS') ?? ''
    const allowed = allowedBucketsEnv
      .split(',')
      .map((b) => b.trim())
      .filter((b) => b.length > 0)

    console.log('🪣 Buckets permitidos:', allowed)

    if (allowed.length > 0 && !allowed.includes(bucket)) {
      throw new Error(`Bucket not allowed: ${bucket}`)
    }

    // 5. Converter para PATH RELATIVO (obrigatório)
    const cleanedKey = cleanKey(key)
    console.log('🔑 Key limpa:', cleanedKey)

    // 6. Gerar URL de upload usando AWS Signature V4 manualmente
    if (action === 'upload') {
      const signedUrl = await generatePresignedUrl({
        accountId,
        accessKeyId,
        secretAccessKey,
        bucket,
        key: cleanedKey,
        contentType: contentType || 'image/jpeg',
        expiresIn: 300,
        method: 'PUT'
      })

      console.log('✅ URL assinada gerada para upload')

      return new Response(
        JSON.stringify({
          uploadUrl: signedUrl,
          key: cleanedKey,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // 7. Deletar arquivo
    if (action === 'delete') {
      const endpoint = `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${cleanedKey}`
      
      const headers = await signRequest({
        method: 'DELETE',
        url: endpoint,
        accessKeyId,
        secretAccessKey,
        region: 'auto',
        service: 's3'
      })

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers
      })

      if (!response.ok && response.status !== 404) {
        throw new Error(`Failed to delete: ${response.status}`)
      }

      console.log('✅ Arquivo deletado:', cleanedKey)

      return new Response(
        JSON.stringify({ success: true, key: cleanedKey }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      )
    }

    throw new Error('Invalid action')

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('❌ Erro na Edge Function storage-r2:', errorMessage)
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
  }
})

/**
 * Remove domínio e devolve só o path relativo
 */
function cleanKey(input: string): string {
  try {
    if (input.startsWith('http')) {
      const url = new URL(input)
      return url.pathname.replace(/^\/+/, '')
    }
    return input.replace(/^\/+/, '')
  } catch {
    return input.replace(/^\/+/, '')
  }
}

/**
 * Gera URL pré-assinada para upload no R2 usando AWS Signature V4
 */
async function generatePresignedUrl(params: {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  key: string
  contentType: string
  expiresIn: number
  method: string
}): Promise<string> {
  const { accountId, accessKeyId, secretAccessKey, bucket, key, contentType, expiresIn } = params
  
  const host = `${accountId}.r2.cloudflarestorage.com`
  const endpoint = `https://${host}/${bucket}/${key}`
  
  const now = new Date()
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dateStamp = amzDate.substring(0, 8)
  const region = 'auto'
  const service = 's3'
  
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`
  const credential = `${accessKeyId}/${credentialScope}`
  
  const queryParams = new URLSearchParams({
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': credential,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': expiresIn.toString(),
    'X-Amz-SignedHeaders': 'content-type;host',
  })
  
  // Canonical request
  const canonicalUri = `/${bucket}/${key}`
  const canonicalQuerystring = queryParams.toString().split('&').sort().join('&')
  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\n`
  const signedHeaders = 'content-type;host'
  const payloadHash = 'UNSIGNED-PAYLOAD'
  
  const canonicalRequest = [
    'PUT',
    canonicalUri,
    canonicalQuerystring,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n')
  
  // String to sign
  const canonicalRequestHash = await sha256Hex(canonicalRequest)
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    canonicalRequestHash
  ].join('\n')
  
  // Signing key
  const kDate = await hmacSha256(`AWS4${secretAccessKey}`, dateStamp)
  const kRegion = await hmacSha256(kDate, region)
  const kService = await hmacSha256(kRegion, service)
  const kSigning = await hmacSha256(kService, 'aws4_request')
  
  // Signature
  const signature = await hmacSha256Hex(kSigning, stringToSign)
  
  queryParams.set('X-Amz-Signature', signature)
  
  return `${endpoint}?${queryParams.toString()}`
}

/**
 * Assina requisição para operações diretas (DELETE)
 */
async function signRequest(params: {
  method: string
  url: string
  accessKeyId: string
  secretAccessKey: string
  region: string
  service: string
}): Promise<Headers> {
  const { method, url, accessKeyId, secretAccessKey, region, service } = params
  
  const parsedUrl = new URL(url)
  const host = parsedUrl.host
  const path = parsedUrl.pathname
  
  const now = new Date()
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dateStamp = amzDate.substring(0, 8)
  
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`
  
  // Canonical request
  const canonicalHeaders = `host:${host}\nx-amz-date:${amzDate}\n`
  const signedHeaders = 'host;x-amz-date'
  const payloadHash = await sha256Hex('')
  
  const canonicalRequest = [
    method,
    path,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n')
  
  // String to sign
  const canonicalRequestHash = await sha256Hex(canonicalRequest)
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    canonicalRequestHash
  ].join('\n')
  
  // Signing key
  const kDate = await hmacSha256(`AWS4${secretAccessKey}`, dateStamp)
  const kRegion = await hmacSha256(kDate, region)
  const kService = await hmacSha256(kRegion, service)
  const kSigning = await hmacSha256(kService, 'aws4_request')
  
  // Signature
  const signature = await hmacSha256Hex(kSigning, stringToSign)
  
  const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
  
  return new Headers({
    'Host': host,
    'X-Amz-Date': amzDate,
    'Authorization': authHeader
  })
}

// Crypto helpers using Web Crypto API (Deno compatible)
async function sha256Hex(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  return arrayBufferToHex(hashBuffer)
}

async function hmacSha256(key: string | ArrayBuffer, data: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const keyBuffer = typeof key === 'string' ? encoder.encode(key) : key
  const dataBuffer = encoder.encode(data)
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  return await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer)
}

async function hmacSha256Hex(key: ArrayBuffer, data: string): Promise<string> {
  const result = await hmacSha256(key, data)
  return arrayBufferToHex(result)
}

function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
