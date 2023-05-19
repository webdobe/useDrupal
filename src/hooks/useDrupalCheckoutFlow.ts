//----------Libraries-----------//
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import useDrupal from "./useDrupal";
import {getOrder} from "../helpers";

import {useDrupalCheckout} from "./useDrupalCheckout";

export interface CheckoutFlowProps {
  step: string;
}

export interface CheckoutFlow {
  currentStep: string;
  setStep: Dispatch<SetStateAction<string>>;
  nextStep: () => void;
  prevStep: () => void;
}

export const useDrupalCheckoutFlow = (checkoutFlow: CheckoutFlowProps[], path: string = "/checkout"): CheckoutFlow => {
  const {drupalState: {user, cart}} = useDrupal();
  const {startCheckout} = useDrupalCheckout();
  const [step, setStep] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");

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
        const newStep = user.id ? checkoutFlow[1].step : checkoutFlow[0].step;
        setStep(newStep);
      } else {
        if (route[0] === path.substring(1) && route[2]) {
          setStep(route[2]);
        }
      }
    }
  }

  const handleStartCheckout = async () => {
    const order = getOrder(cart);
    await startCheckout();
    setOrderId(order.id);
  }

  // Update url once we have the step and order id.
  useEffect(() => {
    if (step && orderId) {
      history.pushState({}, "", `${path}/${orderId}/${step}`);
    }
  }, [step, orderId]);

  // Set order id and start checkout once the user cart loads.
  useEffect(() => {
    if (user && cart && !orderId) {
      handleStartCheckout();
      getStepByLocation();
    }
  }, [user, cart]);

  return {
    currentStep: step,
    setStep: setStep,
    nextStep: next,
    prevStep: prev,
  };
};