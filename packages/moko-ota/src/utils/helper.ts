/**
 * @description ### Returns Go / Lua like responses(data, err)
 * when used with await
 *
 * - Example response [ data, undefined ]
 * - Example response [ undefined, Error ]
 *
 *
 * When used with Promise.all([req1, req2, req3])
 * - Example response [ [data1, data2, data3], undefined ]
 * - Example response [ undefined, Error ]
 *
 *
 * When used with Promise.race([req1, req2, req3])
 * - Example response [ data, undefined ]
 * - Example response [ undefined, Error ]
 *
 * @param {Promise} promise
 * @returns {Promise} [ data, undefined ]
 * @returns {Promise} [ undefined, Error ]
 */

export function handle(promise) {
  return promise
    .then(data => [data, undefined])
    .catch(error => Promise.resolve([undefined, error]));
}

export async function waitTimeout(time) {
  return await setTimeout(() => console.debug(`waiting ${time}`), time);
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

export function inspect(obj) {
  return JSON.stringify(obj, getCircularReplacer());
}

/**
 * @description trim all the string type properties of an object
 * @param  {T} obj
 * @returns T
 */
 export function trimObjectProperties<T>(obj: T): T {
  let result = {} as T;
  Object.assign(result, obj);
  Object.keys(obj).map((k) => {
    return (result[k] = typeof obj[k] === 'string' ? obj[k].trim() : obj[k]);
  });

  return result;
}