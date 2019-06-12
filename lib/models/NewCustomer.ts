import { subYears } from 'date-fns';
import { ObjectId } from 'mongodb';
import {
  arrayProp as ArrayProperty,
  ModelType,
  pre as Pre,
  prop as Property,
  staticMethod as StaticMethod,
  Typegoose
} from 'typegoose';
import { cnpjValidator, countryCodeValidator, cpfValidator, emailValidator } from '../../helpers/mongooseValidators';

type NewCustomerStatus = 'pending' | 'preApproved' | 'approved' | 'refused';
type MaritalStatus = 'single' | 'married' | 'divorced' | 'widower' | 'legally-separated';
type NewCustomerType = 'person' | 'company';
type NewCustomerGender = 'male' | 'female' | 'other';

export const MaritalStatusEnum = {
  DIVORCED: 'divorced',
  LEGALLYSEPARATED: 'legally-separated',
  MARRIED: 'married',
  SINGLE: 'single',
  WIDOWER: 'widower'
};

export const NewCustomerStatusEnum = {
  APPROVED: 'approved',
  PENDING: 'pending',
  PREAPPROVED: 'preApproved',
  REFUSED: 'refused'
};

export const NewCustomerTypeEnum = {
  COMPANY: 'company',
  PERSON: 'person'
};

export const NewCustomerGenderEnum = {
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
    'contactInfo.emails.address': value,
    'status': { $ne: NewCustomerStatusEnum.REFUSED }
  };

  if (!document.isNew) {
    query = { ...query, _id: { $ne: document._id } };
  }

  return (await NewCustomerModel.count(query)) === 0;
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

  @Property({ required: true, validate: cpfValidator })
  public cpf: string;

  /**
   * País de nascimento no formato ISO 3166-1 alpha-3
   */
  @Property({ required: true, validate: countryCodeValidator })
  public nationality: string;

  @Property({ required: true, enum: NewCustomerGenderEnum })
  public gender: NewCustomerGender;

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

  @Property({ required: true, validate: cnpjValidator })
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

@Pre<NewCustomer>('validate', function preValidate() {
  // aqui definimos valores padrões para as propriedades
  // para evitar que um valor seja forçado na requisição
  if (this.isNew) {
    this.contactInfo.emails = this.contactInfo.emails.map((e: Email) => {
      e.isVerified = false;

      return e;
    });

    this.contactInfo.phoneNumbers = this.contactInfo.phoneNumbers.map((p: PhoneNumber) => {
      p.isVerified = false;

      return p;
    });

    this.status = NewCustomerStatusEnum.PENDING as NewCustomerStatus;

    if (this.type !== NewCustomerTypeEnum.PERSON) {
      this.personalInfo = undefined;
    } else {
      this.companyInfo = undefined;
    }
  }
})
export class NewCustomer extends Typegoose {
  @StaticMethod
  public static async isAlreadySignedUp(this: ModelType<NewCustomer> & typeof NewCustomer, newCustomer: NewCustomer) {
    const baseQuery = { status: { $ne: NewCustomerStatusEnum.REFUSED } };

    if (newCustomer.type === 'company') {
      return await
        this.count({ ...baseQuery, 'companyInfo.cnpj': newCustomer.companyInfo.cnpj }) > 0;
    }

    return await this.count({ ...baseQuery, 'personalInfo.cpf': newCustomer.personalInfo.cpf }) > 0;
  }

  // tslint:disable-next-line: variable-name
  public _id: string | ObjectId;

  @Property({ required: true })
  public address: Address;

  @Property({ required: true })
  public contactInfo: ContactInfo;

  /**
   * Status do cadastro
   */
  @Property({ enum: NewCustomerStatusEnum, required: true, default: NewCustomerStatusEnum.PENDING })
  public status: NewCustomerStatus;

  /**
   * Motivo de recusa do cadastro (se houver)
   */
  @Property()
  public refusalReason?: string;

  @Property({ required() { return this.type === 'person'; } })
  public personalInfo?: PersonalInfo;

  @Property({ required() { return this.type === 'company'; } })
  public companyInfo?: CompanyInfo;

  @Property({ enum: NewCustomerTypeEnum, required: true })
  public type: NewCustomerType;
}

export const NewCustomerModel =
  new NewCustomer().getModelForClass(NewCustomer, { schemaOptions: { collection: 'newCustomers', timestamps: true } });
