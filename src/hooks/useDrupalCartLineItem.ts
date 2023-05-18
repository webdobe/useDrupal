//-----------LIBRARIES----------//
import { useEffect, useState } from "react";

interface Cart {
  [key: string]: {
    [key: string]: any;
  };
}

interface OrderItem {
  type: string;
  id: string;
}

export const useDrupalCartLineItem = (
  cart: Cart,
  orderItem: OrderItem
) => {
  const [lineItem, setLineItem] = useState<any>({});
  const [product, setProduct] = useState<any>({});
  const [productType, setProductType] = useState<any>({});
  const [productVariation, setProductVariation] = useState<any>({});
  const [productVariationType, setProductVariationType] = useState<any>({});

  const getLineItem = () => {
    setLineItem(cart[orderItem.type][orderItem.id]);
  };

  const getProduct = () => {
    const product_id = productVariation?.relationships?.product_id?.data;
    if (product_id) {
      setProduct(cart[product_id.type][product_id.id]);
    }
  };

  const getProductType = () => {
    const product_type = product?.relationships?.product_type?.data;
    if (product_type) {
      setProductType(cart[product_type.type][product_type.id]);
    }
  };

  const getProductVariation = () => {
    const purchased_entity = lineItem?.relationships?.purchased_entity?.data;
    if (purchased_entity) {
      setProductVariation(cart[purchased_entity.type][purchased_entity.id]);
    }
  };

  const getProductVariationType = () => {
    const product_variation_type = productVariation?.relationships?.product_variation_type?.data;
    if (product_variation_type) {
      setProductVariationType(
        cart[product_variation_type.type][product_variation_type.id]
      );
    }
  };

  useEffect(() => {
    getLineItem();
  }, [cart]);

  useEffect(() => {
    getProductVariation();
  }, [lineItem]);

  useEffect(() => {
    getProduct();
    getProductVariationType();
  }, [productVariation]);

  useEffect(() => {
    getProductType();
  }, [product]);

  return {
    lineItem,
    product,
    productType,
    productVariation,
    productVariationType,
  };
};
