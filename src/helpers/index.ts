declare let window: any;

import normalize from "./normalizer";

interface Address {
  country_code: string;
  address_line1: string;
  address_line2?: string;
  administrative_area: string;
  locality: string;
  postal_code: string;
}

interface CreditCard {
  number: string,
  month: string,
  year: string,
  security_code: string,
}

interface BankData {
  account_number: string;
  routing_number: string;
  name_on_account: string;
  account_type: string;
}

interface StringIndexedObject {
  [key: string]: any;
}

interface Entity {
  relationships: Record<string, {
    data: any;
  }>;
}

const isBrowser = () => typeof document !== "undefined";

const stringify = (obj: object): string => {
  let cache: any[] = [];
  let str = JSON.stringify(obj, function(key, value) {
    if (typeof value === "object" && value !== null) {
      if (cache.indexOf(value) !== -1) {
        return;
      }
      cache.push(value);
    }
    return value;
  });
  return str;
}

const isValidAddress = (address: Address = {} as Address): boolean => {
  // Regular expressions for address validation
  const streetRegex = /^[0-9a-zA-Z\s\.,#-]+$/;
  const cityRegex = /^[a-zA-Z\s]+$/;
  const stateRegex = /^[A-Z]{2}$/;
  const zipRegex = /^\d{5}(-\d{4})?$/;
  const countryCodeRegex = /^[A-Z]{2}$/;

  // Validate country code
  if (!countryCodeRegex.test(address.country_code)) return false;

  // Validate address line 1
  if (!streetRegex.test(address.address_line1)) return false;

  // Validate address line 2, if present
  if (address.address_line2 && !streetRegex.test(address.address_line2)) return false;

  // Validate administrative area (state)
  if (!stateRegex.test(address.administrative_area)) return false;

  // Validate locality (city)
  if (!cityRegex.test(address.locality)) return false;

  // Validate postal code (zip code)
  if (!zipRegex.test(address.postal_code)) return false;

  return true;
}

function isAddressDirty(dirtyFields: Record<string, any>, address: Record<string, any>, namePath: string): boolean {
  const addressFields = Object.keys(address);

  return addressFields.some((field) => {
    const fullPath = `${namePath}[${field}]`;
    return dirtyFields[fullPath];
  });
}

const isValidCreditCard = (card: CreditCard = {} as CreditCard): boolean => {
  // Regular expressions for card validation
  const cardNumberRegex = /^\d{15,16}$/;
  const monthRegex = /^(0[1-9]|1[0-2])$/;
  const yearRegex = /^\d{2}$/;
  const securityCodeRegex = /^\d{3,4}$/;

  // Check card number format and Luhn algorithm
  if (!cardNumberRegex.test(card.number)) return false;

  // Check expiration month and year
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;
  const expYear = parseInt(card.year, 10);
  const expMonth = parseInt(card.month, 10);

  if (
    !monthRegex.test(card.month) ||
    !yearRegex.test(card.year) ||
    expYear < currentYear ||
    (expYear === currentYear && expMonth < currentMonth)
  ) {
    return false;
  }

  // Check security code
  if (!securityCodeRegex.test(card.security_code)) return false;

  return true;
}

function isValidBankData(bankData: BankData = {} as BankData): boolean {
  // Regular expressions for bank data validation
  const accountNumberRegex = /^\d{4,17}$/; // Adjust the range as necessary
  const routingNumberRegex = /^\d{9}$/;
  const nameOnAccountRegex = /^[a-zA-Z\s]+$/;
  const accountTypeRegex = /^(checking|savings|business_checking)$/i;

  // Check account number
  if (!accountNumberRegex.test(bankData.account_number)) return false;

  // Check routing number
  if (!routingNumberRegex.test(bankData.routing_number)) return false;

  // Check name on account
  if (!nameOnAccountRegex.test(bankData.name_on_account)) return false;

  // Check account type
  if (!accountTypeRegex.test(bankData.account_type)) return false;

  return true;
}

function isValidPhoneNumber(phoneNumber: string, areaCodeRequired: boolean = true): boolean {
  const regex = areaCodeRequired
    ? /^(\+1\s?)?(\([0-9]{3}\)|[0-9]{3})[\s.-]?[0-9]{3}[\s.-]?[0-9]{4}$/
    : /^(\+1\s?)?((\([0-9]{3}\)|[0-9]{3})[\s.-]?)?[0-9]{3}[\s.-]?[0-9]{4}$/;
  return regex.test(phoneNumber);
}

const toCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (match, char) => char.toUpperCase());
}

const getOrder = (apiObject: StringIndexedObject | null, index = 0, orderType = 'order--default'): any => {
  let order = null;
  if (apiObject && apiObject[orderType]) {
    let orderKeys = Object.keys(apiObject[orderType]);
    order = apiObject[orderType][orderKeys[index]];
  }
  return order;
}

const getLastFourDigits = (input: number | string): string => {
  const str = String(input);
  return str.slice(-4);
}

