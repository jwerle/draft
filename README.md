draft 
=====

[![draft](http://www.inkity.com/shirtdesigner/prints/clipArt1/S6881113.png)]()

Give your object and models schemas

--

[![Build Status](https://travis-ci.org/jwerle/draft.png?branch=master)](https://travis-ci.org/jwerle/draft)

[![browser support](https://ci.testling.com/jwerle/draft.png)](https://ci.testling.com/jwerle/draft)

--

## install

*nodejs*

```sh
$ npm install draft --save
```

*component*

```sh
$ component install jwerle/draft
```

*bower*

```sh
$ bower install draft
```

## usage

Creating a model with draft is as simple as passing it a schema descriptor

```js
var User = draft({ name: String, email: String })
  , Post = draft({ owner: Object, content: String })

var werle = new User({ name: 'werle', email: 'joseph@werle.io' })
  , post  = new Post({ owner: werle, content: "I like draft :)"})
```

## api

### Schema(descriptor, options)

Adds an object to the schema tree

*  `descriptor` - An object defining a descriptor for the schema instance
*  `options` - An object of options:
	* `strict` - Strict mode. Model from schema will be frozen from schema updates after instantiation. (Default: `true`)

### .add(key, descriptor)

* `key` - A key used to identify the property in the schema
* `descriptor` - An object descriptor or constructor function 

### .createModel()

Creates a constructor from the defined schema

### .new(data)

Accepts an object of data and passes it to the Model constructor from the Schema instance

* `data` - An object of data to pass to the schema instance model constructor

#### Schema Descriptor

A schema descriptor is a key to type descriptor object. The key for each property on the object represents a possible key on a model instance created from the schema instance.

A simple example of a schema who defines a model which accepts an object that defines a single property `name` of the type `string`

```js
new draft.Schema({ name : String })
```

A more advanced example would be to define the descriptor object for the property:

```js
new draft.Schema({
	name: { type: String }
})
```

#### schema in action

Define a schema for an object with types. Strict mode default

```js
var draft = require('draft')
var schema = new draft.Schema({
	name : String,
	profile : {
		email : String,
		age : Number
	}
});
```

Create a model constructor from the schema defaulting to strict mode

```js
var User = schema.createModel();
```

Instantiate the model passing in an object. In strict mode all properties on an object must be defined in the schema that was used to create it

```js
var user = new User({
	name: 'werle',
	profile: { email: 'joseph@werle.io' },
	somePropertyNotInSchema: 'someValue'
});

```

Only values in the schema were set on the object

```js
user.name // werle
user.profile.email // joseph@werle.io
user.somePropertyNotInSchema // undefined
```

## todo

* write more tests
* document more

## license

MIT
