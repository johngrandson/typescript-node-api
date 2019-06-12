import * as countries from 'i18n-iso-countries';

export function countryCodeValidator(countryCode: string): boolean {
  if (countryCode) {
    const trimmedCountryCode: string = countryCode.trim();

    return trimmedCountryCode.length === 3 && countries.isValid(countryCode);
  }

  return false;
}

export function emailValidator(email: string): boolean {
// tslint:disable-next-line: max-line-length
  return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g.test(email);
}

export function cnpjValidator(cnpj: string): boolean {
  if (!/\d{14}/g.test(cnpj)) {
    return false;
  }

  let size: number = cnpj.length - 2
  const digits: string = cnpj.substring(size);
  let numbers: string = cnpj.substring(0, size);
  let sum: number = 0;
  let pos: number = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i), 10) * pos--;

    if (pos < 2) {
      pos = 9;
    }
  }

  let resultado = sum % 11 < 2 ? 0 : 11 - sum % 11;

  if (resultado !== parseInt(digits.charAt(0), 10)) {
    return false;
  }

  size = size + 1;
  numbers = cnpj.substring(0, size);

  sum = 0;
  pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i), 10) * pos--;

    if (pos < 2) {
      pos = 9;
    }
  }

  resultado = sum % 11 < 2 ? 0 : 11 - sum % 11;

  if (resultado !== parseInt(digits.charAt(1), 10)) {
    return false;
  }

  return true;
}

export async function cpfValidator(cpf: string) {
  let numbers: string;
  let result: number;
  let sum: number;
  let digits: string;

  if (!/\d{11}/g.test(cpf)) {
    return false;
  }

  numbers = cpf.substring(0, 9);
  digits = cpf.substring(9);
  sum = 0;
  for (let i = 10; i > 1; i--) {
    sum += parseInt(numbers.charAt(10 - i), 10) * i;
  }

  result = sum % 11 < 2 ? 0 : 11 - sum % 11;

  if (result !== parseInt(digits.charAt(0), 10)) {
    return false;
  }

  numbers = cpf.substring(0, 10);
  sum = 0;

  for (let i = 11; i > 1; i--) {
    sum += parseInt(numbers.charAt(11 - i), 10) * i;
  }

  result = sum % 11 < 2 ? 0 : 11 - sum % 11;

  if (result !== parseInt(digits.charAt(1), 10)) {
    return false;
  }

  return true;
}