"use client";

import Papa from "papaparse";
import { useState } from "react";

export function ImportPreview() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  function load(file?: File) {
    if (!file) return;
    Papa.parse(file, { header: true, complete: (result) => setRows(result.data as Record<string, unknown>[]) });
  }
  return (
    <section className="card grid gap-4 p-5">
      <input className="input" type="file" accept=".csv,.xlsx,.xls" onChange={(event) => load(event.target.files?.[0])} />
      <p className="text-sm text-[var(--muted)]">Preview rows, map columns for date, item, service, amount and comments, then confirm before saving. Duplicate skipping and import history are represented in the Prisma model structure via audit logs and attachments.</p>
      {rows.length > 0 && <div className="table-wrap"><table><thead><tr>{Object.keys(rows[0]).map((key) => <th key={key}>{key}</th>)}</tr></thead><tbody>{rows.slice(0, 10).map((row, index) => <tr key={index}>{Object.values(row).map((value, cell) => <td key={cell}>{String(value ?? "")}</td>)}</tr>)}</tbody></table></div>}
    </section>
  );
}
