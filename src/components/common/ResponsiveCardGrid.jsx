import React from 'react';
import { Grid, Card, CardContent, useTheme, useMediaQuery } from '@mui/material';

const ResponsiveCardGrid = ({ 
  children, 
  spacing = 3,
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Grid 
      container 
      spacing={isMobile ? 2 : spacing}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <Grid 
          item 
          xs={12} 
          sm={6} 
          md={4} 
          lg={3}
          key={index}
        >
          {child}
        </Grid>
      ))}
    </Grid>
  );
};

export default ResponsiveCardGrid;

