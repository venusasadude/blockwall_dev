import { Card, CardContent, Typography, List, ListItem, ListItemText } from '@mui/material';
import { TopHashtag } from '../types';

interface TopHashtagsListProps {
  hashtags: TopHashtag[];
}

export function TopHashtagsList({ hashtags }: TopHashtagsListProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Most Used Hashtags
        </Typography>
        <List dense>
          {hashtags.map((h) => (
            <ListItem key={h.name} disableGutters>
              <ListItemText primary={`#${h.name}`} secondary={`${h.usageCount} uses`} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
