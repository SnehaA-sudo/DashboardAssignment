"use client";
import { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import D3StackedBarChart from '../components/D3StackedBarChart';
import D3DoughnutChart from '../components/D3DoughnutChart';
import CustomerTypeSummaryTable from '../components/CustomerTypeSummaryTable';

// Types for the data
interface CustomerTypeData {
  count: number;
  acv: number;
  closed_fiscal_quarter: string;
  Cust_Type: string;
}

export default function DashboardPage() {
  // State management for the component
  const [data, setData] = useState<CustomerTypeData[]>([]);  // Stores the fetched customer data
  const [loading, setLoading] = useState(true);              // Controls loading spinner display
  const [error, setError] = useState<string | null>(null);   // Stores error messages if API call fails


  useEffect(() => {
    fetch("/api/customer-type")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load data");
        setLoading(false);
      });
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: 2, width: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold' }}>
        Won ACV mix by Cust Type
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            <Box sx={{ flex: { xs: 1, md: 2 }, width: '100%' }}>
              <Card>
                <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                        <D3StackedBarChart data={data} />
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: { xs: 1, md: 1 }, width: '100%' }}>
              <Card>
                <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                  <D3DoughnutChart data={data} />
                </CardContent>
              </Card>
            </Box>
          </Box>
          <CustomerTypeSummaryTable data={data} />
        </Box>
      )}
    </Container>
  );
}
