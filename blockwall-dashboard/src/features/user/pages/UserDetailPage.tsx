import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, CircularProgress, Alert, Grid, IconButton, Link } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NextLink from 'next/link';
import { fetchUserDetail } from '../api';
import { UserDetailResponse } from '../types';
import { UserProfileCard } from '../components/UserProfileCard';
import { UserTweetList } from '../components/UserTweetList';

export function UserDetailPage() {
  const router = useRouter();
  const { screenName } = router.query;

  const [data, setData] = useState<UserDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!screenName || Array.isArray(screenName)) {
      setError('Invalid screen name');
      setLoading(false);
      return;
    }

    const sn = screenName;

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetchUserDetail(sn, { limit: 200 });
        if (!cancelled) {
          if (!res.user) {
            setError('User not found in this dataset.');
            setData(null);
          } else {
            setData(res);
            setError(null);
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to load user details');
          setData(null);
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
  }, [screenName]);

  if (!screenName) {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data || !data.user) {
    return (
      <Box sx={{ mt: 3 }}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <Link
            component={NextLink}
            href="/"
            underline="none"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <IconButton size="small" sx={{ mr: 1 }}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" component="span" color="text.secondary">
              Back to overview
            </Typography>
          </Link>
        </Box>
        <Alert severity="error">{error || 'User not found.'}</Alert>
      </Box>
    );
  }

  const user = data.user;

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Link component={NextLink} href="/" underline="none">
          <IconButton size="small" sx={{ mr: 1 }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        </Link>
        <Typography variant="h4">@{user.screen_name}</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <UserProfileCard user={user} />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <UserTweetList tweets={data.tweets} />
        </Grid>
      </Grid>
    </>
  );
}
