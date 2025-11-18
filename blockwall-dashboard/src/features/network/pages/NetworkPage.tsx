import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Grid, Typography, CircularProgress, Alert } from '@mui/material';
import { fetchNetwork } from '../api';
import { NetworkRequestParams, NetworkResponse, GraphNode } from '../types';
import { NetworkFilters } from '../components/NetworkFilters';
import { NetworkGraph } from '../components/NetworkGraph';
import { NetworkSidebar } from '../components/NetworkSidebar';

export function NetworkPage() {
  const router = useRouter();
  const { user, hashtag, minFollowers, minHashtagUsage, limit } = router.query;

  const [params, setParams] = useState<NetworkRequestParams>({});
  const [data, setData] = useState<NetworkResponse | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize params from query string
  useEffect(() => {
    const initial: NetworkRequestParams = {};

    if (typeof user === 'string' && user.trim()) {
      initial.user = user.trim();
    }
    if (typeof hashtag === 'string' && hashtag.trim()) {
      initial.hashtag = hashtag.trim().replace(/^#/, '');
    }
    if (typeof minFollowers === 'string') {
      const val = Number(minFollowers);
      if (!Number.isNaN(val) && val > 0) initial.minFollowers = val;
    }
    if (typeof minHashtagUsage === 'string') {
      const val = Number(minHashtagUsage);
      if (!Number.isNaN(val) && val > 0) initial.minHashtagUsage = val;
    }
    if (typeof limit === 'string') {
      const val = Number(limit);
      if (!Number.isNaN(val) && val > 0) initial.limit = val;
    } else {
      initial.limit = 200;
    }

    setParams(initial);
  }, [user, hashtag, minFollowers, minHashtagUsage, limit]);

  // Fetch network whenever params change
  useEffect(() => {
    if (!params.user && !params.hashtag) {
      // Don’t auto-fetch with completely empty params
      setData(null);
      setSelectedNode(null);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        console.log('Fetching network with params:', params);
        const res = await fetchNetwork(params);
        console.log('Network response:', res);
        if (!cancelled) {
          setData(res);
          setSelectedNode(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to load network');
          setData(null);
          setSelectedNode(null);
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
  }, [params]);

  const handleApplyFilters = (next: NetworkRequestParams) => {
    // Update URL query so we can share links
    const query: Record<string, string> = {};
    if (next.user) query.user = next.user;
    if (next.hashtag) query.hashtag = next.hashtag;
    if (typeof next.minFollowers === 'number') query.minFollowers = String(next.minFollowers);
    if (typeof next.minHashtagUsage === 'number')
      query.minHashtagUsage = String(next.minHashtagUsage);
    if (typeof next.limit === 'number') query.limit = String(next.limit);

    router.push(
      {
        pathname: '/network',
        query,
      },
      undefined,
      { shallow: true },
    );

    setParams(next);
  };

  const handleExploreUser = (screenName: string) => {
    handleApplyFilters({
      user: screenName,
      minFollowers: params.minFollowers,
      minHashtagUsage: params.minHashtagUsage,
      limit: params.limit ?? 200,
    });
  };

  const handleExploreHashtag = (name: string) => {
    handleApplyFilters({
      hashtag: name,
      minFollowers: params.minFollowers,
      minHashtagUsage: params.minHashtagUsage,
      limit: params.limit ?? 200,
    });
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Network
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Explore the Twitter v2 graph around specific users or hashtags. Use the filters to focus the
        network and click nodes for details.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <NetworkFilters initialParams={params} onApply={handleApplyFilters} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {loading ? (
            <Box
              sx={{
                minHeight: 480,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <NetworkGraph
              nodes={data?.nodes ?? []}
              edges={data?.edges ?? []}
              onNodeClick={setSelectedNode}
            />
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <NetworkSidebar
            selectedNode={selectedNode}
            onExploreUser={handleExploreUser}
            onExploreHashtag={handleExploreHashtag}
          />
        </Grid>
      </Grid>
    </>
  );
}
