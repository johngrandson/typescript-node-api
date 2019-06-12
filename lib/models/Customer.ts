import { subYears } from 'date-fns';
import { ObjectId } from 'mongodb';
import { arrayProp as ArrayProperty, ModelType, prop as Property, Typegoose } from 'typegoose';
import { cnpjValidator, countryCodeValidator, cpfValidator, emailValidator } from '../../helpers/mongooseValidators';

type MaritalStatus = 'single' | 'married' | 'divorced' | 'widower' | 'legally-separated';
type CustomerType = 'person' | 'company';
type CustomerGender = 'male' | 'female' | 'other';

export const MaritalStatusEnum = {
  DIVORCED: 'divorced',
  LEGALLYSEPARATED: 'legally-separated',
  MARRIED: 'married',
  SINGLE: 'single',
  WIDOWER: 'widower'
};

export const CustomerTypeEnum = {
  COMPANY: 'company',
  PERSON: 'person'
};

export const CustomerGenderEnum = {
  FEMALE: 'female',
  MALE: 'male',
  OTHER: 'other'
};

export class PhoneNumber {
  @Property({ required: true })
  public number: string;

  @Property({ required: true })
  public isMainNumber: boolean;

  @Property({ required: true, default: false })
  public isVerified: boolean;
}

async function duplicateEmailValidator(this: any, value: string) {
  const document = this.parent().parent();
  let query: any = {
    'contactInfo.emails.address': value
  };

  if (!document.isNew) {
    query = { ...query, _id: { $ne: document._id } };
  }

  return (await CustomerModel.count(query)) === 0;
}

export class Email {
  // tslint:disable-next-line: variable-name
  public _id: string | ObjectId;

  @Property({
    lowercase: true,
    required: true,
    trim: true,
    validate: [{
      message: 'E-mail inválido',
      validator: emailValidator
    }, {
      message: 'E-mail já cadastrado',
      validator: duplicateEmailValidator
    }]
  })
  public address: string;

  @Property({ required: true })
  public isMainEmail: boolean;

  @Property({ required: true, default: false })
  public isVerified: boolean;
}

export class RG {
  /**
   * Número
   */
  @Property({ required: true })
  public number: string;

  /**
   * Emissor
   */
  @Property({ required: true })
  public issuer: string;

  /**
   * Data de emissão
   */
  @Property({ required: true })
  public issueDate: Date;
}

/**
 * Informações de pessoa física
 */
export class PersonalInfo {
  @Property({ required: true })
  public name: string;

  @Property({ required: true })
  public rg: RG;

  @Property({
    required: true,
    validate: {
      message: 'O cliente deve ter pelo menos 18 anos',
      validator: (value: Date) => value <= subYears(new Date(), 18)
    }
  })
  public birthDate: Date;

  @Property({ required: true, validate: cpfValidator, unique: true, sparse: true })
  public cpf: string;

  /**
   * País de nascimento no formato ISO 3166-1 alpha-3
   */
  @Property({ required: true, validate: countryCodeValidator })
  public nationality: string;

  @Property({ required: true, enum: CustomerGenderEnum })
  public gender: CustomerGender;

  @Property()
  public fatherName?: string;

  @Property({ required: true })
  public motherName: string;

  /**
   * Estado civil
   */
  @Property({ required: true, enum: MaritalStatusEnum })
  public maritalStatus: MaritalStatus;

  /**
   * Nome do cônjuge
   */
  @Property()
  public spouseName?: string;
}

/**
 * Informações de pessoa jurídica
 */
export class CompanyInfo {
  /**
   * Razão social
   */
  @Property({ required: true })
  public companyName: string;

  /**
   * Nome fantasia
   */
  @Property({ required: true })
  public tradingName: string;

  @Property({ required: true })
  public municipalRegistration: string;

  @Property({ required: true })
  public stateRegistration: string;

  @Property({ required: true })
  public creationDate: Date;

  @Property({ required: true, validate: cnpjValidator, unique: true, sparse: true })
  public cnpj: string;

  @Property({ required: true })
  public field: string;
}

/**
 * Informações de endereço
 */
export class Address {
  @Property({ required: true })
  public streetAddress: string;

  /**
   * Complemento
   */
  @Property()
  public additionalAddress?: string;

  @Property({ required: true })
  public district: string;

  @Property({ required: true })
  public city: string;

  @Property({ required: true })
  public state: string;

  @Property({ required: true })
  public number: string;

  /**
   * CEP
   */
  @Property({ required: true })
  public zipCode: string;

  /**
   * País no formato ISO 3166-1 alpha-3
   */
  @Property({ required: true, validate: countryCodeValidator })
  public country: string;
}

/**
 * Informações de contato
 */
export class ContactInfo {
  @ArrayProperty({ items: PhoneNumber })
  public phoneNumbers: PhoneNumber[];

  @ArrayProperty({ items: Email })
  public emails: Email[];
}

export class Customer extends Typegoose {
  // tslint:disable-next-line: variable-name
  public _id: string | ObjectId;

  @Property({ required: true })
  public onboarding: string | ObjectId;

  @Property({ required: true })
  public address: Address;

  @Property({ required: true })
  public contactInfo: ContactInfo;

  @Property({ required() { return this.type === 'person'; } })
  public personalInfo?: PersonalInfo;

  @Property({ required() { return this.type === 'company'; } })
  public companyInfo?: CompanyInfo;

  @Property({ enum: CustomerTypeEnum, required: true })
  public type: CustomerType;

  @Property()
  get displayName() {
    if (this.type === 'company') {
      return this.companyInfo.tradingName;
    }

    return this.personalInfo.name;
  }
}

export const CustomerModel =
  new Customer().getModelForClass(Customer, { schemaOptions: { collection: 'customers', timestamps: true } });
