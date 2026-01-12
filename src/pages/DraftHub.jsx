import BoardTable from '../components/BoardTable';
import NavBar from '../components/Nav/NavBar';
import { Container, Typography, Box } from '@mui/material';
import { useResponsive } from '../hooks/useResponsive';

export default function DraftHub() {
  const { isMobile, isTablet } = useResponsive();
  const isDesktopOnly = !isMobile && !isTablet; // Only true desktop

  return (
    <div style={{ 
      backgroundColor: '#F7FAFC', 
      minHeight: '100vh',
      height: isDesktopOnly ? '100vh' : 'auto',
      overflow: isDesktopOnly ? 'hidden' : 'auto'
    }}>
      <NavBar />
      
      <Container
        maxWidth={false}
        sx={{
          px: { xs: 1, sm: 2, md: 3, lg: 4 },
          py: { xs: 2, sm: 3, md: 2 },
          maxWidth: { xs: '100%', lg: '1600px', xl: '1800px' },
          // Only constrain height on true desktop
          height: isDesktopOnly ? 'calc(100vh - 64px)' : 'auto',
          display: isDesktopOnly ? 'flex' : 'block',
          flexDirection: isDesktopOnly ? 'column' : 'initial'
        }}
      >
        {/* Page Header */}
        <Box sx={{ 
          mb: { xs: 2, sm: 3, md: 2 }, 
          flexShrink: isDesktopOnly ? 0 : 'initial'
        }}>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            component="h1"
            sx={{
              fontFamily: '"Oswald", sans-serif',
              fontWeight: '600',
              color: '#2D3748',
              mb: 1,
              textAlign: 'center'
            }}
          >
            Draft Board
          </Typography>
        </Box>

        {/* Draft Board Table */}
        <Box
          sx={{
            width: '100%',
            height: isDesktopOnly ? 'calc(100vh - 180px)' : 'auto',
            flexGrow: isDesktopOnly ? 1 : 'initial',
            overflow: isDesktopOnly ? 'hidden' : 'visible'
          }}
        >
          <BoardTable />
        </Box>
      </Container>
    </div>
  );
}
