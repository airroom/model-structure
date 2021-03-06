#Model Structure

`model-structure` helps you to create Models based on a Schema's Object. :godmode:

It can:

* Set a custom repository to create, update, get and delete
* Get Swagger models
* Get db-migrate JSON
* Nested objects support (validations too!)
* Call validations before create, update or standalone
* Custom async validations based on Schema
* Custom validation messages, by validation or attribute

---


1. [Installation](#installation)
2. [Usage](#usage)
  - [Schema Declaration](#schema-declaration)
  - [Using Repositories](#using-repositories)
  - [Validating Models](#validating-models)
  - [Swagger](#validating-models)
  - [Messages](#messages)
  - [Data/Object Definition](#dataobject-definition)
    -  [Data Types](#data-types)
    -  [ENUM Object](#enum-object)
    -  [Model Ref Object](#model-ref-object)
3. [Browser Support](#browser-support)
4. [Running Tests](#running-tests)

## Installation
```sh
$ npm install model-structure
```

## Usage
[Sample object](/test/fixtures/models/customer.js)
```js

var modelStructure = require('model-structure');
var Model = modelStructure.Model;
var Lead = (function (ref){

  function Lead(args) {
    ref.instantiate(this, args);
  }

  var schema = {
    properties: {
      "id" : {
        "type": "integer",
        "primaryKey": true,
        "autoIncrement": true
      },
      "name" : {
        "type": "string",
        "maximum": 30
      },
      "email" : {
        "type": "email",
        "message": "%s field is not a valid email!!",
      },
    }
  }
  ref.init(Lead, schema);
  return Lead;

})(Model);

var data = {name: 'Kurosaki Ichigo', email: 'ichi@soulsociety.com'};
var lead = new Lead(data);
lead.create(function(err, leadResponse) {
  // return created lead
});
```

### Schema Declaration

```js
var schema = {};
```

#### `schema.messages = {}`

Schema error messages based on [Data Type](#data-types).

```js
schema.messages = {
  "integer": "Integer error message",
  "float": "Float error message",
}
``` 

#### `schema.notInstantiate = false`

If `true`, gets exactly the return data from Repository.

#### `schema.properties = {}`

Property | Type | Description
-------- | ---- | -----------
`type` |  [`String - Data Type`](#data-types) | **Required**.
`primaryKey` | `Boolean` |
`autoIncrement` | `Boolean` |
`minimum` | `Number` | If `type` is a `Number`, minimum value. If it's a `String`, minimum length.
`maximum` | `Number` | If `type` is a `Number`, maximum value. If it's a `String`, maximum length.
`values` | [`Object - ENUM`](#enum-object) | .
`model` | [`Object - Model Ref`](#model-ref-object) |

```js
schema.properties = {
  "id": {
    "type": "integer",
    "primaryKey": true,
    "autoIncrement": true
  }
}
```

### Using Repositories

The Model calls repository's functions passing object with `this` context.

```js
var datas = {};
// Simple repository to use memory to save data
var Repository = (function () {
  function Repository() {
    Repository.prototype.create = create;
    Repository.prototype.get = get;
    Repository.prototype.load = load;
    Repository.prototype.update = update;
    Repository.prototype.destroy = destroy;
  }

  function create(callback) {
    this.id = new Date().getTime();
    datas[this.id] = this;
    if (typeof callback === 'function') callback(null, this);
  }

  function load(args, callback) {
    args = args || {};
    var data = args.data || {};
    if (args.id) {
      data = datas[args.id];
    }
    callback(null, data);
  }

  function get(args, callback) {
    var data = [];
    for (var i in datas) data.push(JSON.parse(JSON.stringify(datas[i])));
    callback(null, data);
  }

  function update(callback) {
    datas[this.id] = this;
    if (typeof callback === 'function') callback(null, this);
  }

  function destroy(callback) {
    delete datas[this.id];
    if (typeof callback === 'function') callback(null, this);
  }

  return Repository;

})();

var data = {name: 'Kurosaki Ichigo', email: 'ichi@soulsociety.com'};
data.repository = new Repository();
var lead = new Lead(data);
lead.create(function(err, leadResponse) {
  lead.load({id:lead.id}, function (err, secondResponse) {
    // get saved lead;
  });
});
```

### Validating Models
The validations methods are fired before `create` or `update` methods. But you may trigger it directly:
```js
var data = {name: 'Kurosaki Ichigo', email: 'ichi@soulsociety.com'};
data.repository = new Repository();
var lead = new Lead(data);
lead.isValid(function(err, fields) {

});
```

### Swagger

Get Swagger Model schema
```js
var swaggerSchema = {
  "apiVersion": "0.0.1",
  "swaggerVersion": "1.2",
  "basePath": "http://localhost:1214",
  "resourcePath": "/lead",
  "apis": [{
    "path": "/lead/",
    "operations": [{
      "description": "Get all leads",
      "notes": "Returns all leads.",
      "summary": "Get leads",
      "method": "GET",
      "type": "Lead",
      "nickname": "getAllLeads"
    }]
  }],
  "models": Lead.access('swagger')
  }
}
```

### Messages

Add custom error messages to field or validation

```js
  var lead= new Lead({id:"not a valid integer"});
  Model.addMessages('pt-BR', {types: {id: "%s não é um inteiro"}});
  Model.setLocale('pt-BR');
  customer.isValid(function (err) {
    expect(err[0].field).to.be('id');
    expect(err[0].message).to.contain('id não é um inteiro');
    Model.setLocale('en');
    customer.isValid(function (err2) {
      expect(err2[0].field).to.be('active');
      expect(err2[0].message).to.contain('id is not an integer');
      done();
    });
  });

```

### Data/Object Definition

#### Data Types

Currently Supported Datatypes:

* `String`
* `Char`
* `Decimal`
* `Float`
* `Integer`
* `Boolean`
* `Date`
* `Datetime`
* `Enum`
* `Array`
* `Email`
* `Nested Objects`

#### ENUM Object

Property | Type | Description
-------- | ---- | -----------
`ref` | `Array/Object` | Reference Values
`type` | [`String - Data Type`](#data-types) |

#### Model Ref Object

Property | Type | Description
-------- | ---- | -----------
`ref` | `Object - Model Structure` | A `Model Structure` instance

## Browser Support

You can use on client-side too!

![IE](https://cloud.githubusercontent.com/assets/398893/3528325/20373e76-078e-11e4-8e3a-1cb86cf506f0.png) | ![Chrome](https://cloud.githubusercontent.com/assets/398893/3528328/23bc7bc4-078e-11e4-8752-ba2809bf5cce.png) | ![Firefox](https://cloud.githubusercontent.com/assets/398893/3528329/26283ab0-078e-11e4-84d4-db2cf1009953.png) | ![Opera](https://cloud.githubusercontent.com/assets/398893/3528330/27ec9fa8-078e-11e4-95cb-709fd11dac16.png) | ![Safari](https://cloud.githubusercontent.com/assets/398893/3528331/29df8618-078e-11e4-8e3e-ed8ac738693f.png)
--- | --- | --- | --- | ---
IE 9+ ✔ | Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔

## Running Tests

  To run the test suite, first invoke the following command within the repo, installing the development dependencies:

```bash
$ npm install
```

  Then run the tests:

```bash
$ npm test
```

  To run the coverage report:

```bash
$ npm run cover
```
