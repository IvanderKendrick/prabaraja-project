
import { Link } from "react-router-dom";

export function PurchaseHeader() {
  return (
    <div className="p-6">
      <div className="max-w-full mx-auto">
        <div>
          <h1 className="text-2xl font-semibold text-black">Purchases</h1>
          <p className="text-muted-foreground">Manage your purchase transactions</p>
        </div>
      </div>
    </div>
  );
}
