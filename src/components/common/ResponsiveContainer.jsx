import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';

const ResponsiveContainer = ({ children, ...props }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        maxWidth: '100%',
        overflow: 'hidden',
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default ResponsiveContainer;

