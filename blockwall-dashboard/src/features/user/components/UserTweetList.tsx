import {
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Box,
} from '@mui/material';
import { UserTweet } from '../types';

interface UserTweetListProps {
  tweets: UserTweet[];
}

export function UserTweetList({ tweets }: UserTweetListProps) {
  if (tweets.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Tweets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No tweets found for this user in the current dataset.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Tweets
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Text</TableCell>
              <TableCell width={160}>Created</TableCell>
              <TableCell width={80} align="right">
                Favs
              </TableCell>
              <TableCell width={220}>Hashtags</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tweets.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <Typography variant="body2">{t.text}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {t.created_at ? new Date(t.created_at).toLocaleString() : ''}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {t.favorites !== null ? t.favorites.toLocaleString() : '—'}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {t.hashtags.map((h) => (
                      <Chip key={h} label={`#${h}`} size="small" />
                    ))}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
