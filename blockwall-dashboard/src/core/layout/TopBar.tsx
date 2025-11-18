import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import HubIcon from '@mui/icons-material/Hub';
import { NavLinkButton } from './NavLinkButton';

export function TopBar() {
  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar sx={{ gap: 2 }}>
        
        {/* Logo + Title */}
        <HubIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Blockwall Twitter Graph</Typography>

        {/* Navigation */}
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1, ml: 3 }}>
          <NavLinkButton href="/" label="Overview" />
          <NavLinkButton href="/network" label="Network" />
        </Box>

        {/* Tech label (right aligned) */}
        <Box
          sx={{
            fontSize: 12,
            opacity: 0.7,
            display: { xs: 'none', md: 'block' },
          }}
        >
          Neo4j • Node.js • Next.js
        </Box>
      </Toolbar>
    </AppBar>
  );
}
