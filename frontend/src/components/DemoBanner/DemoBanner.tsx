import { Alert, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { isDemoModeActive, useTour } from '../../context/TourContext';
import { ROUTES } from '../../constants';

export default function DemoBanner() {
  const navigate = useNavigate();
  const { startTour } = useTour();
  const isDemo = isDemoModeActive();

  if (!isDemo) {
    return null;
  }

  const handleExitDemo = () => {
    sessionStorage.removeItem('prism-demo-mode');
    navigate(ROUTES.HOME);
  };

  return (
    <Alert 
      severity="info" 
      sx={{ 
        borderRadius: 0, 
        justifyContent: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1200,
        '& .MuiAlert-message': { 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          flexWrap: 'wrap',
          justifyContent: 'center'
        }
      }}
    >
      <Box component="span">You're viewing the demo with sample data. Navigate freely or take a guided tour!</Box>
      <Button 
        size="small" 
        variant="outlined"
        onClick={startTour}
      >
        Start Tour
      </Button>
      <Button 
        size="small" 
        variant="contained" 
        onClick={handleExitDemo}
      >
        Exit Demo
      </Button>
      <Button 
        size="small" 
        variant="outlined" 
        onClick={() => navigate(ROUTES.SIGN_UP)}
      >
        Sign Up Free
      </Button>
    </Alert>
  );
}
