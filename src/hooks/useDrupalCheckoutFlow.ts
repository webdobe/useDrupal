//----------Libraries-----------//
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import useDrupal from "./useDrupal";
import {getOrder} from "../helpers";

export interface CheckoutFlowProps {
  step: string;
}

export interface CheckoutFlow {
  orderId: string;
  currentStep: string;
  setStep: Dispatch<SetStateAction<string>>;
  nextStep: () => void;
  prevStep: () => void;
}

export const useDrupalCheckoutFlow = (checkoutFlow: CheckoutFlowProps[], id: string = '', path: string = "/checkout"): CheckoutFlow => {
  const {drupalState: {user, cart}} = useDrupal();
  const [step, setStep] = useState<string>(checkoutFlow[0].step);
  const [orderId, setOrderId] = useState<string>(id);

  const prev = () => {
    const index = checkoutFlow.findIndex((f) => f.step === step) - 1;
    if (index >= 0) {
      setStep(checkoutFlow[index].step);
    }
  };

  const next = () => {
    const index = checkoutFlow.findIndex((f) => f.step === step) + 1;
    if (index < checkoutFlow.length) {
      setStep(checkoutFlow[index].step);
    }
  };

  const getStepByLocation = async () => {
    if (window && window.location) {
      const route = window.location.pathname.split("/").filter(n => n);
      if (window.location.pathname === path) {
        const newStep = checkoutFlow[0].step;
        setStep(newStep);
      } else {
        if (route[0] === path.substring(1) && route[2]) {
          setStep(route[2]);
        }
      }
    }
  }

  // Update url once we have the step and order id.
  useEffect(() => {
    const newPath = `${path}/${orderId}/${step}`;
    if (step && orderId && window.location.pathname !== newPath) {
      window.location.href = newPath;
    }
  }, [step, orderId]);

  // Set order id once the user cart loads.
  useEffect(() => {
    const order = getOrder(cart);
    if (user && cart && !orderId) {
      setOrderId(order.id);
    }
  }, [user, cart]);

  return {
    orderId: orderId,
    currentStep: step,
    setStep: setStep,
    nextStep: next,
    prevStep: prev,
  };
};