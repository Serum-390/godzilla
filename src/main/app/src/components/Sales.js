import { Button } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import { useState } from 'react';
import useSalesPageStyles from "../styles/salesPageStyles";
import { SpinBeforeLoading } from "./inventory/Inventory";

const cols = [
  { field: 'id', headerName: 'ID', width: 130 },
  { field: 'vendorName', headerName: 'Vendor', width: 130 },
  { field: 'vendorAddress', headerName: 'Address', width: 130 },
  { field: 'vendorPhone', headerName: 'Contact #', width: 130 },
  {
    field: 'salesOrders',
    headerName: 'Sales Orders',
    width: 160,
    renderCell: params => (
      <div style={{ margin: 'auto' }}>
        <Button variant='contained'
          color='secondary'
          onClick={params.value.onClick}>
          Show
        </Button>
      </div>
    ),
  },
];

const getSales = async () => {
  const api = '/api/sales/';
  const got = await fetch(api);
  const json = await got.json();

  if (!json.sales) return [];

  return json.sales.map(sale => {
    sale.salesOrders = {
      onClick: () => alert(`Test: ${sale.vendorName}`),
    };
    return sale;
  });
};

const SalesGrid = ({ className, columns, rows, onRowClick }) => {
  return (
    <div className={className}>
      <h1>Sales</h1>
      <DataGrid
        columns={columns}
        rows={rows}
        onRowClick={onRowClick}
      />
    </div>
  );
};

function Sales() {
  const classes = useSalesPageStyles();
  const [rows, setRows] = useState([]);

  const waitForGetRequest = async () => getSales().then(sales => setRows(sales));
  const handleRowclick = params => console.log(params);

  return (
    <SpinBeforeLoading minLoadingTime={500} awaiting={waitForGetRequest}>
      <SalesGrid
        className={classes.root}
        columns={cols}
        rows={rows}
        onRowClick={handleRowclick}
      />
    </SpinBeforeLoading>
  );
}

export default Sales;
