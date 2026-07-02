import { rwf } from "@/lib/utils";

export function TransactionsTable({ transactions }: { transactions: any[] }) {
  return (
    <div className="card table-wrap">
      <table>
        <thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Service</th><th>Package</th><th>Amount</th><th>Status</th><th>Recorded by</th></tr></thead>
        <tbody>
          {transactions.map((item) => (
            <tr key={item.id}>
              <td>{new Date(item.transactionDate).toLocaleDateString()}</td>
              <td>{item.type}</td>
              <td>{item.category.name}</td>
              <td>{item.service?.name ?? "-"}</td>
              <td>{item.package?.name ?? "-"}</td>
              <td>{rwf(item.amount.toString())}</td>
              <td>{item.status}</td>
              <td>{item.recordedBy?.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
