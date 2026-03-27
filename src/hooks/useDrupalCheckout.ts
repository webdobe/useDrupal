import useDrupal from "./useDrupal";
import { useDrupalCartToken } from "./useDrupalCartToken";
import {createUrl, getOrder, isBrowser} from "../helpers";
import useDrupalJsonApi, {JsonApiParams, JsonApiResponse} from "./useDrupalJsonApi";
import {useState, useRef} from "react";

// Global lock to prevent concurrent checkout updates
let checkoutLock: Promise<any> | null = null;

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
  const {config: { defaultCheckoutQueryParams, defaultPaymentQueryParams }, drupalState: { cart }, setDrupalState, storage} = useDrupal();
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

  const updateCheckout = async (patchData: PatchData, retryCount = 0): Promise<DrupalResponse> => {
    const MAX_RETRIES = 3;

    // Wait for any existing checkout operation to complete
    if (checkoutLock) {
      try {
        await checkoutLock;
      } catch (e) {
        // Ignore errors from previous operations
      }
    }

    // Create a new lock for this operation
    const operation = (async (): Promise<DrupalResponse> => {
      try {
        // Use current cart order for the patch
        const order = getOrder(cart);
        const response = await jsonApi.patch(createUrl(`/jsonapi/checkout/${order.id}`, checkoutParams), { data: patchData });

        // Only refresh state after successful patch
        if (response.data) {
          setDrupalState({ cart: response.data });
        }

        return response;
      } catch (error: any) {
        // On 409 conflict error (order version mismatch), refresh and retry
        const is409 = error?.response?.status === 409 ||
                      error?.message?.includes('409') ||
                      error?.response?.data?.errors?.[0]?.code === 'order_version_mismatch';

        if (is409 && retryCount < MAX_RETRIES) {
          console.log(`Order version conflict, retrying (${retryCount + 1}/${MAX_RETRIES})...`);
          // Refresh to get latest order state
          await startCheckout();
          // Small delay before retry
          await new Promise(resolve => setTimeout(resolve, 100 * (retryCount + 1)));
          // Retry with incremented count
          checkoutLock = null;
          return updateCheckout(patchData, retryCount + 1);
        }

        // Extract error message from Axios response if available
        // JSON:API errors come in response.data.errors array
        const apiErrors = error?.response?.data?.errors;
        let errorMessage = "An error occurred updating checkout.";
        if (apiErrors && Array.isArray(apiErrors) && apiErrors.length > 0) {
          // Combine all error details, or use the first one
          errorMessage = apiErrors.map((e: any) => e.detail || e.title || e.message).filter(Boolean).join('; ');
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }

        const wrappedError = new Error(errorMessage);
        return { error: wrappedError };
      }
    })();

    checkoutLock = operation;
    return operation;
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
        // Keep the completed order data for the confirmation page
        setDrupalState({ cart: response.data });

        // Clear the cart token so a new cart is created for future orders
        // This prevents the completed order from being reused as the cart
        if (isBrowser() && storage) {
          await storage.removeItem('cartToken');
        }
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