const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const getRelationships = (entity: Entity | null, name: string, data: any): any => {
  const relationship = entity?.relationships[name]?.data;
  if (relationship) {
    if (Array.isArray(relationship)) {
      return relationship.map((r) => data[r.type][r.id])
    } else {
      return data[relationship.type][relationship.id];
    }
  }
  return null;
}

const isUuid = (uuid: string): boolean => {
  let uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(uuid);
}

const getPriceRange = (variations: any[]): Record<string, any> => {
  let min = 0;
  let max = 0;

  for (let i = 0; i < variations.length; i++) {
    let currentNumber = parseFloat(variations[i].getValue('price').number);
    let minNumber = parseFloat(variations[min].getValue('price').number);
    let maxNumber = parseFloat(variations[max].getValue('price').number);

    if (currentNumber < minNumber) {
      min = i;
    }
    if (currentNumber > maxNumber) {
      max = i;
    }
  }

  const priceRange = parseFloat(variations[min].getValue('price').number) === parseFloat(variations[max].getValue('price').number)
    ? variations[min].getValue('price').formatted : `${variations[min].getValue('price').formatted} - ${variations[max].getValue('price').formatted}`;

  return {
    min: variations[min].getValue('price'),
    max: variations[max].getValue('price'),
    value: priceRange,
  };
}

const createUrl = (endpoint: string, queryParams: Record<string, any>): string => {
  let flatParams: string[] = [];

  function encodePart(base: string, obj: Record<string, any>): void {
    Object.entries(obj).forEach(([key, value]) => {
      let newKey = base ? `${base}[${encodeURIComponent(key)}]` : encodeURIComponent(key);

      if (typeof value === 'object' && value !== null) {
        encodePart(newKey, value as Record<string, any>);
      } else {
        flatParams.push(`${newKey}=${encodeURIComponent(value)}`);
      }
    });
  }

  encodePart('', queryParams);

  return `${endpoint}?${flatParams.join('&')}`;
};

type QueryParams = Record<string, string>;
type NestedParsedParams = Array<ParsedParams>;
type ParsedParamValue = string | NestedParsedParams;
type ParsedParams = Record<string, ParsedParamValue>;

const splitKey = (key: string): string[] => {
  return key.split(/\]\[|\[|\]/g).filter(Boolean); // Split keys by square brackets
}

const assignValueToPath = (path: string[], value: string, obj: any): void  => {
  let currentLevel = obj;

  for (let i = 0; i < path.length; i++) {
    const part = path[i];
    if (i === path.length - 1) {
      // Last part, assign value
      currentLevel[part] = value;
    } else {
      // Not last part, traverse or create object
      if (!currentLevel[part]) {
        currentLevel[part] = {} as any;
      }
      currentLevel = currentLevel[part];
    }
  }
}

const parseQueryParams = (queryParams: QueryParams): ParsedParams => {
  const params: ParsedParams = {};

  for (let key in queryParams) {
    const path = splitKey(key);
    const value = queryParams[key];
    assignValueToPath(path, value, params);
  }

  return params;
}

const getQueryParams = (): Record<string, string> => {
  const filterParams = ["filter", "page", "sort", "include", "fields"];
  const queryParams: Record<string, string> = {};

  if (isBrowser()) {
    const queryString = window.location.search.substring(1);
    const pairs = queryString.split('&');

    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i].split('=');
      const key = decodeURIComponent(pair[0]);
      const value = decodeURIComponent(pair[1] || '');

      // Check if key starts with any string in the filterParams array
      if (filterParams.some(param => key.startsWith(param)) && value) {
        queryParams[key] = value;
      }
    }
  }
  return queryParams;
};

interface FilterCondition {
  path: string;
  operator: string;
  value: string;
  memberOf?: string;
}

interface FilterGroup {
  conjunction?: "AND" | "OR";
}

interface FilterObject {
  condition?: FilterCondition;
  group?: FilterGroup;
}

const createFilterObject = (
  filterName: string,
  path: string,
  operator: string,
  value: string,
  memberOf?: string,
  conjunction?: "AND" | "OR"
): { [key: string]: FilterObject } => {
  let filterObject: { [key: string]: FilterObject } = {
    [filterName]: {
      condition: {
        path: path,
        operator: operator,
        value: value,
      },
    },
  };

  if (memberOf) {
    filterObject[filterName].condition!.memberOf = memberOf;
  }

  if (conjunction) {
    const group: FilterGroup = { conjunction: conjunction };
    if (memberOf && !(memberOf in filterObject)) {
      filterObject[memberOf] = { group: group };
    } else {
      filterObject[filterName].group = group;
    }
  }

  return filterObject;
};

export {
  normalize,
  isBrowser,
  stringify,
  isValidAddress,
  isAddressDirty,
  isValidCreditCard,
  isValidBankData,
  isValidPhoneNumber,
  toCamelCase,
  getOrder,
  getLastFourDigits,
  capitalizeFirstLetter,
  getRelationships,
  isUuid,
  getPriceRange,
  createUrl,
  getQueryParams,
  parseQueryParams,
  createFilterObject,
}