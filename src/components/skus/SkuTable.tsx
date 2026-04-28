import { RawListing } from "@/types/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  items: RawListing[];
  isLoading: boolean;
}

export function SkuTable({ items, isLoading }: Props) {
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
        No listings found.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU Code</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Inventory</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((listing) => (
            <TableRow key={listing.id}>
              <TableCell className="font-mono text-xs">{listing.sku_code || '—'}</TableCell>
              <TableCell className="font-medium truncate max-w-[250px]" title={listing.product_name}>
                {listing.product_name}
              </TableCell>
              <TableCell>
                {listing.channel === 'shopify' && (
                  <span className="inline-flex px-2 py-0.5 text-[10px] rounded bg-green-100 text-green-800 font-bold capitalize">
                    Shopify
                  </span>
                )}
                {listing.channel === 'amazon' && (
                  <span className="inline-flex px-2 py-0.5 text-[10px] rounded bg-orange-100 text-orange-800 font-bold capitalize">
                    Amazon
                  </span>
                )}
              </TableCell>
              <TableCell>
                {listing.price != null ? `₹${listing.price.toFixed(2)}` : "—"}
              </TableCell>
              <TableCell>
                {listing.quantity_available != null ? listing.quantity_available : "—"}
              </TableCell>
              <TableCell>
                <span className={`inline-flex px-2 py-0.5 text-[10px] rounded font-bold capitalize ${
                  listing.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                }`}>
                  {listing.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
