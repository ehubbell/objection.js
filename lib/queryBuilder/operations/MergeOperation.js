'use strict';

const { isFunction, isEmpty, isObject } = require('../../utils/objectUtils');
const { QueryBuilderOperation } = require('./QueryBuilderOperation');
const { convertFieldExpressionsToRaw } = require('./UpdateOperation');

class MergeOperation extends QueryBuilderOperation {
  constructor(name, opt) {
    super(name, opt);
    this.model = null;
    this.args = null;
  }

  onAdd(builder, args) {
    this.args = args;

    if (!isEmpty(args) && isObject(args[0]) && !Array.isArray(args[0])) {
      const json = args[0];
      const modelClass = builder.modelClass();

      this.model = modelClass.ensureModel(json, { patch: true });
    }

    return true;
  }

  onBuildKnex(knexBuilder, builder) {
    if (!isFunction(knexBuilder.merge)) {
      throw new Error('merge method can only be chained right after onConflict method');
    }

    if (this.model) {
      const json = this.model.$toDatabaseJson(builder);
      const convertedJson = convertFieldExpressionsToRaw(builder, this.model, json);

      return knexBuilder.merge(convertedJson);
    }

    return knexBuilder.merge(...this.args);
  }

  toFindOperation() {
    return null;
  }

  clone() {
    const clone = super.clone();
    clone.model = this.model;
    clone.args = this.args;
    return clone;
  }
}

module.exports = {
  MergeOperation,
};
