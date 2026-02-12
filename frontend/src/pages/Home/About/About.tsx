import { Container, Typography } from '@mui/material';
import { motion } from 'motion/react';
import {
  AboutWrapper,
  HeaderBox,
  ContentBox,
  HighlightText,
} from './About.styles';

export default function About() {
  return (
    <AboutWrapper id="about">
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <HeaderBox>
            <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 700, mb: 2 }}>
              About <HighlightText>Prism</HighlightText>
            </Typography>
          </HeaderBox>

          <ContentBox>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 2 }}>
              Prism was built by developers, for developers. We understand the tedious process of 
              creating CRUD APIs and writing boilerplate code for every new project.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 2 }}>
              Our mission is simple: <strong>eliminate repetitive backend work</strong> so you can focus 
              on building what matters. Connect your database, and Prism instantly generates 
              production-ready APIs with full CRUD operations, relationships, filtering, and pagination.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              With features like the visual query builder, interactive ER diagrams, and auto-generated 
              API documentation, Prism empowers you to ship faster without sacrificing quality or security.
            </Typography>
          </ContentBox>
        </motion.div>
      </Container>
    </AboutWrapper>
  );
}
