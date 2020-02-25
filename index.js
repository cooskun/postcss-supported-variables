const postcss = require('postcss')
const { createSupportCondition } = require('./utils/create')
const { 
  isVariableProp,
  isVariableValue
} = require('./utils/checker')
const { 
  purifyVariableName,
  purifyVariableValue
} = require('./utils/format')

module.exports = postcss.plugin('postcss-real-variables', () => {

  const variables = {}

  const holder = {}

  return (root, result) => {    

    root.walkRules((rule, i) => {       
      
      rule.walkDecls((decl, i) => {   
        
        let supportMap = {}
        let fallbackMap = {}
        let ignore = false

        const { prop, value } = decl
        const variableProp = isVariableProp(prop)
        const variableValue = isVariableValue(value)
        
        // Only prop is variable
        if (variableProp && !variableValue) {
          const variableName = purifyVariableName(prop)
          variables[variableName] = value
          ignore = true
        }

        // Both prop and value is variable
        else if (variableProp && variableValue) {
          const variableName = purifyVariableName(prop)
          const variableValue = purifyVariableValue(value)
          const [requestedValue, fallbackValue] = variableValue
          ignore = true

          variables[variableName] = variables[requestedValue] ? variables[requestedValue] : fallbackValue
        }

        // Prop is static, value is variable
        else if (!variableProp && variableValue) {
          const variableValue = purifyVariableValue(value)
          const [requestedValue, fallbackValue] = variableValue
          supportMap[prop] = value
          fallbackMap[prop] = variables[requestedValue] ? variables[requestedValue] : fallbackValue
          
          decl.remove()        
        }

        // Both is static
        else if (!variableProp && !variableValue) {
          ignore = true
        }

        if (!ignore) {
          holder[rule.selector] = {
            support: supportMap,
            fallback: fallbackMap
          }
        }                

      })      
      
    })

    // I have a holder map that keeps supports and fallbacks
    // Loop inside holder, create support and fallback block of them
    // In each loop render them into root
    
    for (rule in holder) { 
      const [support, fallback] = createSupportCondition(rule)

      for (decl in holder[rule]['support']) {
        const newDecl = postcss.decl({
          prop: decl,
          value: holder[rule]['support'][decl]
        })

        support.nodes[0].append(newDecl)
      }

      for (decl in holder[rule]['fallback']) {
        const newDecl = postcss.decl({
          prop: decl,
          value: holder[rule]['fallback'][decl]
        })

        fallback.nodes[0].append(newDecl)
      }

      root.append(support)
      root.append(fallback)
    }

  }
})