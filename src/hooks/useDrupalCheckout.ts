import { useCartToken } from "./useCartToken";
import { getOrder } from "../helpers";
import { useDrupal } from "./useDrupal";
import { useDrupalJsonApi, ApiResponse } from "./useDrupalJsonApi";

interface ResponseData {
  message?: string;
}

interface DrupalResponse<T = unknown> extends ApiResponse<T> {
  response?: { data?: ResponseData; };
  error?: Error;
}

type PatchData = { [key: string]: any };

export const useDrupalCheckout = (includes: string[] = [
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
]) => {
  const cartToken = useCartToken();
  const { drupalState: { cart }, setDrupalState } = useDrupal();
  const jsonApi = useDrupalJsonApi({
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      "Commerce-Cart-Token": cartToken,
    },
  });

  const startCheckout = async (): Promise<DrupalResponse | null> => {
    try {
      const order = getOrder(cart);
      const response = await jsonApi.fetch(`/jsonapi/checkout/${order.id}`, {
        include: includes.join(","),
      });

      if (response && response.data) {
        setDrupalState({ cart: response.data });
      }

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error : new Error("An error starting checkout.") };
    }
  };

  const updateCheckout = async (patchData: PatchData): Promise<DrupalResponse | null> => {
    try {
      const order = getOrder(cart);
      const url = `/jsonapi/checkout/${order.id}?include=${includes.join(",")}`;
      const response = await jsonApi.patch(url, { data: patchData });

      if (response && response.data) {
        setDrupalState({ cart: response.data });
      }

      return response;
    } catch (error) {
      return { error: error instanceof Error ? error : new Error("An error occurred updating checkout.") };
    }
  };

  const placeOrder = async (): Promise<DrupalResponse | null> => {
    try {
      const order = getOrder(cart);

      const response = await jsonApi.post(`/jsonapi/checkout/${order.id}/payment`, {
        data: {
          type: 'payment--acceptjs',
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
