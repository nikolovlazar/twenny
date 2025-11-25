interface OrderItem {
  name: string;
  quantity: number;
  price: string;
}

interface OrderSummaryProps {
  items: OrderItem[];
  subtotal: number;
  tax: number;
  fees: number;
  total: number;
}

export function OrderSummary({ items, subtotal, tax, fees, total }: OrderSummaryProps) {
  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900">Order Summary</h2>

      <div className="mb-4 space-y-3 border-b pb-4">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <div>
              <p className="font-medium text-zinc-900">{item.name}</p>
              <p className="text-zinc-600">Quantity: {item.quantity}</p>
            </div>
            <p className="font-medium text-zinc-900">
              ${(parseFloat(item.price) * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-600">Subtotal</span>
          <span className="font-medium text-zinc-900">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-600">Tax (8%)</span>
          <span className="font-medium text-zinc-900">${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-600">Service Fee (5%)</span>
          <span className="font-medium text-zinc-900">${fees.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t pt-2 text-base">
          <span className="font-semibold text-zinc-900">Total</span>
          <span className="font-semibold text-zinc-900">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

