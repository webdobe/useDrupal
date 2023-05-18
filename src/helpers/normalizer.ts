import camelCase from 'lodash/camelCase';
import isArray from 'lodash/isArray';
import isNull from 'lodash/isNull';
import keys from 'lodash/keys';
import merge from 'lodash/merge';

type NormalizeOptions = {
  filterEndpoint?: boolean,
  camelizeKeys?: boolean,
  camelizeTypeValues?: boolean,
  endpoint?: string
}

function wrap(json: any): any[] {
  if (isArray(json)) {
    return json;
  }

  return [json];
}

function isDate(attributeValue: any): boolean {
  return Object.prototype.toString.call(attributeValue) === '[object Date]';
}

function camelizeNestedKeys(attributeValue: any): any {
  if (attributeValue === null || typeof attributeValue !== 'object' || isDate(attributeValue)) {
    return attributeValue;
  }

  if (isArray(attributeValue)) {
    return attributeValue.map(camelizeNestedKeys);
  }

  const copy: any = {};

  keys(attributeValue).forEach((k) => {
    copy[camelCase(k)] = camelizeNestedKeys(attributeValue[k]);
  });

  return copy;
}

function extractRelationships(relationships: any, { camelizeKeys, camelizeTypeValues }: NormalizeOptions): any {
  const ret: any = {};
  keys(relationships).forEach((key) => {
    const relationship = relationships[key];
    const name = camelizeKeys ? camelCase(key) : key;
    ret[name] = {};

    if (typeof relationship.data !== 'undefined') {
      if (isArray(relationship.data)) {
        ret[name].data = relationship.data.map((e: any) => ({
          id: e.id,
          type: camelizeTypeValues ? camelCase(e.type) : e.type,
        }));
      } else if (!isNull(relationship.data)) {
        ret[name].data = {
          id: relationship.data.id,
          type: camelizeTypeValues ? camelCase(relationship.data.type) : relationship.data.type,
        };
      } else {
        ret[name].data = relationship.data;
      }
    }

    if (relationship.links) {
      ret[name].links = camelizeKeys ? camelizeNestedKeys(relationship.links) : relationship.links;
    }

    if (relationship.meta) {
      ret[name].meta = camelizeKeys ? camelizeNestedKeys(relationship.meta) : relationship.meta;
    }
  });
  return ret;
}

function processMeta(metaObject: any, { camelizeKeys }: NormalizeOptions): any {
  if (camelizeKeys) {
    const meta: any = {};

    keys(metaObject).forEach((key) => {
      meta[camelCase(key)] = camelizeNestedKeys(metaObject[key]);
    });

    return meta;
  }

  return metaObject;
}

function extractEntities(json: any, { camelizeKeys, camelizeTypeValues }: NormalizeOptions): any {
  const ret: any = {};

  wrap(json).forEach((elem) => {
    const type = camelizeKeys ? camelCase(elem.type) : elem.type;

    ret[type] = ret[type] || {};
    ret[type][elem.id] = ret[type][elem.id] || {
      id: elem.id,
    };
    ret[type][elem.id].type = camelizeTypeValues ? camelCase(elem.type) : elem.type;

    if (camelizeKeys) {
      ret[type][elem.id].attributes = {};

      keys(elem.attributes).forEach((key) => {
        ret[type][elem.id].attributes[camelCase(key)]
          = camelizeNestedKeys(elem.attributes[key]);
      });
    } else {
      ret[type][elem.id].attributes = elem.attributes;
    }

    if (elem.links) {
      ret[type][elem.id].links = {};

      keys(elem.links).forEach((key) => {
        const newKey = camelizeKeys ? camelCase(key) : key;
        ret[type][elem.id].links[newKey] = elem.links[key];
      });
    }

    if (elem.relationships) {
      ret[type][elem.id].relationships = extractRelationships(elem.relationships, {
        camelizeKeys,
        camelizeTypeValues,
      });
    }

    if (elem.meta) {
      ret[type][elem.id].meta = processMeta(elem.meta, { camelizeKeys });
    }
  });

  return ret;
}

function doFilterEndpoint(endpoint: string): string {
  return endpoint.replace(/\?.*$/, '');
}

function extractMetaData(json: any, endpoint: string, { camelizeKeys, camelizeTypeValues, filterEndpoint }: NormalizeOptions): any {
  const ret: any = {};

  ret.meta = {};

  let metaObject: any;

  if (!filterEndpoint) {
    const filteredEndpoint = doFilterEndpoint(endpoint);

    ret.meta[filteredEndpoint] = {};
    ret.meta[filteredEndpoint][endpoint.slice(filteredEndpoint.length)] = {};
    metaObject = ret.meta[filteredEndpoint][endpoint.slice(filteredEndpoint.length)];
  } else {
    ret.meta[endpoint] = {};
    metaObject = ret.meta[endpoint];
  }

  metaObject.data = {};

  if (json.data) {
    const meta: Array<{id: any, type: any, relationships?: any}> = [];

    wrap(json.data).forEach((object: {id: any; type: any; relationships?: any}) => {
      const pObject: {id: any; type: any; relationships?: any} = {
        id: object.id,
        type: camelizeTypeValues ? camelCase(object.type) : object.type,
      };

      if (object.relationships) {
        pObject.relationships = extractRelationships(object.relationships, {
          camelizeKeys,
          camelizeTypeValues,
        });
      }

      meta.push(pObject);
    });

    metaObject.data = meta;
  }

  if (json.links) {
    metaObject.links = json.links;
    ret.meta[doFilterEndpoint(endpoint)].links = json.links;
  }

  if (json.meta) {
    metaObject.meta = processMeta(json.meta, { camelizeKeys });
  }

  return ret;
}

export default function normalize(json: any, {
  filterEndpoint = true,
  camelizeKeys = false,
  camelizeTypeValues = false,
  endpoint,
}: NormalizeOptions = {}): any {
  const ret: any = {};

  if (json.data) {
    merge(ret, extractEntities(json.data, { camelizeKeys, camelizeTypeValues }));
  }

  if (json.included) {
    merge(ret, extractEntities(json.included, { camelizeKeys, camelizeTypeValues }));
  }

  if (endpoint) {
    const endpointKey = filterEndpoint ? doFilterEndpoint(endpoint) : endpoint;

    merge(ret, extractMetaData(json, endpointKey, {
      camelizeKeys,
      camelizeTypeValues,
      filterEndpoint,
    }));
  }

  return ret;
}