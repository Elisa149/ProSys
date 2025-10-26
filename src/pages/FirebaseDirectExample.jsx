import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { propertyService, paymentService, realtimeService } from '../services/firebaseService';

const FirebaseDirectExample = () => {
  const { user, userProfile } = useAuth();
  const [properties, setProperties] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newProperty, setNewProperty] = useState({
    name: '',
    type: 'building',
    location: {
      village: '',
      parish: '',
      subCounty: '',
      county: '',
      district: '',
    },
    establishmentDate: new Date(),
    caretakerName: '',
    caretakerPhone: '',
    ownershipType: 'owned',
  });

  // Load initial data
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to properties changes
    const unsubscribeProperties = realtimeService.subscribeToProperties(
      user.uid,
      (updatedProperties) => {
        setProperties(updatedProperties);
      }
    );

    // Subscribe to payments changes
    const unsubscribePayments = realtimeService.subscribeToPayments(
      user.uid,
      (updatedPayments) => {
        setPayments(updatedPayments);
      }
    );

    return () => {
      unsubscribeProperties();
      unsubscribePayments();
    };
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [propertiesData, paymentsData] = await Promise.all([
        propertyService.getAll(user.uid),
        paymentService.getAll(user.uid),
      ]);
      
      setProperties(propertiesData || []);
      setPayments(paymentsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProperty = async () => {
    if (!newProperty.name || !newProperty.location.village) {
      alert('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      await propertyService.create(newProperty, user.uid);
      setNewProperty({
        name: '',
        type: 'building',
        location: {
          village: '',
          parish: '',
          subCounty: '',
          county: '',
          district: '',
        },
        establishmentDate: new Date(),
        caretakerName: '',
        caretakerPhone: '',
        ownershipType: 'owned',
      });
    } catch (error) {
      console.error('Error creating property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async (propertyId) => {
    const amount = prompt('Enter payment amount:');
    if (!amount || isNaN(amount)) {
      alert('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      await paymentService.create({
        propertyId,
        amount: parseFloat(amount),
        paymentDate: new Date(),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        paymentMethod: 'cash',
        notes: 'Direct payment',
      }, user.uid);
    } catch (error) {
      console.error('Error creating payment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Box p={3}>
        <Alert severity="info">Please sign in to view this page</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Firebase Direct Integration Example
      </Typography>
      
      <Alert severity="success" sx={{ mb: 3 }}>
        This page demonstrates direct Firebase integration without API backend.
        Data updates in real-time using Firestore listeners.
      </Alert>

      <Grid container spacing={3}>
        {/* Create Property Form */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Create New Property
              </Typography>
              
              <TextField
                fullWidth
                label="Property Name"
                value={newProperty.name}
                onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                margin="normal"
              />
              
              <TextField
                fullWidth
                label="Village"
                value={newProperty.location.village}
                onChange={(e) => setNewProperty({
                  ...newProperty,
                  location: { ...newProperty.location, village: e.target.value }
                })}
                margin="normal"
              />
              
              <TextField
                fullWidth
                label="Caretaker Name"
                value={newProperty.caretakerName}
                onChange={(e) => setNewProperty({ ...newProperty, caretakerName: e.target.value })}
                margin="normal"
              />
              
              <TextField
                fullWidth
                label="Caretaker Phone"
                value={newProperty.caretakerPhone}
                onChange={(e) => setNewProperty({ ...newProperty, caretakerPhone: e.target.value })}
                margin="normal"
              />
              
              <Button
                variant="contained"
                onClick={handleCreateProperty}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={20} /> : 'Create Property'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Properties List */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Properties ({properties.length})
              </Typography>
              
              {loading ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress />
                </Box>
              ) : (
                <List>
                  {properties.map((property) => (
                    <React.Fragment key={property.id}>
                      <ListItem>
                        <ListItemText
                          primary={property.name}
                          secondary={`${property.location.village}, ${property.location.district}`}
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleCreatePayment(property.id)}
                        >
                          Add Payment
                        </Button>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                  
                  {properties.length === 0 && (
                    <ListItem>
                      <ListItemText primary="No properties found. Create your first property!" />
                    </ListItem>
                  )}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Payments List */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Payments ({payments.length})
              </Typography>
              
              {loading ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress />
                </Box>
              ) : (
                <List>
                  {payments.slice(0, 10).map((payment) => (
                    <React.Fragment key={payment.id}>
                      <ListItem>
                        <ListItemText
                          primary={`$${payment.amount} - ${payment.month}/${payment.year}`}
                          secondary={`Property: ${payment.propertyId} - ${payment.paymentDate?.toLocaleDateString()}`}
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                  
                  {payments.length === 0 && (
                    <ListItem>
                      <ListItemText primary="No payments found. Add payments to your properties!" />
                    </ListItem>
                  )}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FirebaseDirectExample;
