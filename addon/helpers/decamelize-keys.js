import Ember from 'ember';

export function decamelizeKeys([ source ]/*, hash*/) {
  let dest = {};
  Object.keys(source).forEach(k => dest[Ember.String.decamelize(k)] = source[k]);
  return dest;
}

export default Ember.Helper.helper(decamelizeKeys);
