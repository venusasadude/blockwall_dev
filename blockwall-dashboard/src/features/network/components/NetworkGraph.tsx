import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { GraphNode, GraphEdge } from '../types';

const ForceGraph2D = dynamic(
  () => import('react-force-graph-2d'),
  { ssr: false },
);

export interface NetworkGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick?: (node: GraphNode) => void;
}

interface Dimensions {
  width: number;
  height: number;
}

export function NetworkGraph({ nodes, edges, onNodeClick }: NetworkGraphProps) {
  const theme = useTheme();
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });

  const data = useMemo(
    () => ({
      nodes: nodes.map((n) => ({
        id: n.id,
        label: n.label,
        type: n.type,
      })),
      links: edges.map((e) => ({
        source: e.from,
        target: e.to,
        type: e.type,
      })),
    }),
    [nodes, edges],
  );

  // Observe container size and keep width/height in sync
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Always re-fit when data OR dimensions change
  useEffect(() => {
    if (!fgRef.current) return;
    if (!nodes.length || !edges.length) return;
    if (!dimensions.width || !dimensions.height) return;

    try {
      fgRef.current.zoomToFit(400, 80); // (ms, padding)
    } catch {
      // ignore
    }
  }, [nodes.length, edges.length, dimensions.width, dimensions.height]);

  const userColor = theme.palette.primary.main;
  const tweetColor = theme.palette.secondary.main;
  const hashtagColor = '#F59E0B';
  const linkBase = alpha(theme.palette.primary.main, 0.25);

  if (nodes.length === 0) {
    return (
      <Box
        sx={{
          height: '100%',
          minHeight: 320,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.paper',
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No data for the current filter. Try adjusting user/hashtag or limits.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        height: '100%',
        minHeight: 480,
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(248,250,252,0.9))',
        boxShadow: '0 24px 80px rgba(15,23,42,0.16)',
        border: '1px solid rgba(148,163,184,0.35)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Node/edge count pill */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 1,
          bgcolor: alpha('#FFFFFF', 0.9),
          px: 1.25,
          py: 0.5,
          borderRadius: 999,
          border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {nodes.length} nodes • {edges.length} edges
        </Typography>
      </Box>

      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        backgroundColor="rgba(255,255,255,0)"
        width={dimensions.width || undefined}
        height={dimensions.height || undefined}
        linkColor={(link: any) => {
          switch (link.type) {
            case 'POSTS':
              return alpha(userColor, 0.55);
            case 'TAGS':
              return alpha(hashtagColor, 0.65);
            case 'MENTIONS':
              return alpha(tweetColor, 0.6);
            case 'FOLLOWS':
              return alpha(theme.palette.text.secondary, 0.4);
            case 'REPLY_TO':
              return alpha('#10B981', 0.55);
            case 'RETWEETS':
              return alpha('#22C55E', 0.55);
            default:
              return linkBase;
          }
        }}
        linkWidth={0.9}
        linkDirectionalParticles={1}
        linkDirectionalParticleWidth={1}
        linkDirectionalParticleColor={(link: any) => {
          switch (link.type) {
            case 'POSTS':
              return alpha(userColor, 0.9);
            case 'TAGS':
              return alpha(hashtagColor, 0.9);
            case 'MENTIONS':
              return alpha(tweetColor, 0.9);
            case 'FOLLOWS':
              return alpha(theme.palette.text.secondary, 0.8);
            case 'REPLY_TO':
              return alpha('#10B981', 0.9);
            case 'RETWEETS':
              return alpha('#22C55E', 0.9);
            default:
              return alpha(theme.palette.primary.main, 0.9);
          }
        }}
        onNodeClick={(node: any) => {
          const found = nodes.find((n) => n.id === node.id);
          if (found && onNodeClick) onNodeClick(found);
        }}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.label;
          const fontSize = 10 / globalScale;

          let fillColor = userColor;
          if (node.type === 'Tweet') fillColor = tweetColor;
          if (node.type === 'Hashtag') fillColor = hashtagColor;

          let radius = 6;
          if (node.type === 'User') radius = 8;
          if (node.type === 'Tweet') radius = 6;
          if (node.type === 'Hashtag') radius = 5;

          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
          ctx.fillStyle = fillColor;
          ctx.fill();

          ctx.lineWidth = 1.5 / globalScale;
          ctx.strokeStyle = alpha('#000000', 0.45);
          ctx.stroke();

          ctx.font = `${fontSize}px Inter`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillStyle = theme.palette.text.primary;
          ctx.fillText(label, node.x, node.y + radius + 2);
        }}
        nodeCanvasObjectMode={() => 'after'}
      />
    </Box>
  );
}
