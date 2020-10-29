import { Node, BinaryExpression } from '@babel/types'

export type ParseRequestResult = {
  type: string
  value: Node | string
}
const raw = (value: string) => ({ type: 'raw', value: value } as ParseRequestResult)

function parseRequestCore(node: Node): ParseRequestResult[] {
  if (!node) {
    return []
  }

  let output = []
  switch (node.type) {
    case 'BinaryExpression': {
      const { left, right } = node as BinaryExpression
      output = output.concat(parseRequest(left))
      output = output.concat(parseRequest(right))
      return output
    }
    case 'TemplateLiteral': {
      const { quasis, expressions } = node

      for (let i = 0; i < expressions.length; i++) {
        output = output.concat(parseRequest(quasis[i])).concat(parseRequest(expressions[i]))
      }

      return output.concat(parseRequest(quasis[expressions.length]))
    }
    case 'TemplateElement': {
      if (!node.value.raw) {
        return []
      }
      return [raw(node.value.raw)]
    }
    case 'StringLiteral': {
      if (!node.value) {
        return []
      }
      return [raw(node.value)]
    }
    case 'Identifier': {
      return [{ type: 'identifier', value: node.name }]
    }
    default: {
      return [{ type: node.type, value: node }]
    }
  }
}

export default function parseRequest(
  node: Parameters<typeof parseRequestCore>[0],
  { mergeRaw = false } = {}
): ReturnType<typeof parseRequestCore> {
  const result = parseRequestCore(node)
  if (!mergeRaw) {
    return result
  }

  return result.reduce((acc, item) => {
    if (item.type === 'raw') {
      const lastItem = acc[acc.length - 1]
      if (lastItem && lastItem.type === 'raw') {
        acc[acc.length - 1] = {
          type: 'raw',
          value: lastItem.value + item.value
        }
        return acc
      }
      return acc.concat(item)
    } else {
      return acc.concat(item)
    }
  }, [])
}
