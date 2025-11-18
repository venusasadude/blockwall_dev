import { Card, CardContent, Typography, Chip, Box, Link, Button } from '@mui/material';
import NextLink from 'next/link';
import { GraphNode } from '../types';

interface NetworkSidebarProps {
  selectedNode: GraphNode | null;
  onExploreUser?: (screenName: string) => void;
  onExploreHashtag?: (name: string) => void;
}

export function NetworkSidebar({
  selectedNode,
  onExploreUser,
  onExploreHashtag,
}: NetworkSidebarProps) {
  if (!selectedNode) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Node Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click a node in the graph to see more information.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (selectedNode.type === 'User') {
    const u = selectedNode;

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            User
          </Typography>
          <Typography variant="subtitle1">@{u.screen_name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {u.name}
          </Typography>

          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`Followers: ${u.followers !== null ? u.followers.toLocaleString() : '—'}`}
              size="small"
            />
          </Box>

          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button size="small" variant="contained" onClick={() => onExploreUser?.(u.screen_name)}>
              View Network
            </Button>
            <Button
              size="small"
              variant="outlined"
              component={NextLink}
              href={`/user/${encodeURIComponent(u.screen_name)}`}
            >
              Open User Page
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (selectedNode.type === 'Tweet') {
    const t = selectedNode;
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Tweet
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {t.text}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t.created_at ? new Date(t.created_at).toLocaleString() : ''}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Hashtag
  const h = selectedNode;
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Hashtag
        </Typography>
        <Typography variant="subtitle1">#{h.name}</Typography>
        {typeof h.usageCount === 'number' && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Usage in dataset: {h.usageCount.toLocaleString()}
          </Typography>
        )}
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button size="small" variant="contained" onClick={() => onExploreHashtag?.(h.name)}>
            Explore Hashtag
          </Button>
          <Link
            component={NextLink}
            href={`/network?hashtag=${encodeURIComponent(h.name)}`}
            variant="body2"
            underline="hover"
            sx={{ alignSelf: 'center' }}
          >
            Open in own view
          </Link>
        </Box>
      </CardContent>
    </Card>
  );
}
