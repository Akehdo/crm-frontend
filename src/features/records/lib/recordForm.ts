import { useRef } from "react";
import type {
  KeyboardEventHandler,
  RefCallback,
} from "react";

export function calculateTotalPrice(
  weightValue: string,
  unitPriceValue: string,
): number | null {
  if (!weightValue.trim() || !unitPriceValue.trim()) {
    return null;
  }

  const weight = Number(weightValue);
  const unitPrice = Number(unitPriceValue);
  if (
    !Number.isFinite(weight) ||
    weight <= 0 ||
    !Number.isFinite(unitPrice) ||
    unitPrice <= 0
  ) {
    return null;
  }

  return Math.round((weight * unitPrice + Number.EPSILON) * 100) / 100;
}

export function formatRecordPrice(value: number | null): string {
  if (value === null) {
    return "—";
  }

  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

type EnterNavigationProps<TElement extends HTMLElement> = {
  ref: RefCallback<TElement>;
  onKeyDown: KeyboardEventHandler<TElement>;
};

export function useEnterNavigation() {
  const fieldsRef = useRef<Array<HTMLElement | null>>([]);

  return function bindEnterNavigation<TElement extends HTMLElement>(
    index: number,
  ): EnterNavigationProps<TElement> {
    return {
      ref: (element) => {
        fieldsRef.current[index] = element;
      },
      onKeyDown: (event) => {
        if (
          event.currentTarget instanceof HTMLTextAreaElement ||
          (event.key !== "Enter" && event.code !== "NumpadEnter") ||
          event.nativeEvent.isComposing ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey
        ) {
          return;
        }

        const direction = event.shiftKey ? -1 : 1;
        const nextField = fieldsRef.current[index + direction];
        if (!nextField || nextField.hasAttribute("disabled")) {
          return;
        }

        event.preventDefault();
        nextField.focus();

        if (nextField instanceof HTMLInputElement) {
          nextField.select();
        }
      },
    };
  };
}

export function totalPriceToUnitPrice(
  totalPrice: number,
  weight: number,
): string {
  if (!Number.isFinite(weight) || weight <= 0) {
    return String(totalPrice);
  }

  return String(Number((totalPrice / weight).toFixed(6)));
}
