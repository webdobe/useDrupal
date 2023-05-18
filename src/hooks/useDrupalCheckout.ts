// Import custom hooks and utilities
import {useCartToken} from "./useCartToken";
import {getOrder} from "../helpers";
import {useDrupal} from "./useDrupal";
import {useDrupalJsonApi} from "./useDrupalJsonApi";

// Define the useDrupalCheckout hook with an optional includes parameter
export const useDrupalCheckout = (includes = [
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
  const {drupalState: {cart}, setDrupalState} = useDrupal();
  const jsonApi = useDrupalJsonApi({
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      "Commerce-Cart-Token": cartToken,
    },
  });

  // Function to start the checkout process
  const startCheckout = async () => {
    try {
      const order = getOrder(cart);

      const response = await jsonApi.fetch(`/jsonapi/checkout/${order.id}`, {
        include: includes.join(","),
      });

      if (response.data) {
        setDrupalState({cart: response.data});
        console.log("Start Checkout: ", response.data);
      }

      return response;
    } catch (error) {
      console.error("Error starting checkout:", error);

      if (error && error?.response?.data?.message) {
        return { error: error?.response?.data };
      }

      return null;
    }
  };

  // Function to update the checkout data
  const updateCheckout = async (patchData) => {
    try {
      const order = getOrder(cart);
      const url = `/jsonapi/checkout/${order.id}?include=${includes.join(",")}`;
      const response = await jsonApi.patch(url, {data: patchData});

      if (response.data) {
        setDrupalState({cart: response.data});
        console.log("Update Checkout: ", response.data);
      }

      return response;
    } catch (error) {
      console.error("Error updating checkout:", error);

      if (error && error?.response?.data?.message) {
        return { error: error?.response?.data };
      }

      return null;
    }
  };

  // Function to start the checkout process
  const placeOrder = async () => {
    try {
      const order = getOrder(cart);

      const response = await jsonApi.post(`/jsonapi/checkout/${order.id}/payment`, {
        data: {
          // This should be adapted based on the expected payment type.
          // For example, for a "manual" payment, the type should be:
          // 'payment--payment-manual'.
          type: 'payment--acceptjs',
          attributes: {
            capture: true
          }
        }
      });

      if (response.data) {
        setDrupalState({cart: response.data});
        console.log("Place order: ", response.data);
      }

      return response;
    } catch (error) {
      console.error("Error placing order:", error);

      if (error && error?.response?.data?.message) {
        return { error: error?.response?.data };
      }

      return null;
    }
  };

  // Expose the necessary functions and data
  const checkout = {
    startCheckout,
    updateCheckout,
    placeOrder,
  };

  return checkout
}