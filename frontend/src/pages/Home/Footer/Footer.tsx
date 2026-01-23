import { Container, Typography, Grid, Link } from '@mui/material';
import { Storage, GitHub, Twitter, Email, Favorite } from '@mui/icons-material';
import {
  FooterWrapper,
  LinksContainer,
  BrandBox,
  LogoBox,
  SocialIconButton,
  PrivacyPromiseBox,
  BottomBar,
  SocialBox,
} from './Footer.styles';

export default function Footer() {
  return (
    <FooterWrapper component="footer">
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Brand */}
          <Grid item xs={12} md={3}>
            <BrandBox>
              <LogoBox>
                <Storage sx={{ color: 'white', fontSize: 24 }} />
              </LogoBox>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Prism
              </Typography>
            </BrandBox>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Privacy-first database API generation for developers who value speed and control.
            </Typography>
            <SocialBox>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex' }}>
                <SocialIconButton size="small">
                  <GitHub fontSize="small" />
                </SocialIconButton>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex' }}>
                <SocialIconButton size="small">
                  <Twitter fontSize="small" />
                </SocialIconButton>
              </a>
              <a href="mailto:hello@prism.dev" style={{ display: 'inline-flex' }}>
                <SocialIconButton size="small">
                  <Email fontSize="small" />
                </SocialIconButton>
              </a>
            </SocialBox>
          </Grid>

          {/* Product */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Product
            </Typography>
            <LinksContainer>
              <Link href="#features" color="text.secondary" underline="hover" variant="body2">
                Features
              </Link>
              <Link href="#pricing" color="text.secondary" underline="hover" variant="body2">
                Pricing
              </Link>
              <Link href="#docs" color="text.secondary" underline="hover" variant="body2">
                Documentation
              </Link>
              <Link href="#changelog" color="text.secondary" underline="hover" variant="body2">
                Changelog
              </Link>
              <Link href="#roadmap" color="text.secondary" underline="hover" variant="body2">
                Roadmap
              </Link>
            </LinksContainer>
          </Grid>

          {/* Resources */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Resources
            </Typography>
            <LinksContainer>
              <Link href="#examples" color="text.secondary" underline="hover" variant="body2">
                Examples
              </Link>
              <Link href="#guides" color="text.secondary" underline="hover" variant="body2">
                Guides
              </Link>
              <Link href="#blog" color="text.secondary" underline="hover" variant="body2">
                Blog
              </Link>
              <Link href="#community" color="text.secondary" underline="hover" variant="body2">
                Community
              </Link>
              <Link href="#support" color="text.secondary" underline="hover" variant="body2">
                Support
              </Link>
            </LinksContainer>
          </Grid>

          {/* Company */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Company
            </Typography>
            <LinksContainer>
              <Link href="#about" color="text.secondary" underline="hover" variant="body2">
                About
              </Link>
              <Link href="#privacy" color="text.secondary" underline="hover" variant="body2">
                Privacy Policy
              </Link>
              <Link href="#terms" color="text.secondary" underline="hover" variant="body2">
                Terms of Service
              </Link>
              <Link href="#security" color="text.secondary" underline="hover" variant="body2">
                Security
              </Link>
              <Link href="#contact" color="text.secondary" underline="hover" variant="body2">
                Contact
              </Link>
            </LinksContainer>
          </Grid>
        </Grid>

        {/* Privacy Promise */}
        <PrivacyPromiseBox elevation={0}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Favorite sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
              Privacy Promise
            </Typography>
          </div>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: '600px', mx: 'auto' }}>
            Your database credentials never leave your browser. All connections are made directly from your device.
            We don't store, transmit, or have access to your sensitive data.
          </Typography>
        </PrivacyPromiseBox>

        {/* Bottom Bar */}
        <BottomBar>
          <Typography variant="body2" color="text.secondary">
            © 2026 Prism. All rights reserved.
          </Typography>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Typography variant="body2" color="text.secondary">
              Made with
            </Typography>
            <Favorite sx={{ fontSize: 16, color: '#ef4444' }} />
            <Typography variant="body2" color="text.secondary">
              for developers
            </Typography>
          </div>
        </BottomBar>
      </Container>
    </FooterWrapper>
  );
}
