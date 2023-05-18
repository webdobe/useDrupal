export interface OrderAddress {
  country_code: string;
  administrative_area: string;
  locality: string;
  postal_code: string;
  address_line1: string;
  organization: string;
  given_name: string;
  family_name: string;
}

export interface OrderTaxNumber {
  type: string | null;
  value: string | null;
}

export interface OrderBillingInformation {
  address: OrderAddress;
  tax_number: OrderTaxNumber;
}

export interface OrderShippingInformation {
  address: OrderAddress;
  tax_number: OrderTaxNumber;
}

export interface OrderPaymentDetails {
  card_type: string;
  card_number: string;
  card_exp_month: string;
  card_exp_year: string;
}

export interface OrderPaymentInstrument {
  payment_gateway_id: string;
  payment_method_id: string;
  payment_method_type: string;
  payment_details: OrderPaymentDetails;
}

interface OrderAmount {
  number: string;
  currency_code: string;
  formatted: string;
}

export interface OrderSubtotal {
  number: string;
  currency_code: string;
  formatted: string;
}

export interface OrderTotalAdjustment {
  type: string;
  label: string;
  amount: OrderAmount;
  total: OrderAmount;
  percentage: string | null;
  source_id: string;
  included: boolean;
  locked: boolean;
}

export interface OrderTotal {
  subtotal: OrderSubtotal;
  adjustments: OrderTotalAdjustment[];
  total: OrderAmount;
}

export interface OrderAttributes {
  order_number: string | null;
  email: string;
  total_price: OrderAmount;
  total_paid: string | null;
  state: string;
  billing_information: OrderBillingInformation;
  shipping_information: OrderShippingInformation;
  shipping_method: string;
  payment_instrument: OrderPaymentInstrument;
  order_total: OrderTotal;
}

export interface PaymentOption {
  id: string;
  label: string;
  payment_gateway_id: string;
  payment_method_id: string | null;
  payment_method_type_id: string | null;
}

export interface ShippingRate {
  id: string;
  shipping_method_id: string;
  service: { id: string; label: string };
  original_amount: OrderAmount;
  amount: OrderAmount;
  description: string;
  delivery_date: string | null;
  data: any[]; // If the data array has a specific structure, replace 'any' with the appropriate type
}

export interface OrderMeta {
  payment_options: PaymentOption[];
  shipping_rates: ShippingRate[];
}

export interface OrderProps {
  id: string;
  type: string;
  attributes: OrderAttributes;
  meta: OrderMeta;
}