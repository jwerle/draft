/**
 * Module dependencies
 */
var define   = Object.defineProperty
	,	freeze   = Object.freeze
	,	isFrozen = Object.isFrozen
	,	isArray  = Array.isArray

/**
 * Merges two or more objects together. Also performs deep merging
 *
 * @see http://stackoverflow.com/a/383245/1408668
 * @api private
 * @param {Object} object 
 * @param {Object} objectN
 */
function merge(obj1, obj2) {

  for (var p in obj2) {
    try {
      // Property in destination object set; update its value.
      if ( obj2[p].constructor==Object ) {
        obj1[p] = merge(obj1[p], obj2[p]);

      } else {
        obj1[p] = obj2[p];

      }

    } catch(e) {
      // Property in destination object not set; create it and set its value.
      obj1[p] = obj2[p];

    }
  }

  return obj1;
}
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
 * @api private
 * @param {Mixed} input
 */
function isFunction (input) {
	return (typeof input === 'function');
}

/**
 * Checks whether the input is a string
 *
 * @api private
 * @param {Mixed} input
 */
function isString (input) {
	return (typeof input === 'string');
}

/**
 * Converts an array like object to an array
 *
 * @api private
 * @param {Mixed} input
 */
function toArray (input) {
	return Array.prototype.slice.call(arguments, 0);
}

/**
 * Exports
 */
module.exports.Schema = Schema
module.exports.Tree   = Tree;
module.exports.Type   = Type;
module.exports.Model  = Model;

/**
 * Creats an object schema
 *
 * @constructor Schema
 * @api public
 * @param {Object} definiton
 * @param {Object} options
 */
