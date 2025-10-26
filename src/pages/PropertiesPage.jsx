import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  Home,
  LocationOn,
  AttachMoney,
  Apartment,
  CheckCircle,
  FilterList,
  Search,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

import { propertyService } from '../services/firebaseService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ResponsiveContainer from '../components/common/ResponsiveContainer';
import ResponsiveHeader from '../components/common/ResponsiveHeader';
import { useAuth } from '../contexts/AuthContext';
import AuthDebug from '../components/AuthDebug';

const PropertiesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const auth = useAuth();
  const { user, userId, userRole, organizationId } = auth;
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Debug logging - DETAILED
  console.log('🏠 PropertiesPage mounted');
  console.log('👤 Full Auth Context:', auth);
  console.log('👤 Auth Values:', { 
    user: user?.uid, 
    userId, 
    userRole, 
    organizationId,
    hasUser: !!user,
    hasUserId: !!userId,
    hasUserRole: !!userRole,
    hasOrganizationId: !!organizationId
  });

  // Fetch properties
  const {
    data: properties = [],
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['properties', user?.uid, userRole, organizationId],
    () => {
      console.log('🔄 React Query calling propertyService.getAll with:', {
        userId: user?.uid,
        userRole,
        organizationId
      });
      return propertyService.getAll(user?.uid, userRole, organizationId);
    },
    {
      enabled: !!user, // Changed from !!userId to !!user
      staleTime: 0, // Always fetch fresh data
      cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      onSuccess: (data) => {
        console.log('✅ React Query onSuccess:', data);
      },
      onError: (err) => {
        console.error('❌ React Query error fetching properties:', err);
      },
    }
  );

  // Add useEffect to track when data changes
  useEffect(() => {
    console.log('📊 Properties data changed:', { 
      count: properties?.length || 0, 
      isLoading,
      error: error?.message 
    });
  }, [properties, isLoading, error]);

  // Delete property mutation
  const deletePropertyMutation = useMutation(
    (propertyId) => propertyService.delete(propertyId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('properties');
        toast.success('Property deleted successfully');
        setDeleteDialogOpen(false);
        setSelectedProperty(null);
      },
      onError: (error) => {
        toast.error(`Failed to delete property: ${error.message}`);
      },
    }
  );

  const handleMenuClick = (event, property) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedProperty(property);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProperty(null);
  };

  const handleEdit = () => {
    if (selectedProperty) {
      navigate(`/app/properties/${selectedProperty.id}?edit=true`);
    }
    handleMenuClose();
  };

  const handleViewDetails = (property) => {
    navigate(`/app/properties/${property.id}`);
  };

  // Filter properties based on search and filters
  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location?.village?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location?.district?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    const matchesType = typeFilter === 'all' || property.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDelete = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedProperty) {
      deletePropertyMutation.mutate(selectedProperty.id);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'occupied':
        return 'success';
      case 'vacant':
        return 'warning';
      case 'maintenance':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'occupied':
        return 'Occupied';
      case 'vacant':
        return 'Vacant';
      case 'maintenance':
        return 'Maintenance';
      default:
        return status;
    }
  };

  // Calculate property value statistics
  const getPropertyValue = (property) => {
    if (property.type === 'building' && property.buildingDetails) {
      const floors = property.buildingDetails.floors || [];
      return floors.reduce((total, floor) => {
        const floorValue = floor.spaces?.reduce((spaceTotal, space) => spaceTotal + (space.monthlyRent || 0), 0) || 0;
        return total + floorValue;
      }, 0);
    } else if (property.type === 'land' && property.landDetails) {
      const squatters = property.landDetails.squatters || [];
      return squatters.reduce((total, squatter) => total + (squatter.monthlyPayment || 0), 0);
    }
    return 0;
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading properties..." />;
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load properties. Please try again.
      </Alert>
    );
  }

  return (
    <ResponsiveContainer>
      <ResponsiveHeader
        title="Properties Management"
        subtitle="Manage your property portfolio"
        icon={<Home color="primary" />}
        actions={[
          <Button
            key="add"
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/app/properties/new')}
          >
            Create Property
          </Button>,
        ]}
      />

      {/* Debug Info - Remove in production */}
      <AuthDebug />

      {/* Property Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Home sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" color="primary.main">
                  Total Properties
                </Typography>
              </Box>
              <Typography variant="h4" color="primary.main">
                {properties.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In your portfolio
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Apartment sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="h6" color="success.main">
                  Buildings
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {properties.filter(p => p.type === 'building').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Commercial & Residential
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOn sx={{ color: 'warning.main', mr: 1 }} />
                <Typography variant="h6" color="warning.main">
                  Land
                </Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {properties.filter(p => p.type === 'land').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Land parcels
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle sx={{ color: 'info.main', mr: 1 }} />
                <Typography variant="h6" color="info.main">
                  Active
                </Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {properties.filter(p => p.status === 'occupied' || p.status === 'vacant').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Operational properties
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search properties by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Filter by Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="occupied">Occupied</MenuItem>
                <MenuItem value="vacant">Vacant</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="under_construction">Under Construction</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Filter by Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="building">Building</MenuItem>
                <MenuItem value="land">Land</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>

        {/* Quick Filter Chips */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={`${properties.filter(p => p.status === 'occupied').length} Occupied`}
            color={properties.filter(p => p.status === 'occupied').length > 0 ? 'success' : 'default'}
            onClick={() => setStatusFilter('occupied')}
            variant={statusFilter === 'occupied' ? 'filled' : 'outlined'}
          />
          <Chip
            label={`${properties.filter(p => p.status === 'vacant').length} Vacant`}
            color={properties.filter(p => p.status === 'vacant').length > 0 ? 'warning' : 'default'}
            onClick={() => setStatusFilter('vacant')}
            variant={statusFilter === 'vacant' ? 'filled' : 'outlined'}
          />
          <Chip
            label={`${properties.filter(p => p.status === 'maintenance').length} Under Maintenance`}
            color={properties.filter(p => p.status === 'maintenance').length > 0 ? 'error' : 'default'}
            onClick={() => setStatusFilter('maintenance')}
            variant={statusFilter === 'maintenance' ? 'filled' : 'outlined'}
          />
          <Chip
            label={`${properties.filter(p => p.type === 'building').length} Buildings`}
            color={properties.filter(p => p.type === 'building').length > 0 ? 'info' : 'default'}
            onClick={() => setTypeFilter('building')}
            variant={typeFilter === 'building' ? 'filled' : 'outlined'}
          />
          <Chip
            label={`${properties.filter(p => p.type === 'land').length} Land`}
            color={properties.filter(p => p.type === 'land').length > 0 ? 'info' : 'default'}
            onClick={() => setTypeFilter('land')}
            variant={typeFilter === 'land' ? 'filled' : 'outlined'}
          />
        </Box>
      </Paper>

      {/* Properties Grid */}
      {filteredProperties.length > 0 ? (
        <Grid container spacing={3}>
          {filteredProperties.map((property) => (
            <Grid item xs={12} sm={6} md={4} key={property.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => navigate(`/properties/${property.id}`)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {property.name}
                      </Typography>
                      <Chip
                        label={getStatusLabel(property.status)}
                        color={getStatusColor(property.status)}
                        size="small"
                      />
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, property)}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {property.location?.village}, {property.location?.district}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Home fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {property.type?.charAt(0).toUpperCase() + property.type?.slice(1)} • {property.ownershipType || 'Unknown'}
                    </Typography>
                  </Box>

                  {/* Property Value */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AttachMoney fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="h6" color="success.main">
                      UGX {getPropertyValue(property).toLocaleString()}/month
                    </Typography>
                  </Box>

                  {/* Quick Action Button */}
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(property);
                      }}
                    >
                      View Details
                    </Button>
                  </Box>

                  {property.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {property.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : properties.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            backgroundColor: 'grey.50',
            borderRadius: 2,
            border: '2px dashed',
            borderColor: 'grey.300',
          }}
        >
          <Home sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No properties found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start by adding your first property to begin tracking rent and payments.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/app/properties/new')}
          >
            Add Your First Property
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            backgroundColor: 'grey.50',
            borderRadius: 2,
            border: '2px dashed',
            borderColor: 'grey.300',
          }}
        >
          <Search sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No properties match your filters
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your search or filter criteria.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setTypeFilter('all');
            }}
          >
            Clear All Filters
          </Button>
        </Box>
      )}

      {/* Property Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit Property
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete Property
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Property</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedProperty?.name}"? This will also delete all related rent records and payments.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            disabled={deletePropertyMutation.isLoading}
          >
            {deletePropertyMutation.isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </ResponsiveContainer>
  );
};

export default PropertiesPage;
