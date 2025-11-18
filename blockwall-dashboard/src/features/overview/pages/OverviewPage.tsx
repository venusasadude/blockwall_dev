import { useEffect, useState } from 'react';
import { Grid, Typography, CircularProgress, Alert, Box } from '@mui/material';
import { fetchOverview } from '../api';
import { OverviewResponse } from '../types';
import { OverviewCards } from '../components/OverviewCards';
import { TopUsersTable } from '../components/TopUsersTable';
import { TopHashtagsList } from '../components/TopHashtagsList';

export function OverviewPage() {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetchOverview();
        if (!cancelled) {
          setData(res);
          setError(null);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load overview';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        {error || 'Unknown error loading overview.'}
      </Alert>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Overview
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        High-level metrics and key actors from the Twitter v2 Neo4j graph.
      </Typography>

      <OverviewCards totals={data.totals} />

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <TopUsersTable users={data.topUsersByTweets} />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <TopHashtagsList hashtags={data.topHashtags} />
        </Grid>
      </Grid>
    </>
  );
}
