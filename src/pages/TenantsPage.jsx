import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  People,
  Person,
  Phone,
  Email,
  LocationOn,
  AttachMoney,
  CalendarMonth,
  Home,
  Apartment,
  Terrain,
  Search,
  FilterList,
  Clear,
  Visibility,
  Edit,
  Payment,
  Warning,
  CheckCircle,
  Download,
} from '@mui/icons-material';
import { format, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';

import { propertyService, rentService } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ResponsiveContainer from '../components/common/ResponsiveContainer';
import ResponsiveHeader from '../components/common/ResponsiveHeader';
import ResponsiveTable from '../components/common/ResponsiveTable';
import PropertySelectorDialog from '../components/PropertySelectorDialog';
import confirmAction from '../utils/confirmAction';

const TenantsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userId, userRole, organizationId } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leaseEndFrom, setLeaseEndFrom] = useState('');
  const [leaseEndTo, setLeaseEndTo] = useState('');
  const [propertyDialog, setPropertyDialog] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [editForm, setEditForm] = useState({
    tenantName: '',
    tenantPhone: '',
    tenantEmail: '',
    nationalId: '',
    emergencyContact: '',
    monthlyRent: '',
    leaseStart: '',
    leaseEnd: '',
    status: 'active',
  });
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedSpaceId, setSelectedSpaceId] = useState('');

  // Fetch all properties
  const {
    data: properties = [],
    isLoading: propertiesLoading,
    error: propertiesError,
  } = useQuery(
    'properties',
    () => propertyService.getAll(userId, userRole, organizationId),
    {
      enabled: !!userId,
      onError: (err) => {
        console.error('Error fetching properties:', err);
      },
    }
  );

  // Fetch all rent records
  const {
    data: rentRecords = [],
    isLoading: rentLoading,
    error: rentError,
  } = useQuery(
    'rent',
    () => rentService.getAll(userId, userRole, organizationId),
    {
      enabled: !!userId,
      onError: (err) => {
        console.error('Error fetching rent records:', err);
      },
    }
  );

  if (propertiesLoading || rentLoading) {
    return <LoadingSpinner message="Loading tenant information..." />;
  }

  if (propertiesError || rentError) {
    return (
      <ResponsiveContainer>
        <Alert severity="error" sx={{ m: 2 }}>
          Failed to load tenant data: {propertiesError?.message || rentError?.message}
        </Alert>
      </ResponsiveContainer>
    );
  }

  // Extract tenants from rent records
  const getAllTenants = () => {
    const tenants = [];
    
    rentRecords.forEach(rent => {
      if (rent.tenantName && rent.spaceId) {
        // Find the property and space details
        let propertyInfo = null;
        let spaceInfo = null;
        
        properties.forEach(property => {
          if (property.type === 'building' && property.buildingDetails?.floors) {
            property.buildingDetails.floors.forEach(floor => {
              floor.spaces?.forEach(space => {
                if (space.spaceId === rent.spaceId) {
                  propertyInfo = property;
                  spaceInfo = {
                    ...space,
                    floorNumber: floor.floorNumber,
                    floorName: floor.floorName,
                    propertyType: 'building'
                  };
                }
              });
            });
          } else if (property.type === 'land' && property.landDetails?.squatters) {
            property.landDetails.squatters.forEach(squatter => {
              if (squatter.squatterId === rent.spaceId) {
                propertyInfo = property;
                spaceInfo = {
                  spaceName: squatter.assignedArea,
                  spaceType: 'land_area',
                  monthlyRent: squatter.monthlyPayment,
                  propertyType: 'land'
                };
              }
            });
          }
        });

        if (propertyInfo && spaceInfo) {
          const today = new Date();
          let daysUntilExpiry = null;
          let isExpired = false;
          let isExpiringSoon = false;
          
          if (rent.leaseEnd) {
            const leaseEndDate = new Date(rent.leaseEnd);
            daysUntilExpiry = differenceInDays(leaseEndDate, today);
            isExpiringSoon = daysUntilExpiry <= 20 && daysUntilExpiry > 0;
            isExpired = daysUntilExpiry < 0;
          }
          
          tenants.push({
            id: rent.id,
            tenantName: rent.tenantName,
            phone: rent.tenantPhone,
            email: rent.tenantEmail,
            nationalId: rent.nationalId,
            emergencyContact: rent.emergencyContact,
            monthlyRent: rent.monthlyRent,
            leaseStart: rent.leaseStart,
            leaseEnd: rent.leaseEnd,
            daysUntilExpiry,
            isExpiringSoon,
            isExpired,
            // Property info
            propertyId: propertyInfo.id,
            propertyName: propertyInfo.name,
            propertyType: propertyInfo.type,
            propertyAddress: `${propertyInfo.location?.village}, ${propertyInfo.location?.district}`,
            location: propertyInfo.location,
            // Space info
            spaceId: rent.spaceId,
            spaceName: spaceInfo.spaceName,
            spaceType: spaceInfo.spaceType,
            floorNumber: spaceInfo.floorNumber,
            size: spaceInfo.size,
            amenities: spaceInfo.amenities || [],
          });
        }
      }
    });

    return tenants;
  };

  const allTenants = getAllTenants();
  
  console.log('👥 All tenants processed:', allTenants.length);
  console.log('👥 All tenants:', allTenants);

  // Filter tenants based on search and filters
  const filterTenants = (tenants) => {
    let filtered = tenants;

    // Filter by tab
    if (tabValue === 1) {
      filtered = filtered.filter(tenant => tenant.isExpiringSoon); // Expiring soon
    } else if (tabValue === 2) {
      filtered = filtered.filter(tenant => tenant.isExpired); // Expired leases
    }

    // Filter by property
    if (propertyFilter !== 'all') {
      filtered = filtered.filter(tenant => tenant.propertyId === propertyFilter);
    }

    // Filter by status
    if (statusFilter === 'active') {
      filtered = filtered.filter(tenant => !tenant.isExpired);
    } else if (statusFilter === 'expiring') {
      filtered = filtered.filter(tenant => tenant.isExpiringSoon);
    } else if (statusFilter === 'expired') {
      filtered = filtered.filter(tenant => tenant.isExpired);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(tenant => 
        tenant.tenantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.phone?.includes(searchTerm) ||
        tenant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.spaceName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by lease end date range
    if (leaseEndFrom) {
      const from = new Date(leaseEndFrom);
      filtered = filtered.filter(tenant => tenant.leaseEnd && new Date(tenant.leaseEnd) >= from);
    }
    if (leaseEndTo) {
      const to = new Date(leaseEndTo);
      // Normalize end of day for inclusive filtering
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter(tenant => tenant.leaseEnd && new Date(tenant.leaseEnd) <= to);
    }

    return filtered;
  };

  const filteredTenants = filterTenants(allTenants);
  const expiringSoonTenants = allTenants.filter(tenant => tenant.isExpiringSoon);
  const expiredTenants = allTenants.filter(tenant => tenant.isExpired);

  const getStatusColor = (tenant) => {
    if (tenant.isExpired) return 'error';
    if (tenant.isExpiringSoon) return 'warning';
    return 'success';
  };

  const getStatusLabel = (tenant) => {
    if (tenant.isExpired) return 'Expired';
    if (tenant.isExpiringSoon) return 'Expiring Soon';
    return 'Active';
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  const exportAllTenantsToCSV = () => {
    const rows = allTenants.map(t => ({
      TenantName: t.tenantName || '',
      Phone: t.phone || '',
      Email: t.email || '',
      NationalId: t.nationalId || '',
      EmergencyContact: t.emergencyContact || '',
      PropertyName: t.propertyName || '',
      PropertyType: t.propertyType || '',
      SpaceName: t.spaceName || '',
      SpaceType: t.spaceType || '',
      FloorNumber: t.floorNumber ?? '',
      MonthlyRent: t.monthlyRent ?? '',
      LeaseStart: t.leaseStart ? new Date(t.leaseStart).toISOString() : '',
      LeaseEnd: t.leaseEnd ? new Date(t.leaseEnd).toISOString() : '',
      Status: getStatusLabel(t),
      PropertyAddress: t.propertyAddress || '',
    }));

    const headers = Object.keys(rows[0] || {
      TenantName: '', Phone: '', Email: '', NationalId: '', EmergencyContact: '', PropertyName: '', PropertyType: '', SpaceName: '', SpaceType: '', FloorNumber: '', MonthlyRent: '', LeaseStart: '', LeaseEnd: '', Status: '', PropertyAddress: ''
    });

    const escape = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (/[",\n]/.test(str)) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const csv = [headers.join(',')]
      .concat(rows.map(r => headers.map(h => escape(r[h])).join(',')))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'prosys all tenants.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openEditDialog = (tenant) => {
    setEditingTenant(tenant);
    setEditForm({
      tenantName: tenant.tenantName || '',
      tenantPhone: tenant.phone || '',
      tenantEmail: tenant.email || '',
      nationalId: tenant.nationalId || '',
      emergencyContact: tenant.emergencyContact || '',
      monthlyRent: tenant.monthlyRent ?? '',
      leaseStart: tenant.leaseStart ? new Date(tenant.leaseStart).toISOString().slice(0, 10) : '',
      leaseEnd: tenant.leaseEnd ? new Date(tenant.leaseEnd).toISOString().slice(0, 10) : '',
      status: tenant.status || 'active',
    });
    setSelectedPropertyId(tenant.propertyId || '');
    setSelectedSpaceId(tenant.spaceId || '');
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTenant) return;

    const tenantLabel = editingTenant.tenantName || 'this tenant';
    if (!confirmAction(`Save changes for ${tenantLabel}?`)) {
      return;
    }
    try {
      const updates = {
        tenantName: editForm.tenantName || null,
        tenantPhone: editForm.tenantPhone || null,
        tenantEmail: editForm.tenantEmail || null,
        nationalId: editForm.nationalId || null,
        emergencyContact: editForm.emergencyContact || null,
        monthlyRent: editForm.monthlyRent !== '' ? Number(editForm.monthlyRent) : null,
        leaseStart: editForm.leaseStart ? new Date(editForm.leaseStart) : null,
        leaseEnd: editForm.leaseEnd ? new Date(editForm.leaseEnd) : null,
        status: editForm.status || 'active',
      };

      // If property changed or space changed, include property/space fields
      if (selectedPropertyId && (selectedPropertyId !== editingTenant.propertyId)) {
        const prop = properties.find(p => p.id === selectedPropertyId);
        if (prop) {
          updates.propertyId = prop.id;
          updates.propertyName = prop.name;
          updates.organizationId = prop.organizationId || null;
        }
      }
      if (selectedSpaceId && (selectedSpaceId !== editingTenant.spaceId)) {
        // Find selected space label
        const prop = properties.find(p => p.id === (selectedPropertyId || editingTenant.propertyId));
        if (prop) {
          if (prop.type === 'building' && prop.buildingDetails?.floors) {
            let found;
            prop.buildingDetails.floors.forEach(f => {
              f.spaces?.forEach(s => {
                if (s.spaceId === selectedSpaceId) found = s;
              });
            });
            if (found) {
              updates.spaceId = found.spaceId;
              updates.spaceName = found.spaceName;
            }
          } else if (prop.type === 'land' && prop.landDetails?.squatters) {
            const sq = prop.landDetails.squatters.find(sq => sq.squatterId === selectedSpaceId);
            if (sq) {
              updates.spaceId = sq.squatterId;
              updates.spaceName = sq.assignedArea;
            }
          }
        }
      }

      await rentService.update(editingTenant.id, updates);
      toast.success('Tenant information updated');
      setEditDialogOpen(false);
      setEditingTenant(null);
      await queryClient.invalidateQueries('rent');
    } catch (e) {
      // Error toasts handled in service
    }
  };

  return (
    <ResponsiveContainer>
      <ResponsiveHeader
        title="All Tenants Management"
        subtitle="Complete overview of all tenants, their spaces, and payment information"
        icon={<People color="primary" />}
        actions={[
          <Button key="export" variant="outlined" startIcon={<Download />} onClick={exportAllTenantsToCSV}>
            Export
          </Button>
        ]}
      />

      {/* Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <People color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" color="primary">
                    {allTenants.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Tenants
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" color="success.main">
                    {allTenants.filter(t => !t.isExpired && !t.isExpiringSoon).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Leases
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Warning color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" color="warning.main">
                    {expiringSoonTenants.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Expiring Soon
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  UGX
                </Typography>
                <Box>
                  <Typography variant="h5" color="success.main">
                    {allTenants.reduce((total, tenant) => total + (tenant.monthlyRent || 0), 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Revenue
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search tenants, properties, or spaces..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          
          <TextField
            size="small"
            select
            label="Property"
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">All Properties</MenuItem>
            {properties.map((property) => (
              <MenuItem key={property.id} value={property.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {property.type === 'building' ? 
                    <Apartment fontSize="small" color="primary" /> : 
                    <Terrain fontSize="small" color="success" />
                  }
                  {property.name}
                </Box>
              </MenuItem>
            ))}
          </TextField>

          <TextField
            size="small"
            select
            label="Lease Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="expiring">Expiring Soon</MenuItem>
            <MenuItem value="expired">Expired</MenuItem>
          </TextField>

          {/* Lease End Date Range */}
          <TextField
            size="small"
            type="date"
            label="Lease End From"
            value={leaseEndFrom}
            onChange={(e) => setLeaseEndFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 170 }}
          />
          <TextField
            size="small"
            type="date"
            label="Lease End To"
            value={leaseEndTo}
            onChange={(e) => setLeaseEndTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 170 }}
          />

          {/* Tabs removed as requested */}
        </Box>
      </Paper>

      {/* Tenants Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.50' }}>
              <TableCell><strong>Tenant</strong></TableCell>
              <TableCell><strong>Contact Information</strong></TableCell>
              <TableCell><strong>Property & Space</strong></TableCell>
              <TableCell><strong>Lease Details</strong></TableCell>
              <TableCell><strong>Monthly Payment</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTenants.map((tenant) => (
              <TableRow 
                key={tenant.id}
                hover
                sx={{ 
                  backgroundColor: tenant.isExpired ? 'error.50' : 
                                  tenant.isExpiringSoon ? 'warning.50' : 'success.50',
                  '&:hover': {
                    backgroundColor: tenant.isExpired ? 'error.100' : 
                                    tenant.isExpiringSoon ? 'warning.100' : 'success.100',
                  }
                }}
              >
                {/* Tenant Information */}
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {tenant.tenantName}
                      </Typography>
                      {tenant.nationalId && (
                        <Typography variant="caption" color="text.secondary">
                          ID: {tenant.nationalId}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>

                {/* Contact Information */}
                <TableCell>
                  <Box>
                    {tenant.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <Phone fontSize="small" color="primary" />
                        <Typography variant="body2">
                          {tenant.phone}
                        </Typography>
                      </Box>
                    )}
                    
                    {tenant.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <Email fontSize="small" color="primary" />
                        <Typography variant="body2">
                          {tenant.email}
                        </Typography>
                      </Box>
                    )}

                    {tenant.emergencyContact && (
                      <Typography variant="caption" color="text.secondary">
                        Emergency: {tenant.emergencyContact}
                      </Typography>
                    )}
                  </Box>
                </TableCell>

                {/* Property & Space */}
                <TableCell>
                  <Box>
                    {/* Property Name */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      {tenant.propertyType === 'building' ? 
                        <Apartment fontSize="small" color="primary" /> : 
                        <Terrain fontSize="small" color="success" />
                      }
                      <Typography variant="body1" fontWeight="bold" color="primary.dark">
                        {tenant.propertyName}
                      </Typography>
                    </Box>
                    
                    {/* Space Name - Prominent */}
                    <Chip 
                      label={tenant.spaceName}
                      color="primary"
                      size="small"
                      sx={{ mb: 1, fontWeight: 600 }}
                    />
                    
                    {/* Floor/Type Info */}
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                      {tenant.propertyType === 'building' ? 
                        `Floor ${tenant.floorNumber} • ${tenant.spaceType}` : 
                        `Land Area • ${tenant.spaceType || 'Squatter'}`
                      }
                      {tenant.size && ` • ${tenant.size}`}
                    </Typography>

                    {/* Location */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOn fontSize="small" sx={{ color: 'success.main', fontSize: 16 }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        {tenant.propertyAddress}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                {/* Lease Details */}
                <TableCell>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <CalendarMonth fontSize="small" color="primary" />
                      <Typography variant="caption" color="text.secondary">
                        Start: {format(new Date(tenant.leaseStart), 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                    
                    {tenant.leaseEnd ? (
                      <>
                        <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
                          End: {format(new Date(tenant.leaseEnd), 'MMM dd, yyyy')}
                        </Typography>
                        
                        <Typography 
                          variant="caption" 
                          color={tenant.isExpired ? 'error.main' : 
                                 tenant.isExpiringSoon ? 'warning.main' : 'text.secondary'}
                        >
                          {tenant.isExpired ? 
                            `Expired ${Math.abs(tenant.daysUntilExpiry)} days ago` :
                            `${tenant.daysUntilExpiry} days remaining`
                          }
                        </Typography>
                      </>
                    ) : (
                      <Chip 
                        label="Ongoing/Indefinite"
                        color="info"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </TableCell>

                {/* Monthly Payment */}
                <TableCell>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="success.main" fontWeight="bold">
                      UGX {tenant.monthlyRent?.toLocaleString() || '0'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      per month
                    </Typography>
                  </Box>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Chip 
                    label={getStatusLabel(tenant)}
                    color={getStatusColor(tenant)}
                    size="small"
                    variant="filled"
                  />
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, flexWrap: 'nowrap', alignItems: 'center' }}>
                    <Tooltip title="Edit Tenant Information">
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        startIcon={<Edit />}
                        onClick={() => openEditDialog(tenant)}
                        sx={{ minWidth: 120 }}
                      >
                        Edit Tenant
                      </Button>
                    </Tooltip>
                    {/* Property and Edit Space buttons removed per request */}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredTenants.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
          <People sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tenants found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {allTenants.length === 0 
              ? "No tenants have been assigned to spaces yet"
              : "Try adjusting your search or filters"
            }
          </Typography>
          {allTenants.length === 0 && (
            <Button
              variant="contained"
              startIcon={<Home />}
              onClick={() => setPropertyDialog(true)}
            >
              Assign Tenants to Spaces
            </Button>
          )}
        </Paper>
      )}

      {/* Property Selector Dialog for Tenant Assignment */}
      <PropertySelectorDialog 
        open={propertyDialog}
        onClose={() => setPropertyDialog(false)}
      />

      {/* Edit Tenant Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Tenant Information</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Tenant Name"
              value={editForm.tenantName}
              onChange={(e) => setEditForm({ ...editForm, tenantName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Phone"
              value={editForm.tenantPhone}
              onChange={(e) => setEditForm({ ...editForm, tenantPhone: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={editForm.tenantEmail}
              onChange={(e) => setEditForm({ ...editForm, tenantEmail: e.target.value })}
              fullWidth
            />
            <TextField
              label="National ID"
              value={editForm.nationalId}
              onChange={(e) => setEditForm({ ...editForm, nationalId: e.target.value })}
              fullWidth
            />
            <TextField
              label="Emergency Contact"
              value={editForm.emergencyContact}
              onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
              fullWidth
            />

            {/* Lease Details */}
            <TextField
              label="Monthly Rent (UGX)"
              type="number"
              value={editForm.monthlyRent}
              onChange={(e) => setEditForm({ ...editForm, monthlyRent: e.target.value })}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Lease Start"
                type="date"
                value={editForm.leaseStart}
                onChange={(e) => setEditForm({ ...editForm, leaseStart: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 220 }}
              />
              <TextField
                label="Lease End"
                type="date"
                value={editForm.leaseEnd}
                onChange={(e) => setEditForm({ ...editForm, leaseEnd: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 220 }}
              />
            </Box>

            {/* Status */}
            <TextField
              select
              label="Status"
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              fullWidth
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>

            {/* Property and Space */}
            <TextField
              select
              label="Property"
              value={selectedPropertyId}
              onChange={(e) => {
                setSelectedPropertyId(e.target.value);
                setSelectedSpaceId('');
              }}
              fullWidth
            >
              {properties.map((property) => (
                <MenuItem key={property.id} value={property.id}>
                  {property.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Space"
              value={selectedSpaceId}
              onChange={(e) => setSelectedSpaceId(e.target.value)}
              fullWidth
              disabled={!selectedPropertyId}
            >
              {(() => {
                const prop = properties.find(p => p.id === selectedPropertyId);
                if (!prop) return null;
                if (prop.type === 'building' && prop.buildingDetails?.floors) {
                  const items = [];
                  prop.buildingDetails.floors.forEach((floor) => {
                    floor.spaces?.forEach((space) => {
                      items.push(
                        <MenuItem key={space.spaceId} value={space.spaceId}>
                          {space.spaceName} {floor.floorName ? `• ${floor.floorName}` : ''}
                        </MenuItem>
                      );
                    });
                  });
                  return items;
                }
                if (prop.type === 'land' && prop.landDetails?.squatters) {
                  return prop.landDetails.squatters.map((sq) => (
                    <MenuItem key={sq.squatterId} value={sq.squatterId}>
                      {sq.assignedArea}
                    </MenuItem>
                  ));
                }
                return null;
              })()}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </ResponsiveContainer>
  );
};

export default TenantsPage;


