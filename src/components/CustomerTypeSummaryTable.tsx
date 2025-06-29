import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

interface CustomerTypeData {
  count: number;
  acv: number;
  closed_fiscal_quarter: string;
  Cust_Type: string;
}

interface Props {
  data: CustomerTypeData[];
}

const CUST_TYPES = ['Existing Customer', 'New Customer'];

function formatMoney(n: number) {
  return `$${(n / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })}K`;
}

export default function CustomerTypeSummaryTable({ data }: Props) {
  if (!data.length) return null;

  // Get all quarters sorted
  const quarters = Array.from(new Set(data.map(d => d.closed_fiscal_quarter))).sort();

  // Aggregate data: { [quarter]: { [Cust_Type]: { count, acv } } }
  const agg: Record<string, Record<string, { count: number; acv: number }>> = {};
  for (const d of data) {
    if (!agg[d.closed_fiscal_quarter]) agg[d.closed_fiscal_quarter] = {};
    if (!agg[d.closed_fiscal_quarter][d.Cust_Type]) agg[d.closed_fiscal_quarter][d.Cust_Type] = { count: 0, acv: 0 };
    agg[d.closed_fiscal_quarter][d.Cust_Type].count += d.count;
    agg[d.closed_fiscal_quarter][d.Cust_Type].acv += d.acv;
  }

  // Totals by quarter
  const totalsByQuarter = quarters.map(q => {
    const totalCount = CUST_TYPES.reduce((sum, t) => sum + (agg[q][t]?.count || 0), 0);
    const totalACV = CUST_TYPES.reduce((sum, t) => sum + (agg[q][t]?.acv || 0), 0);
    return { count: totalCount, acv: totalACV };
  });

  // Grand totals
  const grandTotals = CUST_TYPES.map(t => {
    return {
      count: quarters.reduce((sum, q) => sum + (agg[q][t]?.count || 0), 0),
      acv: quarters.reduce((sum, q) => sum + (agg[q][t]?.acv || 0), 0),
    };
  });
  const grandTotalCount = grandTotals.reduce((sum, t) => sum + t.count, 0);
  const grandTotalACV = grandTotals.reduce((sum, t) => sum + t.acv, 0);

  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell rowSpan={2} sx={{ fontWeight: 'bold', background: '#e3eefa' }}>Cust Type</TableCell>
            {quarters.map(q => (
              <TableCell key={q} align="center" colSpan={3} sx={{ fontWeight: 'bold', background: '#e3eefa' }}>{q}</TableCell>
            ))}
            <TableCell align="center" colSpan={3} sx={{ fontWeight: 'bold', background: '#b3d1f7' }}>Total</TableCell>
          </TableRow>
          <TableRow>
            {quarters.map(q => [
              <TableCell key={q+"opps"} align="right" sx={{ fontWeight: 'bold', background: '#f5faff' }}># of Opps</TableCell>,
              <TableCell key={q+"acv"} align="right" sx={{ fontWeight: 'bold', background: '#f5faff' }}>ACV</TableCell>,
              <TableCell key={q+"pct"} align="right" sx={{ fontWeight: 'bold', background: '#f5faff' }}>% of Total</TableCell>,
            ])}
            <TableCell align="right" sx={{ fontWeight: 'bold', background: '#d0e3fa' }}># of Opps</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', background: '#d0e3fa' }}>ACV</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', background: '#d0e3fa' }}>% of Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {CUST_TYPES.map((type, idx) => {
            const totalCount = quarters.reduce((sum, q) => sum + (agg[q][type]?.count || 0), 0);
            const totalACV = quarters.reduce((sum, q) => sum + (agg[q][type]?.acv || 0), 0);
            return (
              <TableRow key={type}>
                <TableCell sx={{ fontWeight: 'bold', color: idx === 0 ? '#4285F4' : '#FB8C00' }}>{type}</TableCell>
                {quarters.map((q, i) => {
                  const count = agg[q][type]?.count || 0;
                  const acv = agg[q][type]?.acv || 0;
                  const pct = totalsByQuarter[i].acv ? Math.round((acv / totalsByQuarter[i].acv) * 100) : 0;
                  return [
                    <TableCell key={q+type+"count"} align="right">{count}</TableCell>,
                    <TableCell key={q+type+"acv"} align="right">{formatMoney(acv)}</TableCell>,
                    <TableCell key={q+type+"pct"} align="right">{pct}%</TableCell>,
                  ];
                })}
                <TableCell align="right" sx={{ fontWeight: 'bold', background: '#f0f7ff' }}>{totalCount}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', background: '#f0f7ff' }}>{formatMoney(totalACV)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', background: '#f0f7ff' }}>{grandTotalACV ? Math.round((totalACV / grandTotalACV) * 100) : 0}%</TableCell>
              </TableRow>
            );
          })}
          {/* Total row */}
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', background: '#e3eefa' }}>Total</TableCell>
            {quarters.map((q, i) => [
              <TableCell key={q+"totalcount"} align="right" sx={{ fontWeight: 'bold', background: '#f5faff' }}>{totalsByQuarter[i].count}</TableCell>,
              <TableCell key={q+"totalacv"} align="right" sx={{ fontWeight: 'bold', background: '#f5faff' }}>{formatMoney(totalsByQuarter[i].acv)}</TableCell>,
              <TableCell key={q+"totalpct"} align="right" sx={{ fontWeight: 'bold', background: '#f5faff' }}>100%</TableCell>,
            ])}
            <TableCell align="right" sx={{ fontWeight: 'bold', background: '#b3d1f7' }}>{grandTotalCount}</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', background: '#b3d1f7' }}>{formatMoney(grandTotalACV)}</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', background: '#b3d1f7' }}>100%</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
} 