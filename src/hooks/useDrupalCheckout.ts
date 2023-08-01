import useDrupal from "./useDrupal";
import { useDrupalCartToken } from "./useDrupalCartToken";
import {createUrl, getOrder} from "../helpers";
import useDrupalJsonApi, {JsonApiParams, JsonApiResponse} from "./useDrupalJsonApi";
import {useState} from "react";

interface ResponseData {
  message?: string;
}

interface DrupalResponse<T = unknown> extends JsonApiResponse<T> {
  response?: { data?: ResponseData; };
  error?: Error;
}

type PatchData = { [key: string]: any };

const defaultCheckoutParams = {
  include: [
    "uid",
    "order_type",
    "store_id",
    "checkout_flow",
    "payment_method",
    "coupons",
    "order_items",
    "order_items.purchased_entity.product_variation_type",
    "order_items.purchased_entity.product_id",
    "order_items.purchased_entity.product_id.product_type",
  ].join(",")
}

const defaultPaymentParams = {
  include: [
    "payment_gateway",
    "payment_method",
    "order_id",
    "order_id.store_id",
    "order_id.coupons",
    "order_id.order_items",
    "order_id.order_items.purchased_entity.product_variation_type",
    "order_id.order_items.purchased_entity.product_id",
    "order_id.order_items.purchased_entity.product_id.product_type",
  ].join(",")
}

export const useDrupalCheckout = (initialCheckoutParams?: JsonApiParams, initialPaymentParams?: JsonApiParams) => {
  const cartToken = useDrupalCartToken();
  const {config: { defaultCheckoutQueryParams, defaultPaymentQueryParams }, drupalState: { cart }, setDrupalState} = useDrupal();
  const [checkoutParams] = useState(initialCheckoutParams || defaultCheckoutQueryParams || defaultCheckoutParams);
  const [paymentParams] = useState(initialPaymentParams || defaultPaymentQueryParams || defaultPaymentParams);
  const jsonApi = useDrupalJsonApi('', {}, {
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      "Commerce-Cart-Token": cartToken,
    },
  });

  const startCheckout = async (): Promise<DrupalResponse> => {
    try {
      const order = getOrder(cart);
      const response = await jsonApi.fetch(`/jsonapi/checkout/${order.id}`, checkoutParams);

      if (response && response.data) {
        setDrupalState({ cart: response.data });
      }

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error : new Error("An error starting checkout.") };
    }
  };

  const updateCheckout = async (patchData: PatchData): Promise<DrupalResponse> => {
    try {
      const order = getOrder(cart);
      const response = await jsonApi.patch(createUrl(`/jsonapi/checkout/${order.id}`, checkoutParams), { data: patchData });

      if (response && response.data) {
        setDrupalState({ cart: response.data });
      }

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error : new Error("An error occurred updating checkout.") };
    }
  };

  const placeOrder = async (paymentType: string = 'payment--acceptjs'): Promise<DrupalResponse> => {
    try {
      const order = getOrder(cart);
      const response = await jsonApi.post(createUrl(`/jsonapi/checkout/${order.id}/payment`, paymentParams), {
        data: {
          type: paymentType,
          attributes: {
            capture: true
          }
        }
      });

      if (response && response.data) {
        setDrupalState({ cart: response.data });
      }

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error : new Error("An error occurred placing order.") };
    }
  };

  return {
    startCheckout,
    updateCheckout,
    placeOrder,
  };
}
