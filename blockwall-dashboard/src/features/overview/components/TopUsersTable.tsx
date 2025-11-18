import {
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Link,
} from '@mui/material';
import NextLink from 'next/link';
import { TopUserByTweets } from '../types';

interface TopUsersTableProps {
  users: TopUserByTweets[];
}

export function TopUsersTable({ users }: TopUsersTableProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Top Users by Tweets
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell align="right">Tweets</TableCell>
              <TableCell align="right">Followers</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.screen_name}>
                <TableCell>
                  <Link
                    component={NextLink}
                    href={`/user/${encodeURIComponent(u.screen_name)}`}
                    underline="hover"
                  >
                    @{u.screen_name}
                  </Link>
                  <Typography variant="body2" color="text.secondary">
                    {u.name}
                  </Typography>
                </TableCell>
                <TableCell align="right">{u.tweetCount}</TableCell>
                <TableCell align="right">
                  {u.followers !== null ? u.followers.toLocaleString() : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
