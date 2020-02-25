const isVariableProp = prop => prop.indexOf('--') === 0

const isVariableValue = value => value.indexOf('var(') > -1

module.exports = {
  isVariableProp,
  isVariableValue
}