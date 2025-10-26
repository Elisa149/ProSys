import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Toolbar,
  Chip,
  Collapse,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard,
  Home,
  Receipt,
  Payment,
  AccountCircle,
  TrendingUp,
  People,
  Assessment,
  AdminPanelSettings,
  SupervisorAccount,
  ManageAccounts,
  Analytics,
  Visibility,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const getAllNavigationItems = (userRole, hasPermission, hasAnyPermission, hasRole, isAdmin, userPermissions) => {
  const items = [];

  // ===============================================
  // SHARED PAGES - All authenticated users
  // ===============================================
  
  // Dashboard - everyone can see
  items.push({
    text: 'Dashboard',
    icon: <Dashboard />,
    path: '/app/dashboard',
    show: true,
    section: 'main',
  });

  // Profile - everyone can access their own profile (handled in secondary section)
  
  // ===============================================
  // SUPER ADMIN PAGES
  // ===============================================
  
  if (hasRole('super_admin')) {
    // All Users Management
    items.push({
      text: 'All Users',
      icon: <People />,
      path: '/app/admin/users',
      subtitle: 'System-wide user management',
      show: true,
      section: 'admin',
    });

    // System Settings
    items.push({
      text: 'System Settings',
      icon: <AdminPanelSettings />,
      path: '/app/admin/system-settings',
      subtitle: 'System configuration',
      show: true,
      section: 'admin',
    });

    // System Reports
    items.push({
      text: 'System Reports',
      icon: <Assessment />,
      path: '/app/admin/reports',
      subtitle: 'Cross-organization reports',
      show: true,
      section: 'admin',
    });
  }

  // ===============================================
  // ORGANIZATION ADMIN PAGES
  // ===============================================
  
  if (hasRole('org_admin') || hasRole('super_admin')) {
    // User Role Assignment
    items.push({
      text: 'Role Assignment',
      icon: <ManageAccounts />,
      path: '/app/users/roles',
      subtitle: 'Assign and manage user roles',
      show: true,
      section: 'admin',
    });
  }

  // ===============================================
  // PROPERTY MANAGER PAGES
  // ===============================================
  
  if (hasRole('super_admin') || hasAnyPermission(['properties:read:organization', 'properties:read:assigned'])) {
    // Properties List
    items.push({
      text: 'Properties',
      icon: <Home />,
      path: '/app/properties',
      subtitle: hasPermission('properties:read:organization') ? 'All properties' : 'Assigned properties',
      show: true,
      section: 'main',
    });

    // Properties Overview
    items.push({
      text: 'Properties Overview',
      icon: <Assessment />,
      path: '/app/properties-overview',
      subtitle: 'Analytics & insights',
      show: true,
      section: 'main',
    });

    // All Spaces
    items.push({
      text: 'All Spaces',
      icon: <Dashboard />,
      path: '/app/spaces',
      subtitle: 'Rentable units',
      show: true,
      section: 'main',
    });
  }

  // Tenants Management
  if (hasRole('super_admin') || hasAnyPermission(['tenants:read:organization', 'tenants:read:assigned'])) {
    items.push({
      text: 'Tenants',
      icon: <People />,
      path: '/app/tenants',
      subtitle: 'Tenant management',
      show: true,
      section: 'main',
    });
  }

  // Rent Management
  if (hasRole('super_admin') || hasAnyPermission(['payments:create:organization', 'payments:create:assigned', 'properties:read:assigned'])) {
    items.push({
      text: 'Rent Management',
      icon: <Receipt />,
      path: '/app/rent',
      subtitle: 'Create & track rent',
      show: true,
      section: 'main',
    });
  }

  // Payments
  if (hasRole('super_admin') || hasAnyPermission(['payments:read:organization', 'payments:read:assigned'])) {
    items.push({
      text: 'Payments',
      icon: <Payment />,
      path: '/app/payments',
      subtitle: hasPermission('payments:read:organization') ? 'All payments' : 'Assigned properties',
      show: true,
      section: 'main',
    });
  }

  // ===============================================
  // FINANCIAL VIEWER PAGES
  // ===============================================
  
  if (hasRole('super_admin') || hasAnyPermission(['reports:read:organization'])) {
    // Financial Analytics
    items.push({
      text: 'Financial Analytics',
      icon: <Analytics />,
      path: '/app/analytics',
      subtitle: 'Reports & insights',
      show: true,
      section: 'reports',
    });

    // Properties (Read-only for financial viewers)
    if (!hasAnyPermission(['properties:read:organization', 'properties:read:assigned'])) {
      items.push({
        text: 'Properties',
        icon: <Home />,
        path: '/app/properties',
        subtitle: 'View only',
        show: true,
        section: 'reports',
      });
    }

    // Payments (Read-only for financial viewers)
    if (!hasAnyPermission(['payments:read:organization', 'payments:read:assigned'])) {
      items.push({
        text: 'Payments',
        icon: <Payment />,
        path: '/app/payments',
        subtitle: 'View only',
        show: true,
        section: 'reports',
      });
    }
  }

  return items.filter(item => item.show);
};

