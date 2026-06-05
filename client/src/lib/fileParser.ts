export async function parseTxt(file: File): Promise<string> {
  return file.text()
}

export async function parseDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth')
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}

export async function parseFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext === 'txt') return parseTxt(file)
  if (ext === 'docx') return parseDocx(file)
  throw new Error(`不支持的文件格式: .${ext}，请上传 .txt 或 .docx 文件`)
}
