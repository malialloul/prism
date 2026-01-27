import { useEffect, useState } from 'react';
import { Switch } from '@mui/material';
import { ButtonLoadingSkeleton } from '../../../components';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useCreateDatabase, useConnectDatabase, useTestConnection } from '../../../api/entities/databases';
import { toastService } from '../../../services';
import { encryptForTransmission } from '../../../utils/crypto';
import {
  StyledDialog,
  DialogHeader,
  DialogTitle,
  DialogSubtitle,
  DialogContent,
  FormGroup,
  FormLabel,
  StyledTextField,
  EngineToggleGroup,
  EngineToggleButton,
  EngineIcon,
  EngineName,
  DialogFooter,
  CancelButton,
  SubmitButton,
  FormRow,
  SSLToggle,
  SSLLabel,
  SSLTitle,
  SSLDescription,
  TestConnectionButton,
  ConnectionStatus,
} from './DatabaseActionsPanel.styles';
import { DatabaseDto } from '../../../api/models/DatabaseDto';

// Validation schemas
const createDatabaseSchema = Yup.object({
  engine: Yup.string().oneOf(['postgres', 'mysql']).required(),
  name: Yup.string().required('Database name is required'),
  password: Yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
});

const connectDatabaseSchema = Yup.object({
  engine: Yup.string().oneOf(['postgres', 'mysql']).required(),
  name: Yup.string().required('Connection name is required'),
  host: Yup.string().required('Host is required'),
  port: Yup.string().required('Port is required'),
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
  database: Yup.string().required('Database name is required'),
  ssl: Yup.boolean(),
});

// Default values per engine
const engineDefaults = {
  postgres: { name: 'postgres', host: 'localhost', port: '5432', database: 'postgres' },
  mysql: { name: 'mysql', host: 'localhost', port: '3306', database: 'mysql' },
};

interface DatabaseActionsPanelProps {
  isCreateDialogOpen: boolean;
  isConnectDialogOpen: boolean;
  initialCreateEngine?: 'postgres' | 'mysql';
  onOpenCreateDialog: () => void;
  onCloseCreateDialog: () => void;
  onOpenConnectDialog: () => void;
  onCloseConnectDialog: () => void;
  onDatabaseConnected?: (databaseId: string) => void;
}

