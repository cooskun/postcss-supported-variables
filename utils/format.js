const purifyVariableName = variable => variable.replace('--', '')

const purifyVariableValue = value => value.replace('var(--', '').replace(')', '').split(',')

module.exports = { 
  purifyVariableName,
  purifyVariableValue
}