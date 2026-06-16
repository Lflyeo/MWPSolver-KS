const IMAGE_CONTENT_RE = /^!\[[^\]]*\]\([^)]+\)\s*$/;
const IMAGE_URL_RE = /!\[[^\]]*\]\(([^)]+)\)/;

/** 从题目内容中提取图片 URL（若为纯图片题目） */
export function extractQuestionImageUrl(content: string): string | null {
  const trimmed = content.trim();
  if (!IMAGE_CONTENT_RE.test(trimmed) && !trimmed.includes('![')) return null;
  const match = trimmed.match(IMAGE_URL_RE);
  return match?.[1] ?? null;
}

/** 判断是否为图片题目 */
export function isImageQuestionContent(content: string): boolean {
  const url = extractQuestionImageUrl(content);
  if (!url) return false;
  const withoutImage = content.replace(/!\[[^\]]*\]\([^)]+\)/g, '').replace(/\*\*【题目】\*\*/g, '').trim();
  return withoutImage.length === 0;
}

/** 将常规数学写法转为可渲染的 Markdown + KaTeX */
export function formatQuestionContent(raw: string): string {
  const text = raw.trim();
  if (!text) return text;
  if (isImageQuestionContent(text) || text.startsWith('![')) return text;

  const segments: string[] = [];
  const latexBlockRe = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = latexBlockRe.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push(convertPlainMathSegment(text.slice(lastIndex, match.index)));
    }
    segments.push(match[0]);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push(convertPlainMathSegment(text.slice(lastIndex)));
  }

  return segments.join('').trim();
}

function convertPlainMathSegment(segment: string): string {
  let result = segment;

  // 数字/数字 分数，如 3/5
  result = result.replace(/(?<![\d$/\\])(\d{1,3})\/(\d{1,3})(?![\d/])/g, (_, a, b) => `$\\frac{${a}}{${b}}$`);

  // 字母指数 x^2
  result = result.replace(/(?<!\$)([a-zA-Z])\^(\d+)(?!\$)/g, (_, v, p) => `$${v}^{${p}}$`);

  // sqrt(2)
  result = result.replace(/(?<!\$)sqrt\(([^)]+)\)(?!\$)/gi, (_, inner) => `$\\sqrt{${inner}}$`);

  // 常用 Unicode 数学符号旁的数字组合
  result = result.replace(/(\d+)\s*×\s*(\d+)/g, (_, a, b) => `$${a} \\times ${b}$`);
  result = result.replace(/(\d+)\s*÷\s*(\d+)/g, (_, a, b) => `$${a} \\div ${b}$`);

  return result;
}

/** 构建图片题目内容 */
export function buildImageQuestionContent(imageUrl: string): string {
  return `**【题目】**\n\n![题目图片](${imageUrl})`;
}
