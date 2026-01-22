import { Container, Typography, Table, TableBody, TableContainer } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import {
  ComparisonWrapper,
  HeaderBox,
  MotionPaper,
  StyledTableHead,
  StyledTableRow,
  StyledTableCell,
  HeaderTableCell,
  PrismAvatarBox,
  PrismAvatar,
} from './ComparisonTable.styles';

const comparisons = [
  {
    feature: 'Privacy (credentials in browser)',
    prism: true,
    hasura: false,
    supabase: false,
    postgrest: false,
    dreamfactory: false,
  },
  {
    feature: 'Multi-language code generation',
    prism: true,
    hasura: false,
    supabase: false,
    postgrest: false,
    dreamfactory: false,
  },
  {
    feature: 'MySQL + PostgreSQL support',
    prism: true,
    hasura: true,
    supabase: false,
    postgrest: false,
    dreamfactory: true,
  },
  {
    feature: 'Instant API generation',
    prism: true,
    hasura: true,
    supabase: true,
    postgrest: true,
    dreamfactory: true,
  },
  {
    feature: 'ER diagram visualization',
    prism: true,
    hasura: true,
    supabase: false,
    postgrest: false,
    dreamfactory: false,
  },
  {
    feature: 'Auto Swagger documentation',
    prism: true,
    hasura: false,
    supabase: true,
    postgrest: false,
    dreamfactory: true,
  },
  {
    feature: 'Zero infrastructure setup',
    prism: true,
    hasura: false,
    supabase: false,
    postgrest: false,
    dreamfactory: false,
  },
  {
    feature: 'Free tier',
    prism: true,
    hasura: true,
    supabase: true,
    postgrest: true,
    dreamfactory: true,
  },
];

export default function ComparisonTable() {
  return (
    <ComparisonWrapper>
      <Container maxWidth="lg">
        <HeaderBox>
          <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 700, mb: 2 }}>
            How we compare
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
            See why developers choose Prism for API generation
          </Typography>
        </HeaderBox>

        <MotionPaper
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          elevation={4}
        >
          <TableContainer>
            <Table>
              <StyledTableHead>
                <StyledTableRow>
                  <HeaderTableCell>Feature</HeaderTableCell>
                  <HeaderTableCell align="center">
                    <PrismAvatarBox>
                      <PrismAvatar>
                        P
                      </PrismAvatar>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        Prism
                      </Typography>
                    </PrismAvatarBox>
                  </HeaderTableCell>
                  <HeaderTableCell align="center" sx={{ color: 'text.secondary' }}>
                    Hasura
                  </HeaderTableCell>
                  <HeaderTableCell align="center" sx={{ color: 'text.secondary' }}>
                    Supabase
                  </HeaderTableCell>
                  <HeaderTableCell align="center" sx={{ color: 'text.secondary' }}>
                    PostgREST
                  </HeaderTableCell>
                  <HeaderTableCell align="center" sx={{ color: 'text.secondary' }}>
                    DreamFactory
                  </HeaderTableCell>
                </StyledTableRow>
              </StyledTableHead>
              <TableBody>
                {comparisons.map((row, index) => (
                  <StyledTableRow key={index}>
                    <StyledTableCell>{row.feature}</StyledTableCell>
                    <StyledTableCell align="center">
                      {row.prism ? (
                        <CheckCircle sx={{ color: 'primary.main', fontSize: 24 }} />
                      ) : (
                        <Cancel sx={{ color: 'action.disabled', fontSize: 24 }} />
                      )}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {row.hasura ? (
                        <CheckCircle sx={{ color: 'text.secondary', fontSize: 24 }} />
                      ) : (
                        <Cancel sx={{ color: 'action.disabled', fontSize: 24 }} />
                      )}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {row.supabase ? (
                        <CheckCircle sx={{ color: 'text.secondary', fontSize: 24 }} />
                      ) : (
                        <Cancel sx={{ color: 'action.disabled', fontSize: 24 }} />
                      )}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {row.postgrest ? (
                        <CheckCircle sx={{ color: 'text.secondary', fontSize: 24 }} />
                      ) : (
                        <Cancel sx={{ color: 'action.disabled', fontSize: 24 }} />
                      )}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {row.dreamfactory ? (
                        <CheckCircle sx={{ color: 'text.secondary', fontSize: 24 }} />
                      ) : (
                        <Cancel sx={{ color: 'action.disabled', fontSize: 24 }} />
                      )}
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </MotionPaper>
      </Container>
    </ComparisonWrapper>
  );
}