const secondaryItems = [
  {
    text: 'Profile',
    icon: <AccountCircle />,
    path: '/app/profile',
  },
];

const Sidebar = ({ onItemClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { userRole, userPermissions, hasPermission, hasAnyPermission, hasRole, isAdmin } = useAuth();
  const [expandedSections, setExpandedSections] = React.useState({
    main: true,
    admin: !isMobile, // Collapse admin section on mobile by default
    reports: !isMobile,
  });
  
  // Debug logging
  console.log('🧪 Sidebar Debug Info:', {
    userRole,
    userPermissions,
    permissionsCount: userPermissions?.length || 0,
    hasAnyPermissionFunction: typeof hasAnyPermission,
    samplePermissionCheck: userRole && userPermissions ? hasAnyPermission(['payments:read:organization']) : 'no role/permissions',
    isAdminResult: userRole && userPermissions ? isAdmin() : 'no role/permissions'
  });
  
  // Get role-based navigation items
  const navigationItems = useMemo(() => {
    console.log('🔄 Generating navigation items...');
    console.log('📊 Role/Permission State:', {
      hasUserRole: !!userRole,
      hasPermissions: !!userPermissions,
      permissionsLength: userPermissions?.length || 0,
      roleName: userRole?.name
    });
    
    // Safety check: if role data isn't loaded yet, show at least dashboard
    if (!userRole || !userPermissions) {
      console.log('⚠️ Missing role or permissions, showing dashboard only');
      return [{
        text: 'Dashboard',
        icon: <Dashboard />,
        path: '/app/dashboard',
        show: true,
      }];
    }
    
    const items = getAllNavigationItems(userRole, hasPermission, hasAnyPermission, hasRole, isAdmin, userPermissions);
    console.log('📋 Generated navigation items:', items.map(item => ({ text: item.text, show: item.show })));
    return items;
  }, [userRole, userPermissions, hasPermission, hasAnyPermission, hasRole, isAdmin]);

  const handleItemClick = (path) => {
    navigate(path);
    if (onItemClick) {
      onItemClick();
    }
  };

  const handleSectionToggle = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Title */}
      <Toolbar sx={{ flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp color="primary" />
          <Typography variant="h6" component="div" color="primary" fontWeight="bold">
            PropertyPro
          </Typography>
        </Box>
        {userRole && (
          <Chip 
            label={userRole.displayName} 
            color="primary" 
            variant="outlined"
            size="small"
            sx={{ fontSize: '0.7rem' }}
          />
        )}
      </Toolbar>

      <Divider />

      {/* Main Navigation */}
      <List sx={{ flexGrow: 1, pt: 1, overflowY: 'auto' }}>
        {(() => {
          // Group items by section
          const sections = {
            main: [],
            admin: [],
            reports: [],
          };

          navigationItems.forEach(item => {
            const section = item.section || 'main';
            if (sections[section]) {
              sections[section].push(item);
            }
          });

          const sectionTitles = {
            main: 'Main',
            admin: 'Administration',
            reports: 'Reports',
          };

          return Object.entries(sections).map(([sectionKey, items]) => {
            if (items.length === 0) return null;

            return (
              <Box key={sectionKey}>
                {/* Section Header */}
                {sectionKey !== 'main' && (
                  <Typography
                    variant="caption"
                    sx={{
                      px: 2,
                      pt: 2,
                      pb: 1,
                      display: 'block',
                      color: 'text.secondary',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                      letterSpacing: 1,
                    }}
                  >
                    {sectionTitles[sectionKey]}
                  </Typography>
                )}

                {/* Section Items */}
                {items.map((item) => (
                  <ListItem key={item.text} disablePadding>
                    <ListItemButton
                      selected={isActive(item.path)}
                      onClick={() => handleItemClick(item.path)}
                      sx={{
                        mx: 1,
                        borderRadius: 1,
                        '&.Mui-selected': {
                          backgroundColor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          },
                          '& .MuiListItemIcon-root': {
                            color: 'white',
                          },
                        },
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          color: 'white',
                          '& .MuiListItemIcon-root': {
                            color: 'white',
                          },
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: isActive(item.path) ? 'white' : 'inherit',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text}
                        secondary={item.subtitle}
                        secondaryTypographyProps={{
                          sx: {
                            fontSize: '0.7rem',
                            color: isActive(item.path) ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                          }
                        }}
                        sx={{
                          '& .MuiListItemText-primary': {
                            fontWeight: isActive(item.path) ? 600 : 400,
                            fontSize: '0.9rem',
                          },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}

                {/* Divider between sections */}
                {sectionKey !== 'reports' && items.length > 0 && (
                  <Box sx={{ py: 1 }}>
                    <Divider sx={{ mx: 2 }} />
                  </Box>
                )}
              </Box>
            );
          });
        })()}
      </List>

      <Divider />

      {/* Secondary Navigation */}
      <List sx={{ pb: 2 }}>
        {secondaryItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={isActive(item.path)}
              onClick={() => handleItemClick(item.path)}
              sx={{
                mx: 1,
                borderRadius: 1,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive(item.path) ? 'white' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontWeight: isActive(item.path) ? 600 : 400,
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
