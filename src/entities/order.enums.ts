export enum OrderStatus {
  PENDING = 'pending', // در انتظار پرداخت
  PAID = 'paid', // پرداخت شده
  PROCESSING = 'processing', // در حال پردازش
  SHIPPED = 'shipped', // ارسال شده
  DELIVERED = 'delivered', // تحویل داده شده
  CANCELLED = 'cancelled', // لغو شده
  REFUNDED = 'refunded', // بازگشت وجه
}

export enum PaymentMethod {
  ONLINE = 'online',
  CASH_ON_DELIVERY = 'cash_on_delivery',
  WALLET = 'wallet',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}
