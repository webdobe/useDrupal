// Import necessary libraries
import {useEffect, useMemo, useState} from "react";

// Import custom hooks and utilities
import {useCartToken} from "./useCartToken";
import {stringify} from "../helpers";
import {useDrupal} from "./useDrupal";
import {useDrupalJsonApi} from "./useDrupalJsonApi";

// Define the useDrupalCarts hook with an optional orderType parameter
export const useDrupalCarts = (orderType = "order--default") => {
  const cartToken = useCartToken();
  const {drupalState, setDrupalState} = useDrupal();
  const [isLoading, setIsLoading] = useState(false);
  const jsonApi = useDrupalJsonApi({
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      "Commerce-Cart-Token": cartToken,
    },
  });

  // Function to fetch the cart data
  const getCart = async () => {
    setIsLoading(true);
    // Define the include parameters for the request
    const includes = [
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
    ];

    // Make the request and store the response
    const { data } = await jsonApi.fetch(`/jsonapi/carts`, {
      include: includes.join(","),
    });

    // Update the state with the fetched data
    if (data && data[orderType]) {
      setDrupalState({cart: data});
    }

    setIsLoading(false);

    return data
  };

  // Function to get the current order object
  const currentOrder = (orderIndex = 0) => {
    let order = null;
    if (drupalState.cart && drupalState.cart[orderType]) {
      let orderKeys = Object.keys(drupalState.cart[orderType]);
      order = drupalState.cart[orderType][orderKeys[orderIndex]];
    }
    return order;
  };

  // Function to add an item to the cart
  const addToCart = async (lineItems, quantity, combine = true) => {
    let cartItems = JSON.parse(stringify(lineItems));

    cartItems = cartItems.map((item) => ({ ...item, meta: { quantity, combine } }));

    await jsonApi.post(`/jsonapi/cart/add`, {
      data: cartItems,
    });

    await getCart();
  };

  // Function to modify the quantity of an item in the cart
  const modifyItemQuantity = async (cartId, lineItem) => {
    let cartItem = {
      id: lineItem.id,
      type: lineItem.type,
      attributes: lineItem?.attributes,
    };
    await jsonApi.patch(`/jsonapi/carts/${cartId}/items/${lineItem.id}`, {
      data: cartItem,
    });
    await getCart();
  };

  // Function to delete an item from the cart
  const deleteItem = async (cartId, lineItem) => {
    let cartItem = {
      data: [
        {
          id: lineItem.id,
          type: lineItem.type,
        },
      ],
    };
    await jsonApi.delete(`/jsonapi/carts/${cartId}/items`, cartItem);
    await getCart();
  };

  // Expose the necessary functions and data
  return {
    isLoading,
    getCart,
    currentOrder,
    addToCart,
    deleteItem,
    modifyItemQuantity,
  }
}