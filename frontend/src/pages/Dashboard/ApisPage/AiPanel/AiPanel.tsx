import { useState, useRef, useEffect, useCallback } from 'react';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SaveIcon from '@mui/icons-material/Save';
import { Box, Tooltip, IconButton, CircularProgress } from '@mui/material';
import {
  AiPanelWrapper,
  ChatContainer,
  ChatMessages,
  MessageBubble,
  MessageContent,
  SqlBlock,
  SqlHeader,
  ParamsBlock,
  ChatInputContainer,
  ChatInput,
  SendButton,
  ActionButtons,
  ActionButton,
  ValidationChip,
  OperationChip,
  WelcomeMessage,
  WelcomeTitle,
  WelcomeSubtitle,
  ExamplePrompts,
  ExamplePrompt,
  LoadingDots,
} from './AiPanel.styles';
import { useGenerateSql, useSaveGeneratedApi } from '../../../../api/entities/ai';
import type { ChatMessage } from '../../../../api/models/AiTypes';
import type { DatabaseDto } from '../../../../api/models/DatabaseDto';
import SaveApiDialog from './SaveApiDialog';

interface AiPanelProps {
  connectedDatabase: DatabaseDto | null;
  onApiSaved?: () => void;
}

const examplePrompts = [
  'Get all users who have placed orders',
  'Find orders with total greater than 100',
  'Get customers from New York',
  'Find products with low stock',
];

export default function AiPanel({ connectedDatabase, onApiSaved }: AiPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { mutate: generateSql, isPending: isGenerating } = useGenerateSql();
  const { mutate: saveApi, isPending: isSaving } = useSaveGeneratedApi();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim() || !connectedDatabase || isGenerating) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // Call AI to generate SQL
    generateSql(
      {
        databaseId: String(connectedDatabase.id),
        prompt: inputValue.trim(),
      },
      {
        onSuccess: (data) => {
          const assistantMessage: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.description || 'Here is the generated SQL:',
            sql: data.sql,
            params: data.params,
            operation: data.operation,
            isValid: data.isValid,
            validationError: data.validationError,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
        },
        onError: (error) => {
          const errorMessage: ChatMessage = {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: error.message || 'Sorry, I could not process your request. Please try again.',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        },
      }
    );
  }, [inputValue, connectedDatabase, isGenerating, generateSql]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopySql = (sql: string) => {
    navigator.clipboard.writeText(sql);
  };

  const handleSaveAsApi = (message: ChatMessage) => {
    setSelectedMessage(message);
    setIsSaveDialogOpen(true);
  };

  const handleSaveApiConfirm = (name: string, description: string, paramNames: string[]) => {
    if (!selectedMessage?.sql || !connectedDatabase) return;

    saveApi(
      {
        databaseId: String(connectedDatabase.id),
        name,
        description,
        sql: selectedMessage.sql,
        params: paramNames,
        operation: selectedMessage.operation || 'SELECT',
      },
      {
        onSuccess: () => {
          setIsSaveDialogOpen(false);
          setSelectedMessage(null);
          onApiSaved?.();
        },
      }
    );
  };

  const handleExampleClick = (prompt: string) => {
    setInputValue(prompt);
  };

  if (!connectedDatabase) {
    return (
      <AiPanelWrapper>
        <WelcomeMessage>
          <SmartToyIcon sx={{ fontSize: '4rem', opacity: 0.3 }} />
          <WelcomeTitle>AI SQL Generator</WelcomeTitle>
          <WelcomeSubtitle>
            Connect to a database to start generating SQL queries with AI.
          </WelcomeSubtitle>
        </WelcomeMessage>
      </AiPanelWrapper>
    );
  }

  return (
    <AiPanelWrapper>
      <ChatContainer>
        <ChatMessages>
          {messages.length === 0 ? (
            <WelcomeMessage>
              <SmartToyIcon sx={{ fontSize: '3rem', opacity: 0.5 }} />
              <WelcomeTitle>AI SQL Generator</WelcomeTitle>
              <WelcomeSubtitle>
                Describe what data you want to query in plain English, and I'll generate the SQL for you.
                You can then save the generated query as an API endpoint.
              </WelcomeSubtitle>
              <ExamplePrompts>
                {examplePrompts.map((prompt, index) => (
                  <ExamplePrompt
                    key={index}
                    variant="outlined"
                    onClick={() => handleExampleClick(prompt)}
                  >
                    "{prompt}"
                  </ExamplePrompt>
                ))}
              </ExamplePrompts>
            </WelcomeMessage>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble key={message.id} isUser={message.role === 'user'}>
                  <MessageContent>{message.content}</MessageContent>
                  
                  {message.sql && (
                    <>
                      <SqlBlock>
                        <SqlHeader>
                          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                            <OperationChip
                              label={message.operation}
                              operation={message.operation}
                              size="small"
                            />
                            <ValidationChip
                              label={message.isValid ? 'Valid' : 'Invalid'}
                              isValid={message.isValid}
                              size="small"
                            />
                          </Box>
                          <Tooltip title="Copy SQL">
                            <IconButton
                              size="small"
                              onClick={() => handleCopySql(message.sql!)}
                              sx={{ color: 'inherit', opacity: 0.7, '&:hover': { opacity: 1 } }}
                            >
                              <ContentCopyIcon sx={{ fontSize: '1rem' }} />
                            </IconButton>
                          </Tooltip>
                        </SqlHeader>
                        <code>{message.sql}</code>
                      </SqlBlock>

                      {message.params && message.params.length > 0 && (
                        <ParamsBlock>
                          <strong>Parameters:</strong> {JSON.stringify(message.params)}
                        </ParamsBlock>
                      )}

                      {message.validationError && (
                        <ParamsBlock sx={{ backgroundColor: '#f93e3e10', color: '#f93e3e' }}>
                          ⚠️ {message.validationError}
                        </ParamsBlock>
                      )}

                      {message.isValid && (
                        <ActionButtons>
                          <ActionButton
                            variant="outlined"
                            size="small"
                            startIcon={<SaveIcon />}
                            onClick={() => handleSaveAsApi(message)}
                          >
                            Save as API
                          </ActionButton>
                        </ActionButtons>
                      )}
                    </>
                  )}
                </MessageBubble>
              ))}

              {isGenerating && (
                <MessageBubble isUser={false}>
                  <LoadingDots>
                    <span />
                    <span />
                    <span />
                  </LoadingDots>
                </MessageBubble>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </ChatMessages>

        <ChatInputContainer>
          <ChatInput
            placeholder="Describe the data you want to query..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={3}
            disabled={isGenerating}
          />
          <SendButton onClick={handleSendMessage} disabled={!inputValue.trim() || isGenerating}>
            {isGenerating ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SendIcon />
            )}
          </SendButton>
        </ChatInputContainer>
      </ChatContainer>

      <SaveApiDialog
        open={isSaveDialogOpen}
        onClose={() => {
          setIsSaveDialogOpen(false);
          setSelectedMessage(null);
        }}
        onSave={handleSaveApiConfirm}
        sql={selectedMessage?.sql || ''}
        operation={selectedMessage?.operation || 'SELECT'}
        isSaving={isSaving}
      />
    </AiPanelWrapper>
  );
}
