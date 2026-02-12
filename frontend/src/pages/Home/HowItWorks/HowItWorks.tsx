import { Container, Typography, Grid } from '@mui/material';
import { Storage, Search, AutoAwesome, RocketLaunch } from '@mui/icons-material';
import { motion } from 'motion/react';
import { ROUTES } from '../../../constants';
import {
  HowItWorksWrapper,
  HeaderBox,
  MotionCard,
  StyledCardContent,
  IconBox,
  NumberAvatar,
  ActionButton,
  CtaBox,
} from './HowItWorks.styles';

const steps = [
  {
    icon: Storage,
    title: 'Connect your database',
    description: 'Enter your MySQL or PostgreSQL credentials. Prism securely connects and accesses your schema.',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    number: '01',
  },
  {
    icon: Search,
    title: 'We introspect your schema',
    description: 'Prism analyzes your tables, columns, relationships, and constraints automatically.',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    number: '02',
  },
  {
    icon: AutoAwesome,
    title: 'APIs generated instantly',
    description: 'Full CRUD endpoints with filtering, sorting, pagination, and relationship support.',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    number: '03',
  },
  {
    icon: RocketLaunch,
    title: 'Test & start building',
    description: 'Test endpoints in-browser with our API panel. Build custom queries with the visual wizard.',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    number: '04',
  },
];

export default function HowItWorks() {
  return (
    <HowItWorksWrapper id="how-it-works">
      <Container maxWidth="lg">
        <HeaderBox>
          <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 700, mb: 2 }}>
            From database to API in seconds
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
            No complex setup. No backend code to write. Just instant APIs.
          </Typography>
        </HeaderBox>

        <Grid container spacing={4}>
          {steps.map((step, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                <NumberAvatar>{step.number}</NumberAvatar>

                <StyledCardContent>
                  <IconBox style={{ background: step.gradient }}>
                    <step.icon sx={{ color: 'white', fontSize: 32 }} />
                  </IconBox>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {step.description}
                  </Typography>
                </StyledCardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>

        <CtaBox>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <ActionButton
              onClick={() => window.location.href = ROUTES.DASHBOARD.ROOT}
            >
              Try it now - it's free
            </ActionButton>
          </motion.div>
        </CtaBox>
      </Container>
    </HowItWorksWrapper>
  );
}
