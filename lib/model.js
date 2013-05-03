/**
 * Module dependencies
 */
var Schema = require('./schema').Schema

/**
 * Exports
 */
module.exports.Model = Model;

function Model (data) {
	// ensure an object if not undefined
	if (data !== undefined && typeof data !== 'object')
		throw new TypeError("Modele expects an object");

	// ensure the schema set
	if (! (this.schema instanceof Schema))
		throw new TypeError(".schema hasn't been set");
}

/**
 * A reference to the schema instance for the model
 */
Model.prototype.schema;