export default function DatabaseActionsPanel({
  isCreateDialogOpen,
  isConnectDialogOpen,
  initialCreateEngine,
  onCloseCreateDialog,
  onCloseConnectDialog,
  onDatabaseConnected,
}: DatabaseActionsPanelProps) {
  const [connectionTestStatus, setConnectionTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [connectionTestMessage, setConnectionTestMessage] = useState('');

  // API hooks
  const { mutate: submitCreateDatabase, isPending: isCreating } = useCreateDatabase({
    onSuccess: (database, message) => {
      toastService.success(message);
      onCloseCreateDialog();
      createFormik.resetForm();
      onDatabaseConnected?.(database.id);
    },
    // Error toast is handled by httpClient interceptor
  });

  const { mutate: submitConnectDatabase, isPending: isConnecting } = useConnectDatabase({
    onSuccess: (database, message) => {
      toastService.success(message);
      onCloseConnectDialog();
      connectFormik.resetForm();
      setConnectionTestStatus('idle');
      setConnectionTestMessage('');
      onDatabaseConnected?.(database.id);
    },
    // Error toast is handled by httpClient interceptor
  });

  const { mutate: testConnection, isPending: isTesting } = useTestConnection({
    onSuccess: (result) => {
      if (result.success) {
        setConnectionTestStatus('success');
        setConnectionTestMessage(`Connection successful! Found ${result.tables ?? 0} tables.`);
      } else {
        setConnectionTestStatus('error');
        setConnectionTestMessage(result.message);
      }
    },
    onError: (error) => {
      setConnectionTestStatus('error');
      setConnectionTestMessage(error.message || 'Connection test failed');
    },
  });

  // Create Database Form
  const createFormik = useFormik({
    initialValues: {
      engine: initialCreateEngine || 'postgres' as DatabaseDto['engine'],
      name: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: createDatabaseSchema,
    onSubmit: async (values) => {
      const encryptedPassword = await encryptForTransmission(values.password);
      submitCreateDatabase({
        name: values.name,
        engine: values.engine,
        password: encryptedPassword,
      });
    },
  });

  // Sync createEngine when initialCreateEngine changes
  useEffect(() => {
    if (initialCreateEngine) {
      createFormik.setFieldValue('engine', initialCreateEngine);
    }
  }, [initialCreateEngine]);

  // Connect Database Form
  const connectFormik = useFormik({
    initialValues: {
      engine: 'postgres' as 'postgres' | 'mysql',
      name: 'postgres',
      host: 'localhost',
      port: '5432',
      username: '',
      password: '',
      database: 'postgres',
      ssl: true,
    },
    validationSchema: connectDatabaseSchema,
    onSubmit: async (values) => {
      const encryptedPassword = await encryptForTransmission(values.password);
      submitConnectDatabase({
        name: values.name,
        engine: values.engine,
        host: values.host,
        port: parseInt(values.port, 10),
        username: values.username,
        password: encryptedPassword,
        database: values.database,
        ssl: values.ssl,
      });
    },
  });

  // Update defaults when engine changes
  useEffect(() => {
    const defaults = engineDefaults[connectFormik.values.engine];
    connectFormik.setValues({
      ...connectFormik.values,
      name: defaults.name,
      host: defaults.host,
      port: defaults.port,
      database: defaults.database,
    });
    setConnectionTestStatus('idle');
    setConnectionTestMessage('');
  }, [connectFormik.values.engine]);

  const handleTestConnection = async () => {
    setConnectionTestStatus('testing');
    const encryptedPassword = await encryptForTransmission(connectFormik.values.password);
    testConnection({
      engine: connectFormik.values.engine,
      host: connectFormik.values.host,
      port: parseInt(connectFormik.values.port, 10),
      username: connectFormik.values.username,
      password: encryptedPassword,
      database: connectFormik.values.database,
      ssl: connectFormik.values.ssl,
    });
  };

  const handleCloseConnectDialog = () => {
    onCloseConnectDialog();
    connectFormik.resetForm();
    setConnectionTestStatus('idle');
    setConnectionTestMessage('');
  };

  const handleCloseCreateDialog = () => {
    onCloseCreateDialog();
    createFormik.resetForm();
  };

  const isTestDisabled = !connectFormik.values.host || !connectFormik.values.username || 
    !connectFormik.values.password || !connectFormik.values.database || isTesting;

  return (
    <>
      {/* Create Database Dialog */}
      <StyledDialog open={isCreateDialogOpen} onClose={handleCloseCreateDialog}>
        <form onSubmit={createFormik.handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Database</DialogTitle>
            <DialogSubtitle>Provision a managed database instance</DialogSubtitle>
          </DialogHeader>
          <DialogContent>
            <FormGroup>
              <FormLabel>Database Engine</FormLabel>
              <EngineToggleGroup
                value={createFormik.values.engine}
                exclusive
                onChange={(_, value) => value && createFormik.setFieldValue('engine', value)}
              >
                <EngineToggleButton value="postgres">
                  <EngineIcon engine="postgres">P</EngineIcon>
                  <EngineName>PostgreSQL</EngineName>
                </EngineToggleButton>
                <EngineToggleButton value="mysql">
                  <EngineIcon engine="mysql">M</EngineIcon>
                  <EngineName>MySQL</EngineName>
                </EngineToggleButton>
              </EngineToggleGroup>
            </FormGroup>

            <FormGroup>
              <FormLabel>Database Name</FormLabel>
              <StyledTextField
                name="name"
                placeholder="my-production-db"
                value={createFormik.values.name}
                onChange={createFormik.handleChange}
                onBlur={createFormik.handleBlur}
                error={createFormik.touched.name && Boolean(createFormik.errors.name)}
                helperText={createFormik.touched.name && createFormik.errors.name}
                fullWidth
              />
            </FormGroup>

            <FormRow>
              <FormGroup>
                <FormLabel>Password</FormLabel>
                <StyledTextField
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={createFormik.values.password}
                  onChange={createFormik.handleChange}
                  onBlur={createFormik.handleBlur}
                  error={createFormik.touched.password && Boolean(createFormik.errors.password)}
                  helperText={createFormik.touched.password && createFormik.errors.password}
                  fullWidth
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Confirm Password</FormLabel>
                <StyledTextField
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={createFormik.values.confirmPassword}
                  onChange={createFormik.handleChange}
                  onBlur={createFormik.handleBlur}
                  error={createFormik.touched.confirmPassword && Boolean(createFormik.errors.confirmPassword)}
                  helperText={createFormik.touched.confirmPassword && createFormik.errors.confirmPassword}
                  fullWidth
                />
              </FormGroup>
            </FormRow>
          </DialogContent>
          <DialogFooter>
            <CancelButton type="button" onClick={handleCloseCreateDialog} disabled={isCreating}>Cancel</CancelButton>
            <SubmitButton type="submit" disabled={!createFormik.isValid || !createFormik.dirty || isCreating}>
              {isCreating ? <ButtonLoadingSkeleton size="small" /> : 'Create Database'}
            </SubmitButton>
          </DialogFooter>
        </form>
      </StyledDialog>

      {/* Connect Database Dialog */}
      <StyledDialog open={isConnectDialogOpen} onClose={handleCloseConnectDialog}>
        <form onSubmit={connectFormik.handleSubmit}>
          <DialogHeader>
            <DialogTitle>Connect Existing Database</DialogTitle>
            <DialogSubtitle>Enter your database connection details</DialogSubtitle>
          </DialogHeader>
          <DialogContent>
            <FormGroup>
              <FormLabel>Database Engine</FormLabel>
              <EngineToggleGroup
                value={connectFormik.values.engine}
                exclusive
                onChange={(_, value) => value && connectFormik.setFieldValue('engine', value)}
              >
                <EngineToggleButton value="postgres">
                  <EngineIcon engine="postgres">P</EngineIcon>
                  <EngineName>PostgreSQL</EngineName>
                </EngineToggleButton>
                <EngineToggleButton value="mysql">
                  <EngineIcon engine="mysql">M</EngineIcon>
                  <EngineName>MySQL</EngineName>
                </EngineToggleButton>
              </EngineToggleGroup>
            </FormGroup>

            <FormGroup>
              <FormLabel>Connection Name</FormLabel>
              <StyledTextField
                name="name"
                placeholder="My Production Database"
                value={connectFormik.values.name}
                onChange={connectFormik.handleChange}
                onBlur={connectFormik.handleBlur}
                error={connectFormik.touched.name && Boolean(connectFormik.errors.name)}
                helperText={connectFormik.touched.name && connectFormik.errors.name}
                fullWidth
              />
            </FormGroup>

            <FormRow>
              <FormGroup>
                <FormLabel>Host</FormLabel>
                <StyledTextField
                  name="host"
                  placeholder="db.example.com"
                  value={connectFormik.values.host}
                  onChange={connectFormik.handleChange}
                  onBlur={connectFormik.handleBlur}
                  error={connectFormik.touched.host && Boolean(connectFormik.errors.host)}
                  helperText={connectFormik.touched.host && connectFormik.errors.host}
                  fullWidth
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Port</FormLabel>
                <StyledTextField
                  name="port"
                  placeholder={connectFormik.values.engine === 'postgres' ? '5432' : '3306'}
                  value={connectFormik.values.port}
                  onChange={connectFormik.handleChange}
                  onBlur={connectFormik.handleBlur}
                  error={connectFormik.touched.port && Boolean(connectFormik.errors.port)}
                  helperText={connectFormik.touched.port && connectFormik.errors.port}
                  fullWidth
                />
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <FormLabel>Username</FormLabel>
                <StyledTextField
                  name="username"
                  placeholder={connectFormik.values.engine === 'postgres' ? 'postgres' : 'root'}
                  value={connectFormik.values.username}
                  onChange={connectFormik.handleChange}
                  onBlur={connectFormik.handleBlur}
                  error={connectFormik.touched.username && Boolean(connectFormik.errors.username)}
                  helperText={connectFormik.touched.username && connectFormik.errors.username}
                  fullWidth
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Password</FormLabel>
                <StyledTextField
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={connectFormik.values.password}
                  onChange={connectFormik.handleChange}
                  onBlur={connectFormik.handleBlur}
                  error={connectFormik.touched.password && Boolean(connectFormik.errors.password)}
                  helperText={connectFormik.touched.password && connectFormik.errors.password}
                  fullWidth
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <FormLabel>Database Name</FormLabel>
              <StyledTextField
                name="database"
                placeholder="my_database"
                value={connectFormik.values.database}
                onChange={connectFormik.handleChange}
                onBlur={connectFormik.handleBlur}
                error={connectFormik.touched.database && Boolean(connectFormik.errors.database)}
                helperText={connectFormik.touched.database && connectFormik.errors.database}
                fullWidth
              />
            </FormGroup>

            <SSLToggle>
              <SSLLabel>
                <SSLTitle>SSL Connection</SSLTitle>
                <SSLDescription>Encrypt data in transit</SSLDescription>
              </SSLLabel>
              <Switch
                name="ssl"
                checked={connectFormik.values.ssl}
                onChange={connectFormik.handleChange}
                color="primary"
              />
            </SSLToggle>

            {connectionTestStatus !== 'idle' && (
              <ConnectionStatus status={connectionTestStatus === 'testing' ? 'testing' : connectionTestStatus}>
                {connectionTestStatus === 'testing' && <ButtonLoadingSkeleton size="small" />}
                {connectionTestStatus === 'success' && '✓'}
                {connectionTestStatus === 'error' && '✗'}
                {connectionTestMessage || 'Testing connection...'}
              </ConnectionStatus>
            )}
          </DialogContent>
          <DialogFooter>
            <TestConnectionButton
              type="button"
              onClick={handleTestConnection}
              disabled={isTestDisabled}
            >
              {isTesting ? <ButtonLoadingSkeleton size="small" /> : 'Test Connection'}
            </TestConnectionButton>
            <CancelButton type="button" onClick={handleCloseConnectDialog}>Cancel</CancelButton>
            <SubmitButton 
              type="submit"
              disabled={!connectFormik.isValid || !connectFormik.dirty || isConnecting}
            >
              {isConnecting ? <ButtonLoadingSkeleton size="small" /> : 'Connect Database'}
            </SubmitButton>
          </DialogFooter>
        </form>
      </StyledDialog>
    </>
  );
}
