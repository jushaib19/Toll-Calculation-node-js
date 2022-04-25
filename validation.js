let _ajv = require ('ajv');
let _ = require ('lodash');
let schema = require ('./config/schema.json')

const ajv = new _ajv({allErrors:true , useDefaults: true});

function getValidator(schemaName){
  let validate = ajv.getSchema(schemaName)
  if (!validate) {
    ajv.addSchema(schema[schemaName], schemaName)
    validate = ajv.getSchema(schemaName)
  }
  return validate;
}

module.exports = {
 verifySchema : function (schemaName, requestedJSON)  {
  let result = {};

  try {
    const validate = getValidator(schemaName) 
    const valid = validate(requestedJSON);
    if (!valid) {
      result = {
        success: false,
        message: _.map(validate.errors, function (er) {
          return er.message;
        }),
      };
    } else {
    
      result = {
        success: true,
        message: 'requested JSON is valid',
      };
    }
  } catch (err) {
    result = {
      success: false,
      message: err,
    };
  }
  return result;
}
}
