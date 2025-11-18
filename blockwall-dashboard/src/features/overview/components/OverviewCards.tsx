import { Grid, Card, CardContent, Typography } from '@mui/material';
import { Totals } from '../types';

interface OverviewCardsProps {
  totals: Totals;
}

export function OverviewCards({ totals }: OverviewCardsProps) {
  const items = [
    { label: 'Users', value: totals.users },
    { label: 'Tweets', value: totals.tweets },
    { label: 'Hashtags', value: totals.hashtags },
  ];

  return (
    <Grid container spacing={3}>
      {items.map((item) => (
        <Grid size={{ xs: 12, sm: 4 }} key={item.label}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="h5" sx={{ mt: 1 }}>
                {item.value.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
