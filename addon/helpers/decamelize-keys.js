import { helper } from '@ember/component/helper';
import { decamelize } from '@ember/string';

export function decamelizeKeys([ source ]/*, hash*/) {
  let dest = {};
  Object.keys(source).forEach(k => dest[decamelize(k)] = source[k]);
  return dest;
}

export default helper(decamelizeKeys);
