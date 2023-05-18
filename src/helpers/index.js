import normalize from "./normalizer";
import {formatPrice} from "./product";

const stringify = (obj) => {
  let cache = [];
  let str = JSON.stringify(obj, function(key, value) {
    if (typeof value === "object" && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference was found, discard key
        return;
      }
      // Store value in our collection
      cache.push(value);
    }
    return value;
  });
  cache = null; // reset the cache
  return str;
}

const isValidAddress = (address = {}) => {
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

function isAddressDirty(dirtyFields, address, namePath) {
  const addressFields = Object.keys(address);

  return addressFields.some((field) => {
    const fullPath = `${namePath}[${field}]`;
    return dirtyFields[fullPath];
  });
}

const isValidCreditCard = (card = {}) => {
  // Regular expressions for card validation
  const cardNumberRegex = /^\d{15,16}$/;
  const monthRegex = /^(0[1-9]|1[0-2])$/;
  const yearRegex = /^\d{2}$/;
  const securityCodeRegex = /^\d{3,4}$/;

  // Validate card number using Luhn algorithm
  function luhnCheck(cardNumber) {
    let sum = 0;
    let isEven = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i), 10);

      if (isEven && (digit *= 2) > 9) digit -= 9;

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  // Check card number format and Luhn algorithm
  if (!cardNumberRegex.test(card.number)) return false;

  // Check expiration month and year
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;
  const expYear = parseInt(card?.expiration?.year, 10);
  const expMonth = parseInt(card?.expiration?.month, 10);

  if (
    !monthRegex.test(card?.expiration?.month) ||
    !yearRegex.test(card?.expiration?.year) ||
    expYear < currentYear ||
    (expYear === currentYear && expMonth < currentMonth)
  ) {
    return false;
  }

  // Check security code
  if (!securityCodeRegex.test(card.security_code)) return false;

  return true;
}

function isValidBankData(bankData = {}) {
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

const toCamelCase = (str) => {
  return str.replace(/_([a-z])/g, (match, char) => char.toUpperCase());
}

const getOrder = (apiObject, index = 0, orderType = 'order--default') => {
  let order = null;
  if (apiObject && apiObject[orderType]) {
    let orderKeys = Object.keys(apiObject[orderType]);
    order = apiObject[orderType][orderKeys[index]];
  }
  return order;
}

const getLastFourDigits = (input) => {
  const str = String(input);
  return str.slice(-4);
}

const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const getRelationships = (entity, name, data) => {
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

const isUuid = (uuid) => {
  let uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(uuid);
}

const getPriceRange = (variations) => {
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

const parseQueryParameters = (queryString) => {
  const parameters = {};
  const pairs = queryString.split('&');

  pairs.forEach(pair => {
    const [key, value] = pair.split('=');

    const path = key.split(/[[\]]{1,2}/).filter(part => part);
    let currentObj = parameters;

    path.forEach((pathPart, index) => {
      if (index === path.length - 1) {
        currentObj[pathPart] = decodeURIComponent(value);
      } else {
        if (!currentObj[pathPart]) {
          currentObj[pathPart] = {};
        }
        currentObj = currentObj[pathPart];
      }
    });
  });

  return parameters;
}

export {
  stringify,
  isValidAddress,
  isAddressDirty,
  isValidCreditCard,
  isValidBankData,
  toCamelCase,
  getOrder,
  getLastFourDigits,
  normalize,
  formatPrice,
  capitalizeFirstLetter,
  getRelationships,
  isUuid,
  getPriceRange,
  parseQueryParameters,
}