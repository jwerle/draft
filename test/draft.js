describe("draft", function () {
  var draft  = require('../')
    , assert = require('assert')
    , Schema = draft.Schema
    , Model  = draft.Model
    , Model  = draft.Model

  describe("Schema", function () {
    describe("Should only accept a plain object or undefined as an argument", function () {
      it("Should accept a 'undefined'", function () {
        assert.doesNotThrow(function () { new Schema(undefined); }, TypeError); 
      });

      it("Should not accept a 'null'", function () {
        assert.throws(function () { new Schema(null); }, TypeError);
      });

      it("Should not accept a 'number'", function () {
        assert.throws(function () { new Schema(1); }, TypeError);
      });

      it("Should not accept a 'boolean'", function () {
        assert.throws(function () { new Schema(true); }, TypeError);
      });

      it("Should not accept a 'function'", function () {
        assert.throws(function () { new Schema(function () {}); }, TypeError);
      });

      it("Should not accept a 'date'", function () {
        assert.throws(function () { new Schema(new Date); }, TypeError);
      });

      it("Should not accept a constructed object", function () {
        var Thing = function Thing (arg) {}, thing = new(Thing);
        assert.throws(function () { new Schema(thing); }, TypeError);
      });

      it("Should accept a plain object", function () {
        assert.doesNotThrow(function () { new Schema({ property: String }); });
      });
    });

    describe("Should define a tree instance after instantiation", function () {
      var schema
      
      it("Should set the constructor on a property => type definition", function () { 
        schema = new Schema({ property: String });
        assert.ok(schema.tree.property.Constructor === String);
      });

      it("Should set the constructor on a property who's type is set on an object descriptor", function () {
        schema = new Schema({ property: {type: String } });
        assert.ok(schema.tree.property.Constructor === String);
      });

      it("Should define child tree schema", function () {
        schema = new Schema({
          name : String,
          profile : {
            age     : Number,
            gender  : String,
            parents : {
              mother : { name : String },
              father : { name : String }
            }
          }
        });


        assert.ok(typeof schema.tree.profile === 'object', "Failed to create child tree object .profile");
        assert.ok(typeof schema.tree.profile.parents === 'object', "Failed to create child tree object .profile.parents");
        assert.ok(typeof schema.tree.profile.parents.mother === 'object', "Failed to create child tree object .profile.parents.mother");
        assert.ok(typeof schema.tree.profile.parents.father === 'object', "Failed to create child tree object .profile.parents.father");

        assert.ok(schema.tree.name.Constructor === String, "Failed setting .name on tree");
        assert.ok(schema.tree.profile.age.Constructor === Number, "Failed to create .tree.profile type");
        assert.ok(schema.tree.profile.gender.Constructor === String, "Failed to create .profile.gender type");
        assert.ok(schema.tree.profile.parents.mother.name.Constructor === String, "Failed to create .profile.parents.mother.name type");
        assert.ok(schema.tree.profile.parents.father.name.Constructor === String, "Failed to create .profile.parents.father.name type");
      });
    });

    describe('#add', function () {
      it("Should accept a key and a descriptor object", function () {
        schema = new Schema();
        schema.add('name', String);
        schema.add('age', { type: Number });
        assert.ok(schema.tree.name.Constructor === String);
        assert.ok(schema.tree.age.Constructor === Number);
      });
    });

    describe('#createModel', function () {
      it("Should create a Model constructor from the defined schema", function () {
        var schema, User, user
        schema = new Schema();
        schema.add('name', String);
        schema.add('profile', { 
          age: Number, 
          gender: { 
            type: String,
            strict : false,
            get: function (value) { return value; }, 
            set: function(value) {  return value; },
            enum: ['male', 'female', 'other'] 
        }});

        User = schema.createModel();
        user = new User( {name : 'Joe', profile: { age: 22, gender: 'male' }} );

        assert.ok(Model.prototype.isPrototypeOf(User.prototype));
        assert.ok(user.name);
        assert.ok(user.profile);
        assert.ok(user.profile.age);
        assert.ok(user.profile.gender);
      });
    });
  });

  describe("Model", function () {
    
  });
});