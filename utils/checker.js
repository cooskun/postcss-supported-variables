const checkIfVariableProp = prop => prop.indexOf('--') === 0

const checkIfVariableValue = value => value.indexOf('var(') > -1

module.exports = {
  checkIfVariableProp,
  checkIfVariableValue
}