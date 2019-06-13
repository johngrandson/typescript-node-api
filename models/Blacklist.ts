import { arrayProp as ArrayProperty, prop as Property, Typegoose } from 'typegoose';

class Reason {
  @Property({ required: true })
  public origin: string;

  @Property()
  public reason?: string;
}

export class Blacklist extends Typegoose {
  @Property({ required() { return !this.cnpj; } })
  public cpf: string;

  @Property({ required() { return !this.cpf; } })
  public cnpj: string;

  @ArrayProperty({ items: Reason })
  public reasons: Reason[];
}

export const BlacklistModel =
  new Blacklist().getModelForClass(Blacklist, { schemaOptions: { collection: 'blacklist', timestamps: true } });