function Schema (definiton, options) {
	// we must use plain objects
	if (definiton !== undefined && !isPlainObject(definiton)) throw new TypeError("Schema only expects an object as a definiton");
	// create tree instance with an empty object
	this.tree = new Tree({});
	// add definiton to tree
	this.add(definiton);
	// attach options
	this.options = merge({ strict : true}, isPlainObject(options)? options : {});
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
 *
 */
Schema.prototype.createModel = function () {
	var self = this
	function InstanceModel () {
		return Model.apply(this, arguments); 
	}
	InstanceModel.prototype = Object.create(Model.prototype);
	InstanceModel.prototype.schema = this;
	return InstanceModel
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
	if (object !== undefined && !isPlainObject(object)) throw new TypeError("Tree only expects an object");
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
	// are they just passing in an object as one big descriptor?
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
		else if (isString(parent) && key) {
			descriptor = key
			key = parent;
			this.add(this, key, descriptor);
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
	// ensure creation of Type
	if (!(this instanceof Type)) return new Type(Constructor, descriptor);
	// ensure descriptor object
	descriptor = (typeof descriptor === 'object')? descriptor : {};
	if (!isFunction(Constructor)) throw new TypeError("Type only expects a function");
	// set the constructor for reference
	this.Constructor = Constructor;
	// remove type property from the descriptor if it was set there
	delete descriptor.type;
	// check for getter
	if (isFunction(descriptor.get)) (this.get = descriptor.get) && delete descriptor.get;
	// check for setter
	if (isFunction(descriptor.set)) (this.set = descriptor.set) && delete descriptor.set;
	// check if the values of this property are enumerable
	if (isArray(descriptor.enum)) (this.enum = descriptor.enum) && delete descriptor.enum;
	// check if strict mode
	if (descriptor.strict) (this.strict = descriptor.strict) && delete descriptor.strict;
}

/**
 * Default getter that coerces a value
 *
 * @api public
 * @function Type#get
 * @param {Mixed} value
 */
Type.prototype.get = function (value) {
	return this.coerce(value);
};

/**
 * Default setter that coerces a value
 *
 * @api public
 * @function Type#set
 * @param {Mixed} value
 */
Type.prototype.set = function (value) {
	return this.coerce(value);
};

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
	if (typeof input === 'object' && this.Constructor !== Object)
		return (input instanceof this.Constructor);
	// check input for primitive types
	switch (typeof input) {
		case 'string':   Constructor = String;   break;
		case 'function': Constructor = Function; break;
		case 'boolean':  Constructor = Boolean;  break;
		case 'object':   Constructor = Object;   break;
		case 'number':   Constructor = Number;   break;
	}
	// compare Type Constructor with input Constructor
	return this.Constructor === Constructor;
};

/**
 * Coerces a given input with the set Constructor type
 *
 * @api public
 * @function Type#coerce
 * @param {Mixed} input
 */
Type.prototype.coerce = function (input) {
	return this.Constructor(input)
};

/**
 * Base constructor for all created Model instances
 *
 * @constructor Model
 * @api public
 * @param {Object} data
 */
function Model (data) {
	var self = this
	/** internal memory **/
	var table = {};
	// ensure an object if not undefined
	if (data !== undefined && typeof data !== 'object') throw new TypeError("Modele expects an object");
	// ensure the schema set
	if (!this.schema || !(this.schema instanceof Schema)) throw new TypeError(".schema hasn't been set");

	var set = function (data, tree, object) {
		tree = (tree instanceof Tree)? tree : self.schema.tree;
		object = (typeof object === 'object')? object : this;
		for (var prop in data) {
			// encapsulate each iteration in a scope
			!function (prop) {
				// if not in tree, return and continue on
				if (!tree[prop]) return;
				// if the property is an object, check if the tree property
				// is a Tree instance object too
				if (typeof data[prop] === 'object' && tree[prop] instanceof Tree) {
					// define setter for object
					define(data[prop], 'set', {
						writable : false,
						enumerable : false,
						configurable : false,
						value : function (value) { object[prop] = value; }
					});
					// define getter for object
					define(data[prop], 'get', {
						writable : false,
						enumerable : false,
						configurable : false,
						value : function () { return object[prop] }
					});

					this.set(data[prop], tree[prop], object[prop]);
				}
				// we've reached some kind of scalar value 
				// that exists in the schema tree and the object
				else {
					object[prop] = data[prop];
				}
			}.call(this, prop);
		}
	}.bind(this);
	// overload refresh method on prototype
	var refresh = function () {
		if (isFrozen(this)) return false;
		var defineFromTree = function (tree, scope, table) {
			var item
			for (item in tree) {
				!function (item) {
					if (tree[item] instanceof Type) {
						table[item] = table[item] || undefined;
						define(scope, item, {
							configurable : false,
							enumerable : true,
							get : function () { 
								return table[item]? tree[item].get(table[item]) : undefined; 
							},
							set : function (value) {
								if (tree[item].validate(value))
									table[item] = tree[item].set(value);
							}
						});
					}
					else if (tree[item] instanceof Tree) {
						table[item] = table[item] || {};						
						scope[item] = {};
						defineFromTree.call(self, tree[item], scope[item], table[item]);
					}
				}.call(self, item);
			}
		}.bind(this);
		// define
		defineFromTree(self.schema.tree, this, table);
		// free if in strict mode
		if (this.schema.options.strict) freeze(this);
	};
	// overload set method on prototype
	define(this, 'set', {
		configurable : false,
		enumerable : false,
		writable : false,
		value : set
	 });

	define(this, 'refresh', {
		configurable : false,
		enumerable : false,
		writable : false,
		value : refresh
	 });
	// call a refresh to init schema
	this.refresh();
	// set  data
	data && this.set(data);
}

/**
 * A reference to the schema instance for the model
 *
 * @api public
 * @property {Schema} schema
 */
Model.prototype.schema;

/**
 *
 */
Model.prototype.refresh = function () {};

/**
 * Sets data on the model based on the schema
 *
 * @api public
 * @function Model#set
 * @param {Object} data
 */
Model.prototype.set = function () {};