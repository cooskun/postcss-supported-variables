const postcss = require('postcss')

const createSupportRule = () => postcss.rule({
  selector: '@supports (--var: 0)'
})

const createNotSupportrule = () => postcss.rule({
  selector: '@supports not (--var: 0)'
})

const createSupportCondition = selector => {
  const support = createSupportRule()
  const fallback = createNotSupportrule()

  /* const _support = support.append({ selector: selector })

  const _fallback = fallback.append({ selector: selector }) */

  /* return [_support, _fallback] */

  return [support, fallback]
}

module.exports = {
  createSupportRule,
  createNotSupportrule,
  createSupportCondition
}