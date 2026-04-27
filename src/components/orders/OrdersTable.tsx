import { OrderRecord } from "@/types/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  items: OrderRecord[];
  isLoading: boolean;
}

export function OrdersTable({ items, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500">
        No orders found. Connect a channel and sync data to see orders here.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>SKU Code</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((order) => (
            <TableRow key={order.raw_order_id}>
              <TableCell className="font-mono text-xs">{order.platform_order_id}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${order.channel === 'shopify' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'}`}>
                  {order.channel === 'shopify' ? 'Shopify' : 'Amazon'}
                </span>
              </TableCell>
              <TableCell className="font-mono text-xs">{order.sku_code || "—"}</TableCell>
              <TableCell className="truncate max-w-[200px]" title={order.product_title || ""}>
                {order.product_title ? (order.product_title.length > 30 ? order.product_title.substring(0, 30) + '...' : order.product_title) : "—"}
              </TableCell>
              <TableCell>{order.quantity}</TableCell>
              <TableCell>₹{(order.selling_price_per_unit || 0).toFixed(2)}</TableCell>
              <TableCell className="font-bold">₹{order.total_sale_price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
              <TableCell>
                {order.return_status ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                    Returned
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Delivered
                  </span>
                )}
              </TableCell>
              <TableCell>{new Date(order.ordered_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
