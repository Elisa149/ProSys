import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  IconButton,
  Divider,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  Person,
  Phone,
  Save,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';

import { propertyService } from '../services/firebaseService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SpaceManagement from '../components/SpaceManagement';
import SquatterManagement from '../components/SquatterManagement';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../config/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import confirmAction from '../utils/confirmAction';

const propertyTypes = [
  { value: 'land', label: 'Land' },
  { value: 'building', label: 'Building' },
];

const buildingTypes = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'other', label: 'Other' },
];

const ownershipTypes = [
  { value: 'owned', label: 'Owned' },
  { value: 'leasing', label: 'Leasing' },
];

const EditPropertyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userProfile, organizationId, userId, userRole } = useAuth();
  
  // State for building floors and spaces
  const [floors, setFloors] = useState([{
    floorNumber: 0,
    floorName: 'Ground Floor',
    spaces: [],
    description: ''
  }]);

  // State for land details and squatters
  const [landDetails, setLandDetails] = useState({
    totalArea: '',
    landUse: '',
    squatters: [],
    totalSquatters: 0,
  });

  const [imageFile, setImageFile] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [existingImagePath, setExistingImagePath] = useState(null);

  // Fetch existing property data
  const {
    data: property,
    isLoading: propertyLoading,
    error: propertyError,
  } = useQuery(['property', id], () => propertyService.getById(id), {
    enabled: !!id,
    onSuccess: (data) => {
      console.log('Property loaded for editing:', data);
      // Populate form with existing data
      reset({
        name: data.name || '',
        type: data.type || '',
        village: data.location?.village || '',
        parish: data.location?.parish || '',
        subCounty: data.location?.subCounty || '',
        county: data.location?.county || '',
        district: data.location?.district || '',
        landmarks: data.location?.landmarks || '',
        establishmentDate: data.establishmentDate || '',
        caretakerName: data.caretakerName || '',
        caretakerPhone: data.caretakerPhone || '',
        plotNumber: data.plotNumber || '',
        ownershipType: data.ownershipType || '',
        buildingType: data.buildingDetails?.buildingType || '',
        description: data.description || '',
      });

      // Populate building floors if building type
      if (data.type === 'building' && data.buildingDetails?.floors) {
        setFloors(data.buildingDetails.floors);
      }

      // Populate land details if land type
      if (data.type === 'land' && data.landDetails) {
        setLandDetails({
          totalArea: data.landDetails.totalArea || '',
          landUse: data.landDetails.landUse || '',
          squatters: data.landDetails.squatters || [],
          totalSquatters: data.landDetails.squatters?.length || 0,
        });
      }

      // Store existing image
      if (data.imageUrl) {
        setExistingImageUrl(data.imageUrl);
        setExistingImagePath(data.imagePath);
      }
    },
    onError: (err) => {
      console.error('Error fetching property:', err);
      toast.error('Failed to load property details');
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    defaultValues: {
      name: '',
      type: '',
      village: '',
      parish: '',
      subCounty: '',
      county: '',
      district: '',
      landmarks: '',
      establishmentDate: '',
      caretakerName: '',
      caretakerPhone: '',
      plotNumber: '',
      ownershipType: '',
      buildingType: '',
      description: '',
    },
  });

  const watchedType = watch('type');

  const updatePropertyMutation = useMutation(
    (propertyData) => propertyService.update(id, propertyData),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('properties');
        queryClient.invalidateQueries(['property', id]);
        toast.success('Property updated successfully!');
        navigate(`/app/properties/${id}`);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update property');
      },
    }
  );

  const onSubmit = async (data) => {
    // Restructure data to match backend schema
    const propertyData = {
      name: data.name,
      type: data.type,
      organizationId: property.organizationId, // Keep existing organizationId
      assignedManagers: property.assignedManagers || [], // Keep existing managers
      caretakerId: property.caretakerId || '',
      location: {
        village: data.village,
        parish: data.parish,
        subCounty: data.subCounty,
        county: data.county,
        district: data.district,
        landmarks: data.landmarks,
      },
      establishmentDate: data.establishmentDate,
      caretakerName: data.caretakerName,
      caretakerPhone: data.caretakerPhone,
      plotNumber: data.plotNumber,
      ownershipType: data.ownershipType,
      description: data.description,
      amenities: property.amenities || [],
      status: property.status || 'vacant',
    };

    // Handle image upload if new image selected
    if (imageFile) {
      try {
        // Delete old image if exists
        if (existingImagePath) {
          try {
            const oldRef = storageRef(storage, existingImagePath);
            await deleteObject(oldRef);
          } catch (err) {
            console.warn('Could not delete old image:', err);
          }
        }

        // Upload new image
        const orgIdForPath = property.organizationId || 'no-org';
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const path = `properties/${orgIdForPath}/${fileName}`;
        const ref = storageRef(storage, path);
        const uploaded = await uploadBytes(ref, imageFile);
        const url = await getDownloadURL(uploaded.ref);
        propertyData.imageUrl = url;
        propertyData.imagePath = path;
      } catch (err) {
        console.error('Failed to upload property image:', err);
        toast.error('Failed to upload image. Continuing without image update.');
      }
    } else if (existingImageUrl) {
      // Keep existing image if no new image selected
      propertyData.imageUrl = existingImageUrl;
      propertyData.imagePath = existingImagePath;
    }

    // Add building details if building type
    if (data.type === 'building') {
      // Calculate totals from floors
      const totalSpaces = floors.reduce((total, floor) => total + (floor.spaces?.length || 0), 0);
      
      propertyData.buildingDetails = {
        buildingType: data.buildingType,
        numberOfFloors: floors.length,
        floors: floors,
        totalRentableSpaces: totalSpaces,
      };
    }

    // Add land details if land type
    if (data.type === 'land') {
      propertyData.landDetails = {
        ...landDetails,
        totalSquatters: landDetails.squatters?.length || 0,
      };
    }

    const propertyLabel = data.name ? `"${data.name}"` : 'this property';
    if (!confirmAction(`Update property ${propertyLabel}?`)) {
      return;
    }

    updatePropertyMutation.mutate(propertyData);
  };

  if (propertyLoading) {
    return <LoadingSpinner message="Loading property details..." />;
  }

  if (propertyError) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load property: {propertyError.message}
        </Alert>
        <Button onClick={() => navigate('/app/properties')}>
          Back to Properties
        </Button>
      </Box>
    );
  }

  if (!property) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Property not found
        </Alert>
        <Button onClick={() => navigate('/app/properties')}>
          Back to Properties
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate(`/app/properties/${id}`)}>
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Edit Property
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Update property information and manage floors/spaces
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                📋 Basic Property Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Property name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Property Name"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    placeholder="e.g., Sunrise Apartments"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="type"
                control={control}
                rules={{ required: 'Property type is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.type}>
                    <InputLabel>Property Type</InputLabel>
                    <Select {...field} label="Property Type">
                      {propertyTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.type && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                        {errors.type.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="establishmentDate"
                control={control}
                rules={{ required: 'Establishment date is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Establishment Date"
                    error={!!errors.establishmentDate}
                    helperText={errors.establishmentDate?.message}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="ownershipType"
                control={control}
                rules={{ required: 'Ownership type is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.ownershipType}>
                    <InputLabel>Ownership Type</InputLabel>
                    <Select {...field} label="Ownership Type">
                      {ownershipTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="plotNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Plot Number (Optional)"
                    placeholder="e.g., Plot 123"
                  />
                )}
              />
            </Grid>

            {/* Location Information */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom color="primary">
                📍 Location Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="village"
                control={control}
                rules={{ required: 'Village is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Village"
                    error={!!errors.village}
                    helperText={errors.village?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="parish"
                control={control}
                rules={{ required: 'Parish is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Parish"
                    error={!!errors.parish}
                    helperText={errors.parish?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="subCounty"
                control={control}
                rules={{ required: 'Sub County is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Sub County"
                    error={!!errors.subCounty}
                    helperText={errors.subCounty?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="county"
                control={control}
                rules={{ required: 'County is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="County"
                    error={!!errors.county}
                    helperText={errors.county?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="district"
                control={control}
                rules={{ required: 'District is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="District"
                    error={!!errors.district}
                    helperText={errors.district?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="landmarks"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Landmarks (Optional)"
                    placeholder="Near market, next to school"
                  />
                )}
              />
            </Grid>

            {/* Caretaker Information */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom color="primary">
                👤 Caretaker Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="caretakerName"
                control={control}
                rules={{ required: 'Caretaker name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Caretaker Name"
                    error={!!errors.caretakerName}
                    helperText={errors.caretakerName?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="caretakerPhone"
                control={control}
                rules={{ required: 'Caretaker phone is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Caretaker Phone"
                    error={!!errors.caretakerPhone}
                    helperText={errors.caretakerPhone?.message}
                    placeholder="+256 700 123 456"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            {/* Building Details - Only for buildings */}
            {watchedType === 'building' && (
              <>
                <Grid item xs={12} sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    🏢 Building Details
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="buildingType"
                    control={control}
                    rules={{ 
                      required: watchedType === 'building' ? 'Building type is required' : false 
                    }}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.buildingType}>
                        <InputLabel>Building Type</InputLabel>
                        <Select {...field} label="Building Type">
                          {buildingTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              {type.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.buildingType && (
                          <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                            {errors.buildingType.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                {/* Space Management Component */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <SpaceManagement 
                    floors={floors}
                    onFloorsChange={setFloors}
                    errors={errors}
                  />
                </Grid>
              </>
            )}

            {/* Land Details - Only for land */}
            {watchedType === 'land' && (
              <Grid item xs={12} sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  🌱 Land Details & Squatters
                </Typography>
                <SquatterManagement 
                  landDetails={landDetails}
                  onLandDetailsChange={setLandDetails}
                  errors={errors}
                />
              </Grid>
            )}

            {/* Property Picture (Optional) */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom color="primary">
                🖼️ Property Picture
              </Typography>
              {existingImageUrl && !imageFile && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Current Image:
                  </Typography>
                  <img 
                    src={existingImageUrl} 
                    alt="Property" 
                    style={{ 
                      maxWidth: '200px', 
                      maxHeight: '200px', 
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }} 
                  />
                </Box>
              )}
              <Button
                variant="outlined"
                component="label"
                sx={{ mr: 2 }}
              >
                {existingImageUrl ? 'Change Image' : 'Choose Image'}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    if (file) setImageFile(file);
                  }}
                />
              </Button>
              {imageFile && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  New image selected: {imageFile.name}
                </Typography>
              )}
            </Grid>

            {/* Description */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom color="primary">
                📝 Additional Information
              </Typography>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    label="Property Description (Optional)"
                    placeholder="Describe the property, its condition, special features..."
                  />
                )}
              />
            </Grid>

            {/* Form Actions */}
            <Grid item xs={12} sx={{ mt: 4 }}>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate(`/app/properties/${id}`)}
                  disabled={updatePropertyMutation.isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<Save />}
                  disabled={updatePropertyMutation.isLoading}
                  sx={{ minWidth: 150 }}
                >
                  {updatePropertyMutation.isLoading ? (
                    <LoadingSpinner size={20} />
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default EditPropertyPage;

