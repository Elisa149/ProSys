import React from 'react';
import {
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';

const ResponsiveHeader = ({ 
  title, 
  subtitle,
  icon,
  actions,
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      mb={3}
      flexDirection={{ xs: 'column', sm: 'row' }}
      gap={{ xs: 2, sm: 0 }}
      {...props}
    >
      <Box display="flex" alignItems="center" gap={2}>
        {icon}
        <Box>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontSize: { xs: '1.5rem', sm: '2rem' },
              fontWeight: 600,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography 
              variant="body1" 
              color="textSecondary"
              sx={{ 
                fontSize: { xs: '0.875rem', sm: '1rem' },
                mt: 0.5,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      
      {actions && (
        <Box 
          display="flex" 
          gap={2} 
          width={{ xs: '100%', sm: 'auto' }}
          flexDirection={{ xs: 'column', sm: 'row' }}
        >
          {React.Children.map(actions, (action, index) => (
            <Box key={index} width={{ xs: '100%', sm: 'auto' }}>
              {React.cloneElement(action, {
                fullWidth: isMobile ? true : action.props.fullWidth,
                size: isMobile ? 'medium' : action.props.size || 'large',
              })}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ResponsiveHeader;

