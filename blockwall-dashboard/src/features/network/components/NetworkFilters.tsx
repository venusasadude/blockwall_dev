import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Typography,
  Box,
  Button,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { NetworkRequestParams } from '../types';

type NetworkMode = 'user' | 'hashtag';

interface NetworkFiltersProps {
  initialParams: NetworkRequestParams;
  onApply: (params: NetworkRequestParams) => void;
}

export function NetworkFilters({ initialParams, onApply }: NetworkFiltersProps) {
  // derive initial mode from URL / initialParams
  const derivedMode: NetworkMode =
    initialParams.hashtag && !initialParams.user ? 'hashtag' : 'user';

  const [mode, setMode] = useState<NetworkMode>(derivedMode);
  const [user, setUser] = useState(initialParams.user ?? '');
  const [hashtag, setHashtag] = useState(initialParams.hashtag ?? '');
  const [minFollowers, setMinFollowers] = useState(
    initialParams.minFollowers?.toString() ?? '',
  );
  const [limit, setLimit] = useState(initialParams.limit?.toString() ?? '200');
  const [minHashtagUsage, setMinHashtagUsage] = useState(
    initialParams.minHashtagUsage?.toString() ?? '',
  );

  // sync from URL/query changes
  useEffect(() => {
    setUser(initialParams.user ?? '');
    setHashtag(initialParams.hashtag ?? '');
    setMinFollowers(
      initialParams.minFollowers !== undefined
        ? String(initialParams.minFollowers)
        : '',
    );
    setLimit(
      initialParams.limit !== undefined ? String(initialParams.limit) : '200',
    );
    setMinHashtagUsage(
      initialParams.minHashtagUsage !== undefined
        ? String(initialParams.minHashtagUsage)
        : '',
    );

    const nextMode: NetworkMode =
      initialParams.hashtag && !initialParams.user ? 'hashtag' : 'user';
    setMode(nextMode);
  }, [
    initialParams.user,
    initialParams.hashtag,
    initialParams.minFollowers,
    initialParams.limit,
    initialParams.minHashtagUsage,
  ]);

  const handleModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    nextMode: NetworkMode | null,
  ) => {
    if (!nextMode) return;
    setMode(nextMode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const next: NetworkRequestParams = {};

    if (mode === 'user') {
      const trimmedUser = user.trim();
      if (trimmedUser) {
        next.user = trimmedUser;
      }
    } else {
      const trimmedHashtag = hashtag.trim().replace(/^#/, '');
      if (trimmedHashtag) {
        next.hashtag = trimmedHashtag;
      }
    }

    const parsedMinFollowers = minFollowers ? Number(minFollowers) : undefined;
    const parsedLimit = limit ? Number(limit) : undefined;
    const parsedMinHashtagUsage = minHashtagUsage
      ? Number(minHashtagUsage)
      : undefined;

    if (!Number.isNaN(parsedMinFollowers!) && parsedMinFollowers! > 0) {
      next.minFollowers = parsedMinFollowers;
    }
    if (!Number.isNaN(parsedLimit!) && parsedLimit! > 0) {
      next.limit = parsedLimit;
    }
    if (
      !Number.isNaN(parsedMinHashtagUsage!) &&
      parsedMinHashtagUsage! > 0
    ) {
      next.minHashtagUsage = parsedMinHashtagUsage;
    }

    onApply(next);
  };

  const handleReset = () => {
    setUser('');
    setHashtag('');
    setMinFollowers('');
    setLimit('200');
    setMinHashtagUsage('');
    setMode('user');
    onApply({ limit: 200 });
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Search & Filters
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Choose a user or hashtag as the focus, then narrow the network using
          follower and hashtag usage thresholds.
        </Typography>

        {/* Mode toggle */}
        <Box sx={{ mb: 2 }}>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleModeChange}
            size="small"
          >
            <ToggleButton value="user">User network</ToggleButton>
            <ToggleButton value="hashtag">Hashtag network</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {/* Only show the relevant primary field for the current mode */}
            {mode === 'user' ? (
              <TextField
                label="User (@screen_name)"
                size="small"
                value={user}
                placeholder="nasa"
                onChange={(e) => setUser(e.target.value)}
                helperText="Focus the graph on a single user"
              />
            ) : (
              <TextField
                label="Hashtag"
                size="small"
                value={hashtag}
                placeholder="#space"
                onChange={(e) => setHashtag(e.target.value)}
                helperText="Focus the graph on a single hashtag"
              />
            )}

            <TextField
              label="Min Followers"
              size="small"
              value={minFollowers}
              placeholder="1000"
              onChange={(e) => setMinFollowers(e.target.value)}
              helperText="Only include users with at least this many followers"
            />
            <TextField
              label="Max Tweets (limit)"
              size="small"
              value={limit}
              placeholder="200"
              onChange={(e) => setLimit(e.target.value)}
              helperText="Cap the number of tweets pulled into the network"
            />
            <TextField
              label="Min Hashtag Usage"
              size="small"
              value={minHashtagUsage}
              placeholder="10"
              onChange={(e) => setMinHashtagUsage(e.target.value)}
              helperText="Only show hashtags that appear in at least this many tweets"
            />

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button variant="text" onClick={handleReset}>
                Reset
              </Button>
              <Button type="submit" variant="contained">
                Apply
              </Button>
            </Box>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
