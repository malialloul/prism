import { useState } from 'react';
import { Switch } from '@mui/material';
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
} from './DatabaseActionsPanel.styles';

interface DatabaseActionsPanelProps {
  isCreateDialogOpen: boolean;
  isConnectDialogOpen: boolean;
  onOpenCreateDialog: () => void;
  onCloseCreateDialog: () => void;
  onOpenConnectDialog: () => void;
  onCloseConnectDialog: () => void;
}

export default function DatabaseActionsPanel({
  isCreateDialogOpen,
  isConnectDialogOpen,
  onCloseCreateDialog,
  onCloseConnectDialog,
}: DatabaseActionsPanelProps) {
  // Create form state
  const [createEngine, setCreateEngine] = useState<'postgres' | 'mysql'>('postgres');
  const [createName, setCreateName] = useState('');

  // Connect form state
  const [connectHost, setConnectHost] = useState('');
  const [connectPort, setConnectPort] = useState('5432');
  const [connectUsername, setConnectUsername] = useState('');
  const [connectPassword, setConnectPassword] = useState('');
  const [connectDatabase, setConnectDatabase] = useState('');
  const [connectSSL, setConnectSSL] = useState(true);

  const handleCreateSubmit = () => {
    console.log('Creating database:', { engine: createEngine, name: createName });
    onCloseCreateDialog();
    // Reset form
    setCreateName('');
    setCreateEngine('postgres');
  };

  const handleConnectSubmit = () => {
    console.log('Connecting database:', { 
      host: connectHost, 
      port: connectPort, 
      username: connectUsername,
      database: connectDatabase,
      ssl: connectSSL,
    });
    onCloseConnectDialog();
    // Reset form
    setConnectHost('');
    setConnectPort('5432');
    setConnectUsername('');
    setConnectPassword('');
    setConnectDatabase('');
    setConnectSSL(true);
  };

  return (
    <>
      {/* Create Database Dialog */}
      <StyledDialog open={isCreateDialogOpen} onClose={onCloseCreateDialog}>
        <DialogHeader>
          <DialogTitle>Create New Database</DialogTitle>
          <DialogSubtitle>Provision a managed database instance</DialogSubtitle>
        </DialogHeader>
        <DialogContent>
          <FormGroup>
            <FormLabel>Database Engine</FormLabel>
            <EngineToggleGroup
              value={createEngine}
              exclusive
              onChange={(_, value) => value && setCreateEngine(value)}
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
              placeholder="my-production-db"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              fullWidth
            />
          </FormGroup>
        </DialogContent>
        <DialogFooter>
          <CancelButton onClick={onCloseCreateDialog}>Cancel</CancelButton>
          <SubmitButton onClick={handleCreateSubmit} disabled={!createName}>
            Create Database
          </SubmitButton>
        </DialogFooter>
      </StyledDialog>

      {/* Connect Database Dialog */}
      <StyledDialog open={isConnectDialogOpen} onClose={onCloseConnectDialog}>
        <DialogHeader>
          <DialogTitle>Connect Existing Database</DialogTitle>
          <DialogSubtitle>Enter your database connection details</DialogSubtitle>
        </DialogHeader>
        <DialogContent>
          <FormRow>
            <FormGroup>
              <FormLabel>Host</FormLabel>
              <StyledTextField
                placeholder="db.example.com"
                value={connectHost}
                onChange={(e) => setConnectHost(e.target.value)}
                fullWidth
              />
            </FormGroup>
            <FormGroup>
              <FormLabel>Port</FormLabel>
              <StyledTextField
                placeholder="5432"
                value={connectPort}
                onChange={(e) => setConnectPort(e.target.value)}
                fullWidth
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <FormLabel>Username</FormLabel>
              <StyledTextField
                placeholder="postgres"
                value={connectUsername}
                onChange={(e) => setConnectUsername(e.target.value)}
                fullWidth
              />
            </FormGroup>
            <FormGroup>
              <FormLabel>Password</FormLabel>
              <StyledTextField
                type="password"
                placeholder="••••••••"
                value={connectPassword}
                onChange={(e) => setConnectPassword(e.target.value)}
                fullWidth
              />
            </FormGroup>
          </FormRow>

          <FormGroup>
            <FormLabel>Database Name</FormLabel>
            <StyledTextField
              placeholder="my_database"
              value={connectDatabase}
              onChange={(e) => setConnectDatabase(e.target.value)}
              fullWidth
            />
          </FormGroup>

          <SSLToggle>
            <SSLLabel>
              <SSLTitle>SSL Connection</SSLTitle>
              <SSLDescription>Encrypt data in transit</SSLDescription>
            </SSLLabel>
            <Switch
              checked={connectSSL}
              onChange={(e) => setConnectSSL(e.target.checked)}
              color="primary"
            />
          </SSLToggle>
        </DialogContent>
        <DialogFooter>
          <CancelButton onClick={onCloseConnectDialog}>Cancel</CancelButton>
          <SubmitButton 
            onClick={handleConnectSubmit} 
            disabled={!connectHost || !connectUsername || !connectPassword || !connectDatabase}
          >
            Connect Database
          </SubmitButton>
        </DialogFooter>
      </StyledDialog>
    </>
  );
}
