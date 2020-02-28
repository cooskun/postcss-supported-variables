const postcss = require('postcss')
const { createSupportCondition } = require('./utils/create')
const { checkIfVariableProp, checkIfVariableValue } = require('./utils/checker')
const { purifyVariableName, purifyVariableValue } = require('./utils/format')

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
        const isVariableProp = checkIfVariableProp(prop)
        const isVariableValue = checkIfVariableValue(value)
        
        // Only prop is variable
        if (isVariableProp && !isVariableValue) {
          const name = purifyVariableName(prop)
          variables[name] = value
          ignore = true
        }

        // Both prop and value is variable
        else if (isVariableProp && isVariableValue) {
          const name = purifyVariableName(prop)
          const _value = purifyVariableValue(value)
          const [variable, fallback] = _value
          ignore = true

          variables[name] = variables[variable] ? variables[variable] : fallback
        }

        // Prop is static, value is variable
        else if (!isVariableProp && isVariableValue) {          
          const _value = purifyVariableValue(value)
          const [variable, fallback] = _value
          supportMap[prop] = value
          fallbackMap[prop] = variables[variable] ? variables[variable] : fallback
          
          decl.remove()        
        }

        // Both is static
        else if (!isVariableProp && !isVariableValue) {
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
    
    const [support, fallback] = createSupportCondition()

    for (rule in holder) { 
      //const [support, fallback] = createSupportCondition(rule)

      for (decl in holder[rule]['support']) {
        const newDecl = postcss.decl({
          prop: decl,
          value: holder[rule]['support'][decl]
        })

        support.append(postcss.rule({ selector: rule }))
        const index = support.nodes.length - 1
        support.nodes[index].append(newDecl)
      }

      for (decl in holder[rule]['fallback']) {
        const newDecl = postcss.decl({
          prop: decl,
          value: holder[rule]['fallback'][decl]
        })

        fallback.append(postcss.rule({ selector: rule }))
        const index = fallback.nodes.length - 1
        fallback.nodes[index].append(newDecl)
      }

    }

    root.append(support)
    root.append(fallback)


  }
})