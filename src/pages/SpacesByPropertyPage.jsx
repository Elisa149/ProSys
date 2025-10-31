import React, { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Box, Paper, Typography, Grid, Card, CardContent, Chip, Accordion, AccordionSummary, AccordionDetails, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, MenuItem } from '@mui/material';
import { ExpandMore, Apartment, Terrain, SquareFoot, CalendarMonth, CheckCircle, RadioButtonUnchecked, LocationOn, Download, PictureAsPdf, Edit, Visibility } from '@mui/icons-material';
import { format } from 'date-fns';

import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { propertyService, rentService } from '../services/firebaseService';

const SpacesByPropertyPage = () => {
  const { userId, userRole, organizationId } = useAuth();

  const { data: properties = [], isLoading: propertiesLoading, error: propertiesError } = useQuery(
    'properties',
    () => propertyService.getAll(userId, userRole, organizationId),
    { enabled: !!userId }
  );

  const { data: rentRecords = [], isLoading: rentLoading } = useQuery(
    'rent',
    () => rentService.getAll(userId, userRole, organizationId),
    { enabled: !!userId }
  );

  const [statusFilter, setStatusFilter] = useState('all');

  const spaceIdToRent = useMemo(() => {
    const map = {};
    rentRecords.forEach(r => {
      if (r.spaceId) map[r.spaceId] = r;
    });
    return map;
  }, [rentRecords]);

  if (propertiesLoading || rentLoading) {
    return <LoadingSpinner message="Loading spaces by property..." />;
  }

  if (propertiesError) {
    return (
      <Paper sx={{ p: 2, m: 2 }}>
        <Typography color="error">Failed to load properties.</Typography>
      </Paper>
    );
  }

  const totalSpaces = properties.reduce((sum, p) => {
    if (p.type === 'building' && p.buildingDetails?.floors) {
      return sum + p.buildingDetails.floors.reduce((acc, f) => acc + (f.spaces?.length || 0), 0);
    }
    if (p.type === 'land' && p.landDetails?.squatters) {
      return sum + p.landDetails.squatters.length;
    }
    return sum;
  }, 0);

  const exportSpacesToCSV = () => {
    const rows = [];
    properties.forEach((property) => {
      const isBuilding = property.type === 'building';
      if (isBuilding && property.buildingDetails?.floors) {
        property.buildingDetails.floors.forEach((floor) => {
          floor.spaces?.forEach((space) => {
            const rent = spaceIdToRent[space.spaceId];
            rows.push({
              PropertyName: property.name || '',
              PropertyType: 'building',
              SpaceId: space.spaceId || '',
              SpaceName: space.spaceName || '',
              FloorNumber: floor.floorNumber ?? '',
              SpaceType: space.spaceType || '',
              Size: space.size || '',
              MonthlyRent: space.monthlyRent ?? '',
              Status: rent ? 'Occupied' : 'Available',
              TenantName: rent?.tenantName || '',
              LeaseStart: rent?.leaseStart ? new Date(rent.leaseStart).toISOString() : '',
              LeaseEnd: rent?.leaseEnd ? new Date(rent.leaseEnd).toISOString() : '',
            });
          });
        });
      } else if (property.type === 'land' && property.landDetails?.squatters) {
        property.landDetails.squatters.forEach((sq) => {
          const rent = spaceIdToRent[sq.squatterId];
          rows.push({
            PropertyName: property.name || '',
            PropertyType: 'land',
            SpaceId: sq.squatterId || '',
            SpaceName: sq.assignedArea || '',
            FloorNumber: '',
            SpaceType: 'land_area',
            Size: '',
            MonthlyRent: sq.monthlyPayment ?? '',
            Status: rent ? 'Occupied' : 'Available',
            TenantName: rent?.tenantName || '',
            LeaseStart: rent?.leaseStart ? new Date(rent.leaseStart).toISOString() : '',
            LeaseEnd: rent?.leaseEnd ? new Date(rent.leaseEnd).toISOString() : '',
          });
        });
      }
    });

    const headers = Object.keys(rows[0] || {
      PropertyName: '', PropertyType: '', SpaceId: '', SpaceName: '', FloorNumber: '', SpaceType: '', Size: '', MonthlyRent: '', Status: '', TenantName: '', LeaseStart: '', LeaseEnd: ''
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
    link.download = 'prosys spaces by property.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportSpacesToPDF = () => {
    const styles = `
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
        h1 { font-size: 20px; margin: 0 0 16px 0; }
        h2 { font-size: 16px; margin: 24px 0 8px 0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; font-size: 12px; }
        th { background: #f5f5f5; text-align: left; }
        .meta { margin-bottom: 16px; font-size: 12px; color: #666; }
        .page-break { page-break-after: always; }
      </style>
    `;
    const now = new Date();
    let html = `<h1>Spaces by Property</h1><div class="meta">Generated ${now.toLocaleString()}</div>`;
    properties.forEach((property, idx) => {
      const isBuilding = property.type === 'building';
      const rows = [];
      if (isBuilding && property.buildingDetails?.floors) {
        property.buildingDetails.floors.forEach((floor) => {
          floor.spaces?.forEach((space) => {
            const rent = spaceIdToRent[space.spaceId];
            rows.push({
              SpaceName: space.spaceName || '',
              TypeFloor: isBuilding ? `Floor ${floor.floorNumber}` : 'Land Area',
              Size: space.size || '',
              Status: rent ? 'Occupied' : 'Available',
              Tenant: rent?.tenantName || '',
              Lease: rent?.leaseStart && rent?.leaseEnd
                ? `${new Date(rent.leaseStart).toLocaleDateString()} - ${new Date(rent.leaseEnd).toLocaleDateString()}`
                : ''
            });
          });
        });
      } else if (property.type === 'land' && property.landDetails?.squatters) {
        property.landDetails.squatters.forEach((sq) => {
          const rent = spaceIdToRent[sq.squatterId];
          rows.push({
            SpaceName: sq.assignedArea || '',
            TypeFloor: 'Land Area',
            Size: '',
            Status: rent ? 'Occupied' : 'Available',
            Tenant: rent?.tenantName || '',
            Lease: rent?.leaseStart && rent?.leaseEnd
              ? `${new Date(rent.leaseStart).toLocaleDateString()} - ${new Date(rent.leaseEnd).toLocaleDateString()}`
              : ''
          });
        });
      }
      html += `<h2>${property.name || 'Property'}</h2>`;
      html += `<table><thead><tr>
        <th>Space</th><th>Type / Floor</th><th>Size</th><th>Status</th><th>Tenant</th><th>Lease Period</th>
      </tr></thead><tbody>`;
      rows.forEach(r => {
        html += `<tr>
          <td>${r.SpaceName}</td>
          <td>${r.TypeFloor}</td>
          <td>${r.Size}</td>
          <td>${r.Status}</td>
          <td>${r.Tenant}</td>
          <td>${r.Lease}</td>
        </tr>`;
      });
      html += `</tbody></table>`;
      if (idx < properties.length - 1) {
        html += '<div class="page-break"></div>';
      }
    });

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8" />${styles}</head><body>${html}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Spaces by Property
          </Typography>
          <Typography variant="body1" color="text.secondary">
            All spaces grouped under their respective properties
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="available">Available</MenuItem>
            <MenuItem value="occupied">Occupied</MenuItem>
          </TextField>
          <Button variant="outlined" startIcon={<Download />} onClick={exportSpacesToCSV}>
            Export CSV
          </Button>
          <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={exportSpacesToPDF}>
            Export PDF
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary">{properties.length}</Typography>
              <Typography variant="body2" color="text.secondary">Properties</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success.main">{totalSpaces}</Typography>
              <Typography variant="body2" color="text.secondary">Total Spaces</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success.main">{
                properties.reduce((count, p) => {
                  if (p.type === 'building' && p.buildingDetails?.floors) {
                    p.buildingDetails.floors.forEach(f => {
                      f.spaces?.forEach(s => { if (spaceIdToRent[s.spaceId]) count += 1; });
                    });
                  } else if (p.type === 'land' && p.landDetails?.squatters) {
                    p.landDetails.squatters.forEach(sq => { if (spaceIdToRent[sq.squatterId]) count += 1; });
                  }
                  return count;
                }, 0)
              }</Typography>
              <Typography variant="body2" color="text.secondary">Occupied</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="warning.main">{
                properties.reduce((count, p) => {
                  if (p.type === 'building' && p.buildingDetails?.floors) {
                    p.buildingDetails.floors.forEach(f => {
                      f.spaces?.forEach(s => { if (!spaceIdToRent[s.spaceId]) count += 1; });
                    });
                  } else if (p.type === 'land' && p.landDetails?.squatters) {
                    p.landDetails.squatters.forEach(sq => { if (!spaceIdToRent[sq.squatterId]) count += 1; });
                  }
                  return count;
                }, 0)
              }</Typography>
              <Typography variant="body2" color="text.secondary">Available</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box>
        {properties.map((property) => {
          const isBuilding = property.type === 'building';
          const isLand = property.type === 'land';

          const spaces = [];
          if (isBuilding && property.buildingDetails?.floors) {
            property.buildingDetails.floors.forEach(floor => {
              floor.spaces?.forEach(space => spaces.push({ ...space, floorNumber: floor.floorNumber }));
            });
          } else if (isLand && property.landDetails?.squatters) {
            property.landDetails.squatters.forEach(sq => spaces.push({
              spaceId: sq.squatterId,
              spaceName: sq.assignedArea,
              spaceType: 'land_area',
              monthlyRent: sq.monthlyPayment,
            }));
          }

          const filteredSpaces = spaces.filter(space => {
            const isAssigned = !!spaceIdToRent[space.spaceId];
            if (statusFilter === 'available') return !isAssigned;
            if (statusFilter === 'occupied') return isAssigned;
            return true;
          });

          if (filteredSpaces.length === 0) {
            return null;
          }

          return (
            <Accordion key={property.id} defaultExpanded sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {isBuilding ? <Apartment color="primary" /> : <Terrain color="success" />}
                  <Typography variant="h6" fontWeight="bold">{property.name}</Typography>
                  <Chip label={`${filteredSpaces.length} spaces`} size="small" color="primary" variant="outlined" />
                  <Box sx={{ flexGrow: 1 }} />
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Edit />}
                    component={RouterLink}
                    to={`/app/properties/${property.id}/spaces`}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Visibility />}
                    component={RouterLink}
                    to={`/app/properties/${property.id}`}
                    aria-label="Property"
                  >
                    Property
                  </Button>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'grey.50' }}>
                        <TableCell><strong>Space</strong></TableCell>
                        <TableCell><strong>Type / Floor</strong></TableCell>
                        <TableCell><strong>Size</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Tenant</strong></TableCell>
                        <TableCell><strong>Lease Period</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredSpaces.map((space) => {
                        const rent = spaceIdToRent[space.spaceId];
                        const isAssigned = !!rent;
                        return (
                          <TableRow key={space.spaceId} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {isBuilding ? <Apartment fontSize="small" color="primary" /> : <Terrain fontSize="small" color="success" />}
                                <Typography variant="body2" fontWeight="bold" color="primary.main">{space.spaceName}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {isBuilding ? `Floor ${space.floorNumber}` : 'Land Area'}
                              </Typography>
                              {space.spaceType && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {String(space.spaceType).replace('_',' ').toUpperCase()}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              {space.size && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <SquareFoot fontSize="small" sx={{ color: 'text.secondary' }} />
                                  <Typography variant="body2">{space.size}</Typography>
                                </Box>
                              )}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {isAssigned ? <CheckCircle fontSize="small" color="success" /> : <RadioButtonUnchecked fontSize="small" color="warning" />}
                                <Chip label={isAssigned ? 'Occupied' : 'Available'} size="small" color={isAssigned ? 'success' : 'warning'} variant="outlined" />
                              </Box>
                            </TableCell>
                            <TableCell>
                              {isAssigned ? (
                                <Typography variant="body2" fontWeight="bold">{rent.tenantName}</Typography>
                              ) : (
                                <Typography variant="caption" color="text.secondary">No tenant</Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              {isAssigned && rent.leaseStart && rent.leaseEnd ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CalendarMonth fontSize="small" color="primary" />
                                  <Typography variant="caption">
                                    {format(new Date(rent.leaseStart), 'MMM dd, yyyy')} - {format(new Date(rent.leaseEnd), 'MMM dd, yyyy')}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography variant="caption" color="text.secondary">—</Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </Box>
  );
};

export default SpacesByPropertyPage;


