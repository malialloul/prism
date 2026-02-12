import { Container, Chip } from '@mui/material';
import { ArrowForward, PlayArrow, Circle } from '@mui/icons-material';
import { ROUTES } from '../../../constants';
import {
  HeroWrapper,
  GridBackground,
  HeroContent,
  HeroTitle,
  HeroSubtitle,
  CTAButtonsContainer,
  PrimaryButton,
  SecondaryButton,
  HeroPaper,
} from './Hero.styles';

interface HeroProps {
  onViewDemo?: () => void;
}

export default function Hero({ onViewDemo }: HeroProps) {
  return (
    <HeroWrapper>
      {/* Grid Background */}
      <GridBackground />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <HeroContent
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <Chip
              icon={<Circle sx={{ fontSize: 8, animation: 'pulse 2s infinite', color: '#8b5cf6 !important' }} />}
              label="Privacy-first API generation"
              sx={{
                bgcolor: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                color: 'primary.main',
              }}
            />
          </div>

          {/* Main Headline */}
          <HeroTitle variant="h1">
            Your Database. Your APIs.
            <br />
            Your Privacy.
          </HeroTitle>

          {/* Subheadline */}
          <HeroSubtitle variant="h5">
            Auto-generate REST APIs from POSTGRES/MYSQL database. Visual query builder. Zero setup.{' '}
           
          </HeroSubtitle>

          {/* CTA Buttons */}
          <CTAButtonsContainer>
            <PrimaryButton
              variant="contained"
              size="large"
              onClick={() => (window.location.href = ROUTES.DASHBOARD.ROOT)}
              endIcon={<ArrowForward />}
            >
              Get Started Free
            </PrimaryButton>
            <SecondaryButton
              variant="outlined"
              size="large"
              startIcon={<PlayArrow />}
              onClick={onViewDemo}
            >
              View Demo
            </SecondaryButton>
          </CTAButtonsContainer>

          {/* Hero Visual */}
          <HeroPaper
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            sx={{
              elevation: 24,
            }}
          />
        </HeroContent>
      </Container>
    </HeroWrapper>
  );
}
