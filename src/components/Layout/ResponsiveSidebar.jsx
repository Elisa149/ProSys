import React, { useMemo, useState } from 'react';
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

// Navigation items function (copied from original Sidebar)
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
      subtitle: 'Manage properties',
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
      subtitle: 'Manage tenants',
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
      subtitle: 'Manage rent',
      show: true,
      section: 'main',
    });
  }

  // Invoices
  if (hasRole('super_admin') || hasAnyPermission(['payments:create:organization', 'payments:create:assigned', 'properties:read:assigned'])) {
    items.push({
      text: 'Invoices',
      icon: <Receipt />,
      path: '/app/invoices',
      subtitle: 'Generate & manage invoices',
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
      subtitle: 'Payment management',
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
      subtitle: 'Financial insights',
      show: true,
      section: 'reports',
    });
    // Properties (Read-only for financial viewers)
    if (!hasAnyPermission(['properties:read:organization', 'properties:read:assigned'])) {
      items.push({
        text: 'Properties',
        icon: <Home />,
        path: '/app/properties',
        subtitle: 'View properties',
        show: true,
        section: 'main',
      });
    }
  }

  return items;
};

const ResponsiveSidebar = ({ onItemClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { userRole, userPermissions, hasPermission, hasAnyPermission, hasRole, isAdmin } = useAuth();
  
  const [expandedSections, setExpandedSections] = useState({
    main: true,
    admin: !isMobile, // Collapse admin section on mobile by default
    reports: !isMobile,
  });

  // Get role-based navigation items
  const navigationItems = useMemo(() => {
    if (!userRole || !userPermissions) {
      return [{
        text: 'Dashboard',
        icon: <Dashboard />,
        path: '/app/dashboard',
        show: true,
        section: 'main',
      }];
    }
    
    return getAllNavigationItems(userRole, hasPermission, hasAnyPermission, hasRole, isAdmin, userPermissions);
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

  // Group items by section
  const groupedItems = useMemo(() => {
    const groups = {
      main: [],
      admin: [],
      reports: [],
    };

    navigationItems.forEach(item => {
      const section = item.section || 'main';
      if (groups[section]) {
        groups[section].push(item);
      }
    });

    return groups;
  }, [navigationItems]);

  const sectionConfig = {
    main: { title: 'Main', icon: <Dashboard /> },
    admin: { title: 'Administration', icon: <AdminPanelSettings /> },
    reports: { title: 'Reports', icon: <Assessment /> },
  };

  // Secondary navigation items
  const secondaryItems = [
    {
      text: 'Profile',
      icon: <AccountCircle />,
      path: '/app/profile',
    },
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Title */}
      <Toolbar sx={{ 
        flexDirection: 'column', 
        alignItems: 'flex-start', 
        gap: 1,
        minHeight: isMobile ? 80 : 100,
        px: 2,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp color="primary" />
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            component="div" 
            color="primary" 
            fontWeight="bold"
          >
            ProSys
          </Typography>
        </Box>
        {userRole && (
          <Chip 
            label={(() => {
              // Handle different role formats
              if (typeof userRole === 'string') {
                return userRole === 'super_admin' ? 'Super Admin' :
                       userRole === 'org_admin' ? 'Org Admin' :
                       userRole === 'property_manager' ? 'Property Manager' :
                       userRole === 'financial_viewer' ? 'Financial Viewer' :
                       userRole;
              }
              if (userRole.displayName) return userRole.displayName;
              if (userRole.name) return userRole.name;
              return 'User';
            })()} 
            color="primary" 
            variant="outlined"
            size="small"
            sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}
          />
        )}
      </Toolbar>

      <Divider />

      {/* Main Navigation */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {Object.entries(groupedItems).map(([section, items]) => {
          if (items.length === 0) return null;

          return (
            <Box key={section}>
              {/* Collapsible Section Header */}
              <ListItemButton
                onClick={() => handleSectionToggle(section)}
                sx={{
                  px: 2,
                  py: 1,
                  backgroundColor: 'grey.50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  minHeight: 40,
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {sectionConfig[section]?.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={sectionConfig[section]?.title}
                  primaryTypographyProps={{
                    variant: 'subtitle2',
                    fontWeight: 'bold',
                    fontSize: isMobile ? '0.875rem' : '0.9rem',
                  }}
                  sx={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                />
                {expandedSections[section] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>

              {/* Collapsible Section Items */}
              <Collapse in={expandedSections[section]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {items.map((item) => (
                    <ListItem key={item.path} disablePadding>
                      <ListItemButton
                        selected={isActive(item.path)}
                        onClick={() => handleItemClick(item.path)}
                        sx={{
                          pl: 4,
                          py: 1,
                          mx: 1,
                          borderRadius: 1,
                          mb: 0.5,
                          display: 'flex',
                          alignItems: 'flex-start',
                          minHeight: item.subtitle && !isMobile ? 48 : 40,
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
                            minWidth: 40,
                            alignSelf: 'flex-start',
                            mt: item.subtitle && !isMobile ? 0.5 : 0,
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <ListItemText 
                            primary={item.text}
                            primaryTypographyProps={{
                              fontWeight: isActive(item.path) ? 600 : 400,
                              fontSize: isMobile ? '0.875rem' : '0.9rem',
                            }}
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              margin: 0,
                            }}
                          />
                          {item.subtitle && !isMobile && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.secondary',
                                fontSize: '0.7rem',
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                mt: 0.25,
                              }}
                            >
                              {item.subtitle}
                            </Typography>
                          )}
                        </Box>
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>

              {/* Divider between sections */}
              {section !== 'reports' && items.length > 0 && (
                <Box sx={{ py: 1 }}>
                  <Divider sx={{ mx: 2 }} />
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

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
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: isActive(item.path) ? 600 : 400,
                  fontSize: isMobile ? '0.875rem' : '0.9rem',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ResponsiveSidebar;
