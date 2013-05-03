/**
 * Module dependencies
 */
var Model = require('./model').Model

// alias
var define = Object.defineProperty

/**
 * Checks whether the input is a plain object
 *
 * @api private
 * @param {Mixed} input
 */
function isPlainObject (input) {
	if (typeof input !== 'object') return false;
	else if (input === null) return false;
	else if (input.__proto__ !== Object.prototype) return false;
	else return true;
}

/**
 * Checks whether the input is a function
 *
 * @api priavte
 * @param {Mixed} input
 */
function isFunction (input) {
	return (typeof input === 'function');
}

/**
 * Exports
 */
module.exports.Schema = Schema
module.exports.Tree   = Tree;
module.exports.Type   = Type;

/**
 * Creats an object schema
 *
 * @constructor Schema
 * @api public
 * @param {Object} definiton
 */
function Schema (definiton) {
	// we must use plain objects
	if (!isPlainObject(definiton)) throw new TypeError("Schema only expects an object as a definiton");
	// create tree instance with an empty object
	this.tree = new Tree({});
	// add definiton to tree
	this.add(definiton);
}

/**
 * Adds an object to the schema tree
 *
 * @api public
 * @function Schema#add
 * @see Tree#add
 */
Schema.prototype.add = function () {
	this.tree.add.apply(this.tree, arguments);
};

/**
 * Creates an object tree for a schema.
 * This is used for aggregating types
 *
 * @constructor Tree
 * @api public
 * @param {Object} object
 */
function Tree (object) {
	// ensure we have an object
	if (!isPlainObject(object)) throw new TypeError("Tree only expects an object");
	else this.add(object);
}

/**
 * Adds a key to the tree on a given parent tree. 
 * Defaults to 'this' as the parent if one is not provided.
 *
 * @api public
 * @function Tree#add
 * @param {Tree} parent
 * @param {String} key
 * @param {Object} descriptor
 */
Tree.prototype.add = function (parent, key, descriptor) {
	// are they just passing in an object for a recursive add?
	if (typeof parent === 'object' && arguments.length === 1) {
		for (var prop in parent) {
			this.add(this, prop, parent[prop]);
		}
	}
	else {
		// is this a reference to a child tree?
		if (parent instanceof Tree) {
			if (isPlainObject(descriptor)) {
				if (isFunction(descriptor.type)) {
					this[key] = new Type(descriptor.type, descriptor);
				}
				else {
					this[key] = new Tree(descriptor);
				}
			}
			else if (isFunction(descriptor)) {
				this[key]	= new Type(descriptor);
			}
		}
	}
};

/**
 * Creates a Type used in a Tree instance for a 
 * Schema instance. It is meant to provide methods
 * for validation and coercion.
 *
 * @constructor Type
 * @api public
 * @param {Function} Constructor
 */
function Type (Constructor, descriptor) {
	if (!isFunction(Constructor)) throw new TypeError("Type only expects a function");
	// set the constructor for reference
	this.Constructor = Constructor;
}

/**
 * Validates a defined type. 
 * It performs instance of checks on values that are not primitive.
 * Primitive inputs are validated with a 'typeof' check
 *
 * @api public
 * @function Type#validate
 * @param {Mixed} input
 */
Type.prototype.validate = function (input) {
	var Constructor
	if (typeof input === 'object' && this.Constructor !== Object) {
		return (input instanceof this.Constructor);
	}
	else {
		switch (typeof input) {
			case 'string':   Constructor = String;   break;
			case 'function': Constructor = Function; break;
			case 'boolean':  Constructor = Boolean;  break;
			case 'object':   Constructor = Object;   break;
		}

		// compare Type Constructor with input Constructor
		return this.Constructor === Constructor;
	}

	return false;
}