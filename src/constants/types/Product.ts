export interface DefaultProductAttributesProps {
  langcode: string;
  status: boolean;
  title: string;
  created: string;
  changed: string;
  default_langcode: boolean;
  body: string | null;
  path: {
    alias: string | null;
  }
}

export interface DefaultProductProps {
  id: string;
  type: string;
  attributes: DefaultProductAttributesProps;
  relationships: any;
};

export type Price = {
  number: string;
  currency_code: string;
  formatted: string;
};

export interface DefaultProductVariationAttributesProps {
  langcode: string;
  status: boolean;
  sku: string;
  title: string;
  list_price: string | null;
  price: Price;
  created: string;
  changed: string;
  default_langcode: boolean;
  resolved_price: Price;
}

export interface DefaultProductVariationProps {
  id: string;
  type: string;
  attributes: DefaultProductVariationAttributesProps;
  relationships: any;
};