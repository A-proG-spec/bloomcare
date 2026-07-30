export const ORDER_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
} as const;

export const ORDER_STATUS_COLORS: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
  [ORDER_STATUS.PENDING]: 'warning',
  [ORDER_STATUS.CONFIRMED]: 'info',
  [ORDER_STATUS.PROCESSING]: 'info',
  [ORDER_STATUS.SHIPPED]: 'info',
  [ORDER_STATUS.DELIVERED]: 'success',
  [ORDER_STATUS.CANCELLED]: 'danger',
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  [ORDER_STATUS.PENDING]: 'Order Pending',
  [ORDER_STATUS.CONFIRMED]: 'Order Confirmed',
  [ORDER_STATUS.PROCESSING]: 'Being Processed',
  [ORDER_STATUS.SHIPPED]: 'On the Way',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
};