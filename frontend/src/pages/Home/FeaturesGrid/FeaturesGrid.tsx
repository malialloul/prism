import { Container, Typography, Grid } from '@mui/material';
import { Storage, Bolt, BarChart, Description, Lock, Build } from '@mui/icons-material';
import {
  FeaturesWrapper,
  HeaderBox,
  MotionCard,
  StyledCardContent,
  IconBox,
} from './FeaturesGrid.styles';

const features = [
  {
    icon: Storage,
    title: 'Multi-Database Support',
    description: 'Connect to MySQL & PostgreSQL databases with ease. Support for multiple connections simultaneously.',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  },
  {
    icon: Bolt,
    title: 'Instant API Generation',
    description: 'Automatic CRUD operations plus relationship endpoints. No configuration needed.',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  },
  {
    icon: Build,
    title: 'Visual Query Builder',
    description: 'Build complex SQL queries visually with our step-by-step wizard. No SQL knowledge required.',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  },
  {
    icon: BarChart,
    title: 'ER Diagrams',
    description: 'Visualize your entire database schema with interactive entity-relationship diagrams.',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
  },
  {
    icon: Description,
    title: 'Auto Swagger Docs',
    description: 'Interactive API Panel generated automatically. Test endpoints right in your browser.',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
  },
  {
    icon: Lock,
    title: 'Privacy First',
    description: 'All database credentials are encrypted. Your data stays secure.',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)',
  },
];

export default function FeaturesGrid() {
  return (
    <FeaturesWrapper id="features">
      <Container maxWidth="lg">
        <HeaderBox>
          <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 700, mb: 2 }}>
            Everything you need to ship faster
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
            Built for developers who value speed, privacy, and control
          </Typography>
        </HeaderBox>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <StyledCardContent>
                  <IconBox style={{ background: feature.gradient }}>
                    <feature.icon sx={{ color: 'white', fontSize: 28 }} />
                  </IconBox>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {feature.description}
                  </Typography>
                </StyledCardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </FeaturesWrapper>
  );
}
