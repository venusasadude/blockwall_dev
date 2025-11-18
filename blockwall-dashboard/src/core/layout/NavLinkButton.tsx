import { Button } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface NavLinkButtonProps {
  href: string;
  label: string;
}

export function NavLinkButton({ href, label }: NavLinkButtonProps) {
  const router = useRouter();
  const isActive = href === '/' ? router.pathname === '/' : router.pathname.startsWith(href);

  return (
    <Button
      component={Link}
      href={href}
      size="small"
      color={isActive ? 'primary' : 'inherit'}
      sx={{
        textTransform: 'none',
        fontWeight: isActive ? 600 : 400,
        opacity: isActive ? 1 : 0.75,
      }}
    >
      {label}
    </Button>
  );
}
