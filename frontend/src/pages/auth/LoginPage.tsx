// platform/frontend-mui/src/pages/auth/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
} from '@mui/icons-material';
import { XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { AppDispatch, RootState } from '../../store';
import { clearError, loginUser } from '../../store/slices/authSlice';
import logger from '../../utils/logger';

// Mock performance data for the chart
const performanceData = [
  { month: 'Jan', efficiency: 387, reliability: 453 },
  { month: 'Feb', efficiency: 280, reliability: 140 },
  { month: 'Mar', efficiency: 129, reliability: 100 },
  { month: 'Apr', efficiency: 643, reliability: 405 },
  { month: 'May', efficiency: 540, reliability: 195 },
  { month: 'Jun', efficiency: 343, reliability: 135 },
];

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  // Use the correct test credentials
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Use Redux state properly
  const { loading, error, isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // Log component mount with performance measurement
  useEffect(() => {
    document.title = 'Login - SEMAR';
    const endMeasure = logger.measure('LoginPage Component Mount');
    
    logger.info('LoginPage component mounted', {
      component: 'LoginPage',
      timestamp: new Date().toISOString(),
      path: window.location.pathname,
    });
    
    // Debug current auth state on mount
    console.log('🔍 LoginPage mounted - current auth state:', {
      reduxAuth: { isAuthenticated, loading, error, user },
      storageToken: localStorage.getItem('token') || localStorage.getItem('auth_token'),
      storageUser: localStorage.getItem('user') || localStorage.getItem('user_data')
    });
    
    // Complete the performance measurement
    setTimeout(() => {
      endMeasure();
    }, 100);
    
    // Log component unmount
    return () => {
      logger.info('LoginPage component unmounted', {
        component: 'LoginPage',
        path: window.location.pathname,
      });
    };
  }, [isAuthenticated, loading, error, user]);

  // Navigate to dashboard after successful login with storage verification
  useEffect(() => {
    if (isAuthenticated) {
      // Double-check storage before navigation
      const storedToken = localStorage.getItem('token') || localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user') || localStorage.getItem('user_data');
      
      if (storedToken && storedUser) {
        logger.info('User authenticated with verified storage, navigating to dashboard', {
          component: 'LoginPage',
          action: 'navigation',
          destination: '/dashboard',
          storageVerified: true
        });
        navigate('/dashboard');
      } else {
        console.error('❌ LoginPage: User marked as authenticated but storage is empty!', {
          isAuthenticated,
          storedToken: !!storedToken,
          storedUser: !!storedUser,
          reduxUser: !!user
        });
        
        // Try to clear inconsistent state
        dispatch(clearError());
      }
    }
  }, [isAuthenticated, navigate, user, dispatch]);

  // Enhanced handleSubmit with verification
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    logger.logUserAction('login_attempt', {
      username,
      hasPassword: Boolean(password),
    });
    
    dispatch(clearError());
    
    // Enhanced Redux dispatch with verification
    dispatch(loginUser({ username, password }))
      .unwrap()
      .then((result) => {
        console.log('🎉 LoginPage: Login successful, result:', result);
        
        // Verify if data was stored properly
        const storedToken = localStorage.getItem('token') || localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('user') || localStorage.getItem('user_data');
        
        if (storedToken && storedUser) {
          console.log('✅ LoginPage: Auth data verified in storage');
          
          // Verify user data
          try {
            const userObj = JSON.parse(storedUser);
            console.log('👤 LoginPage: Stored user verified:', userObj.username);
          } catch (error) {
            console.error('❌ LoginPage: Stored user data is invalid JSON');
          }
        } else {
          console.error('❌ LoginPage: Auth data NOT found in storage after login!', {
            token: !!storedToken,
            user: !!storedUser,
            tokenLength: storedToken?.length || 0,
            userLength: storedUser?.length || 0
          });
          
          // Manual storage attempt as fallback
          if (result.token && result.user) {
            console.log('🔧 LoginPage: Manual storage fallback...');
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
          }
        }
      })
      .catch((error) => {
        console.error('❌ LoginPage: Login failed:', error);
      });
  };

  // Debug current storage function
  const debugCurrentStorage = () => {
    console.group('🔍 LoginPage Storage Debug');
    console.log('Redux State:', { isAuthenticated, loading, error, user });
    console.log('Token Storage:', {
      token: localStorage.getItem('token'),
      auth_token: localStorage.getItem('auth_token'),
      authToken: localStorage.getItem('authToken'),
      access_token: localStorage.getItem('access_token')
    });
    console.log('User Storage:', {
      user: localStorage.getItem('user'),
      user_data: localStorage.getItem('user_data'),
      current_user: localStorage.getItem('current_user')
    });
    console.groupEnd();
  };


  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Debug button in development mode */}
      {import.meta.env.VITE_DEBUG_MODE === 'true' && (
        <button
          type="button"
          onClick={debugCurrentStorage}
          style={{ position: 'fixed', top: 10, right: 10, zIndex: 9999, padding: '5px 10px', fontSize: 12 }}
        >
          Debug Storage
        </button>
      )}

      {/* Left Side - Hero & Branding (Hidden on mobile) */}
      <Box
        sx={{
          flex: { xs: 0, md: 1.2 },
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          background: 'radial-gradient(circle at 10% 20%, #172554 0%, #1e3a8a 40%, #0f172a 100%)',
          color: 'white',
          p: 8,
          overflow: 'hidden',
        }}
      >
        {/* Decorative glowing orbs */}
        <Box
          sx={{
            position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px',
            background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%)',
            borderRadius: '50%', zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute', bottom: '-20%', right: '-10%', width: '600px', height: '600px',
            background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(0,0,0,0) 70%)',
            borderRadius: '50%', zIndex: 0,
          }}
        />

        {/* Top Branding */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, animation: 'fadeIn 0.8s ease-out' }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Reksolindo SEMAR Logo"
              sx={{ width: 64, height: 64, borderRadius: 3, mr: 2, boxShadow: '0 8px 16px rgba(0,0,0,0.3)' }}
            />
            <Box>
              <Typography variant="h3" fontWeight="700" letterSpacing="-0.02em" sx={{ mb: 0 }}>
                SEMAR
              </Typography>
              <Typography variant="subtitle2" sx={{ color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Solution to Enhance Managing Asset Reliability
              </Typography>
            </Box>
          </Box>
          <Typography variant="h4" fontWeight="300" sx={{ mb: 2, maxWidth: 500, lineHeight: 1.4, animation: 'slideUp 0.8s ease-out 0.2s both' }}>
            Intelligent insights for <Box component="span" sx={{ fontWeight: 600, color: '#60a5fa' }}>industrial excellence</Box>.
          </Typography>
          <Typography variant="body1" sx={{ color: '#cbd5e1', maxWidth: 480, lineHeight: 1.6, mb: 6, animation: 'slideUp 0.8s ease-out 0.3s both' }}>
            Elevate your asset management with predictive analytics, real-time integrity monitoring, and comprehensive reporting tools tailored for modern industry.
          </Typography>
        </Box>

        {/* Glassmorphic Infographics */}
        <Box sx={{ position: 'relative', zIndex: 1, animation: 'slideUp 1s ease-out 0.5s both', display: 'flex', gap: 3, flexWrap: { xs: 'wrap', lg: 'nowrap' } }}>
          {/* Chart Showcase */}
          <Card
            sx={{
              flex: '1.5',
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 4,
              p: 3,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="600" sx={{ color: 'white' }}>
                System Performance
              </Typography>
              <Chip size="small" label="Live" sx={{ height: 20, backgroundColor: 'rgba(16,185,129,0.2)', color: '#34d399', fontWeight: 600, fontSize: '0.65rem' }} />
            </Box>
            <Box sx={{ height: 160, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis hide />
                  <Area
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorEfficiency)"
                    fillOpacity={1}
                  />
                  <Area
                    type="monotone"
                    dataKey="reliability"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#colorReliability)"
                    fillOpacity={1}
                  />
                  <defs>
                    <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorReliability" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Card>

          {/* Asset Integrity Score */}
          <Card
            sx={{
              flex: '1',
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 4,
              p: 3,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography variant="subtitle1" fontWeight="600" sx={{ color: 'white', mb: 2 }}>
              Asset Integrity
            </Typography>
            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, flexGrow: 1 }}>
              <Box sx={{ position: 'relative', width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress 
                  variant="determinate" 
                  value={100} 
                  size={100} 
                  thickness={5} 
                  sx={{ color: 'rgba(255,255,255,0.05)', position: 'absolute' }} 
                />
                <CircularProgress 
                  variant="determinate" 
                  value={94} 
                  size={100} 
                  thickness={5} 
                  sx={{ 
                    color: '#60a5fa', 
                    position: 'absolute',
                    strokeLinecap: 'round',
                  }} 
                />
                <Box sx={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="h5" fontWeight="800" color="white" sx={{ lineHeight: 1 }}>
                    94<Typography component="span" variant="caption" color="#cbd5e1" sx={{ fontWeight: 600 }}>%</Typography>
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', pt: 2 }}>
              <Box>
                <Typography variant="caption" color="#94a3b8" sx={{ fontSize: '0.65rem' }}>Active Assets</Typography>
                <Typography variant="subtitle2" color="white" fontWeight="700">1,204</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="#f87171" sx={{ fontSize: '0.65rem' }}>Critical Risk</Typography>
                <Typography variant="subtitle2" color="#f87171" fontWeight="700">0</Typography>
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>

      {/* Right Side - Login Area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          position: 'relative',
          px: { xs: 4, sm: 8, md: 12 },
          py: 8,
          boxShadow: { md: '-20px 0 50px rgba(0,0,0,0.05)' },
          zIndex: 10,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 440, animation: 'fadeIn 0.6s ease-out', '& .MuiTypography-root, & .MuiButton-root, & .MuiInputBase-root': { fontFamily: '"Plus Jakarta Sans", sans-serif !important' } }}>
          {/* Mobile Logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', mb: 6 }}>
            <Box component="img" src="/logo.png" alt="Logo" sx={{ width: 48, height: 48, borderRadius: 2, mr: 2 }} />
            <Typography variant="h4" fontWeight="700" color="primary.main">
              SEMAR
            </Typography>
          </Box>

          <Box sx={{ mb: 5 }}>
            <Typography variant="h4" fontWeight="700" sx={{ mb: 1, color: '#1e293b' }}>
              Welcome back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please enter your details to sign in.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1, color: '#475569' }}>
              Username
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              variant="outlined"
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': { borderRadius: 3 }
              }}
            />

            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1, color: '#475569' }}>
              Password
            </Typography>
            <TextField
              fullWidth
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#94a3b8' }}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 1,
                '& .MuiOutlinedInput-root': { borderRadius: 3 }
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                }
                label={<Typography variant="body2" color="text.secondary">Remember for 30 days</Typography>}
              />
              <Typography
                variant="body2"
                component="a"
                href="#"
                fontWeight="600"
                sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { color: 'primary.dark' } }}
              >
                Forgot password?
              </Typography>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.8,
                fontSize: '1rem',
                mb: 3,
                boxShadow: '0 8px 20px rgba(59, 130, 246, 0.25)',
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              sx={{
                py: 1.5,
                color: '#475569',
                borderColor: '#e2e8f0',
                borderWidth: 2,
                backgroundColor: 'transparent',
                '&:hover': {
                  borderColor: '#cbd5e1',
                  backgroundColor: '#f8fafc',
                  borderWidth: 2,
                },
              }}
            >
              Sign in with Google
            </Button>
          </Box>

          <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 6 }}>
            Don't have an account?{' '}
            <Typography component="a" href="#" fontWeight="600" sx={{ color: 'primary.main', textDecoration: 'none' }}>
              Contact your administrator
            </Typography>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;