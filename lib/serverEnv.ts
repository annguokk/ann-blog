import 'dotenv/config'

function required(name: string) {
  const v = process.env[name]?.trim()
  if (!v) throw new Error(`缺少环境变量: ${name}`)
  return v
}

export const DATABASE_URL = required('DATABASE_URL')