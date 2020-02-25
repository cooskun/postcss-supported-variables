const postcss = require('postcss')

const createSupportRule = () => postcss.rule({
  selector: '@supports (--var: lorem)'
})

const createNotSupportrule = () => postcss.rule({
  selector: '@supports not (--var: lorem)'
})

const createSupportCondition = selector => {
  const support = createSupportRule()
  const fallback = createNotSupportrule()

  const _support = support.append({ selector: selector })

  const _fallback = fallback.append({ selector: selector })

  return [_support, _fallback]
}

module.exports = {
  createSupportRule,
  createNotSupportrule,
  createSupportCondition
}