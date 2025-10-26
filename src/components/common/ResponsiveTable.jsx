import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';

const ResponsiveTable = ({ 
  children, 
  stickyHeader = false, 
  maxHeight = 'none',
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ width: '100%', overflow: 'auto' }}>
      <TableContainer 
        component={Paper}
        sx={{
          maxHeight: maxHeight,
          '& .MuiTable-root': {
            minWidth: isMobile ? 600 : 'auto', // Ensure horizontal scroll on mobile
          },
        }}
        {...props}
      >
        <Table 
          stickyHeader={stickyHeader}
          sx={{
            '& .MuiTableCell-root': {
              padding: { xs: '8px', sm: '16px' },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            },
            '& .MuiTableHead-root .MuiTableCell-root': {
              fontWeight: 600,
              backgroundColor: theme.palette.grey[50],
            },
          }}
        >
          {children}
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ResponsiveTable;

