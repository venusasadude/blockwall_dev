import { Card, CardContent, CardHeader, Avatar, Typography, Chip, Box, Link } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { UserProfile } from '../types';

interface UserProfileCardProps {
  user: UserProfile;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const followerLabel = user.followers !== null ? user.followers.toLocaleString() : '—';
  const followingLabel = user.following !== null ? user.following.toLocaleString() : '—';
  const statusesLabel = user.statuses !== null ? user.statuses.toLocaleString() : '—';

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar
            src={user.profile_image_url || undefined}
            alt={user.name || user.screen_name}
            sx={{ width: 56, height: 56 }}
          >
            {(user.name || user.screen_name).charAt(0).toUpperCase()}
          </Avatar>
        }
        title={
          <Box>
            <Typography variant="h6">{user.name || user.screen_name}</Typography>
            <Typography variant="body2" color="text.secondary">
              @{user.screen_name}
            </Typography>
          </Box>
        }
        subheader={
          user.location ? (
            <Typography variant="body2" color="text.secondary">
              {user.location}
            </Typography>
          ) : null
        }
      />
      <CardContent>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          <Chip label={`Followers: ${followerLabel}`} size="small" />
          <Chip label={`Following: ${followingLabel}`} size="small" />
          <Chip label={`Statuses: ${statusesLabel}`} size="small" />
        </Box>

        {user.url && (
          <Link
            href={user.url}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
          >
            <OpenInNewIcon fontSize="small" />
            <Typography variant="body2">Profile / Website</Typography>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
