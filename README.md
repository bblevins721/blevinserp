# BlevinsERP

BlevinsERP is currently an empty repository, so this first slice establishes a working product foundation rather than scattering placeholder modules through an undefined architecture.

## What is here

- A dependency-free BlevinsERP command center.
- Responsive navigation for Overview, Finance, Procurement, People, Operations, Reports, and Settings.
- Illustrative KPI cards for cash, receivables, commitments, and approvals.
- Interactive cash-movement range controls.
- Approval queue with review actions.
- Searchable activity table.
- Quick-action modal for transactions, vendors, and approvals.
- Snapshot export for the starter workspace.
- A small Node static server with no runtime dependencies.

The numbers are explicitly illustrative. The interface is ready for the next vertical slice: connecting a real ledger and replacing the demo records with governed data.

## Run locally

```bash
npm run dev
```

Then open [http://127.0.0.1:4173](http://127.0.0.1:4173).

If Node is not available, the static files can also be served with:

```bash
python3 -m http.server 4173
```

## Verification

```bash
npm run check
```

## Recommended next slices

1. Decide the system of record for the finance module and define the ledger adapter seam.
2. Add authentication, organizations/entities, roles, and an audit log before connecting sensitive data.
3. Replace the illustrative dashboard state with typed API responses and loading/error states.
4. Build the first end-to-end workflow: purchase request → approval → commitment → payment record.

