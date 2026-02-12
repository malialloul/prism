import { useEffect } from 'react';
import { Container, Typography, Alert, CircularProgress } from '@mui/material';
import { motion } from 'motion/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSubmitContact } from '../../../api/entities/contact';
import {
  ContactWrapper,
  HeaderBox,
  FormContainer,
  StyledTextField,
  SubmitButton,
  HighlightText,
} from './Contact.styles';

const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  subject: Yup.string()
    .min(3, 'Subject must be at least 3 characters')
    .required('Subject is required'),
  message: Yup.string()
    .min(10, 'Message must be at least 10 characters')
    .required('Message is required'),
});

export default function Contact() {
  const { mutate: submitContact, isPending, isSuccess, isError, error, reset } = useSubmitContact();

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
    validationSchema,
    onSubmit: (values) => {
      submitContact(values);
    },
  });

  // Reset form on success
  useEffect(() => {
    if (isSuccess) {
      formik.resetForm();
    }
  }, [isSuccess]);

  // Set API error on form
  useEffect(() => {
    if (isError && error) {
      const errorMessage = error.body?.message || error.body?.error || error.message || 'Failed to send message';
      formik.setStatus(errorMessage);
    }
  }, [isError, error]);

  return (
    <ContactWrapper id="contact">
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <HeaderBox>
            <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 700, mb: 2 }}>
              Get in <HighlightText>Touch</HighlightText>
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
              Have questions or feedback? We'd love to hear from you.
            </Typography>
          </HeaderBox>

          <form onSubmit={formik.handleSubmit}>
            <FormContainer>
            {isSuccess && (
              <Alert severity="success" sx={{ mb: 3 }} onClose={reset}>
                Thank you for your message! We'll get back to you soon.
              </Alert>
            )}
            {formik.status && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => formik.setStatus(null)}>
                {formik.status}
              </Alert>
            )}

            <StyledTextField
              fullWidth
              label="Name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <StyledTextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
            <StyledTextField
              fullWidth
              label="Subject"
              name="subject"
              value={formik.values.subject}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.subject && Boolean(formik.errors.subject)}
              helperText={formik.touched.subject && formik.errors.subject}
            />
            <StyledTextField
              fullWidth
              label="Message"
              name="message"
              multiline
              rows={4}
              value={formik.values.message}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.message && Boolean(formik.errors.message)}
              helperText={formik.touched.message && formik.errors.message}
            />
            <SubmitButton
              type="submit"
              variant="contained"
              fullWidth
              disabled={isPending || !formik.isValid}
            >
              {isPending ? <CircularProgress size={24} color="inherit" /> : 'Send Message'}
            </SubmitButton>
            </FormContainer>
          </form>
        </motion.div>
      </Container>
    </ContactWrapper>
  );
}
