const postcss = require('postcss')
const { isVariableProp } = require('./utils/checker')
const {  } = require('./utils/create')

// Loop rules in root
// _ Loop declarations in rule
// __ Check if prop is variable in declarations
// ___ If it is add it to variables list
// __ Check if value is variable
// ___ If it is, pick it from variable list
//

module.exports = postcss.plugin('myplugin', () => {
  return (root, result) => {        

    const variables = {}

    // Example structure
    // Target rules object should look like this
    /* const rules = {
      '.button': {
        selector: '.button',
        standard: {
          display: 'inline-block'
        },
        support: {
          background: 'var(--bg)'
        },
        noSupport: {
          background: 'red'
        }
      }
    } */

    // Render from rules
    /* for (rule in rules) {
      let { selector, standard, support, noSupport } = rules[rule]

      const ruleSelector = postcss.rule({ selector })
      const supportSelector = postcss.rule({ selector: '@supports (--var: lorem)' })
      const noSupportSelector = postcss.rule({ selector: '@supports not (--var: lorem)' })
      const ruleSelectorForSupport = postcss.rule({ selector })
      const ruleSelectorForNoSupport = postcss.rule({ selector })

      for (prop in standard) {
        const decl = postcss.decl({ prop, value: standard[prop] })
        ruleSelector.append(decl)
      }

      for (prop in support) {
        const decl = postcss.decl({ prop, value: support[prop] })
        ruleSelectorForSupport.append(decl)        
      }

      for (prop in noSupport) {
        const decl = postcss.decl({ prop, value: noSupport[prop] })
        ruleSelectorForNoSupport.append(decl)        
      }
      
      supportSelector.append(ruleSelectorForSupport)
      noSupportSelector.append(ruleSelectorForNoSupport)
      
      root.append(ruleSelector)
      root.append(supportSelector)
      root.append(noSupportSelector)
    } */

    // let selector, selectorFallback

    root.walkRules((rule, i) => {
      selector = postcss.rule({ selector: rule.selector })
      selectorFallback = postcss.rule({ selector: rule.selector })      

      const supports = postcss.rule({
        selector: '@supports (--var: lorem)'
      })

      const notSupport = postcss.rule({
        selector: '@supports not (--var: lorem)'
      })      

      const declarations = {}
      const fallback = {}  

      rule.walkDecls(declaration => {
        // Check if prop or/and value is variable

        // Variable Prop
        if (declaration.prop.indexOf('--') === 0) {
          // Prop is variable, check for value
          
          // Clean '--' and get pure variable name
          const prop = declaration.prop.replace('--', '')     
          
          if (declaration.value.indexOf('var(') === -1) {
            // Only prop is variable, value is static
            // --bg: red; for example
            // Add prop name to variable list with given static value
            // Variable list { bg: red }
            variables[prop] = declaration.value            
          }
          
          else {            
            // Both prop and value is variable
            // --bg: var(--red);

            // Clean and get pure used variable name as value : red
            // Split returned varible name and see if there is a static callback value
            // --bg: var(--red, red) for example 
            let value = declaration.value.replace('var(--', '').replace(')', '').split(',')

            // If used variable as value exist on variable list ->
            // -> Redefine prop variable with value variable
            // Variables : { bg: *red*, red: *red* }
            if (variables[value[0]]) {
              variables[prop] = variables[value[0]]
            } 
            
            // Used variable value not exist on variable list
            // This mean variable is undefined
            // Use static callback value if one exist
            else if (value[1]) {
              variables[prop] = value[1]
              variables[value[0]] = value[1]
            }
          }      

          
        }

        // Variable Value
        else if (declaration.value.indexOf('var(') !== -1) {

          // Add prop to declaratations object as key          

          // Only value is variable
          // background-color: var(--bg) for example
          // Clean and get pure css variable name
          // Split if there is static callback value
          // var(--bg, red) for example
          let value = declaration.value.replace('var(--', '').replace(')', '').split(',')                    
          
          if (variables[value[0]]) {            
            // Get variable value from variables and set it to prop
            // color: var(--bg);
            // color: variables[bg];
            // color: red;
          }
          else if (value[1]) {
            // Requested variable not exist on variable list
            // Create it with given static callback value
            variables[value[0]] = value[1].trim()

            // Add styles, see on above if scope
          }

          fallback[declaration.prop] = variables[value[0]];
          declarations[declaration.prop] = declaration.value;
        }

        /* if (declaration.prop.indexOf('--') === -1) {
          declarations[declaration.prop] = declaration
        } */
        
      })       

      for (prop in declarations) {
        const decl = postcss.decl({ prop, value: declarations[prop] })
        selector.append(decl)
        // supports.append({ prop, value: declarations[prop] }) 
      }

      for (prop in fallback) {
        const decl = postcss.decl({ prop, value: declarations[prop] })
        selectorFallback.append(decl)
        // notSupport.append({ prop, value: fallback[prop] })
      }

      supports.append(selector)
      notSupport.append(selectorFallback)

      root.append(supports)
      root.append(notSupport)
          
      /* nodes.map(declaration => {
        const { prop, value } = declaration

        if (prop.indexOf('--') === 0) {
          supports = postcss.rule({ selector: '@supports (--var: 1)' })
          notsupport = postcss.rule({ selector: '@supports not (--var: 1)' })
          supports.append({ prop, value })
          notsupport.append({ prop, value })
          rule.append(supports)
        }                
      }) */         
    })
  }
})