import React, { useState } from 'react';
import { Box, Container, Paper, Tab, Tabs } from '@mui/material';
import { NodeEditor } from '../components/NodeEditor/NodeEditor';
import { ImageConfigView } from '../components/ImageConfigView';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface MainViewViewProps {
  state: {
    imageConfig: any;
    progress: { status: string };
    results: any;
    workflow: { steps: any[] };
  };
}

export const MainViewView: React.FC<MainViewViewProps> = ({ state }) => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabIndex} onChange={handleTabChange} aria-label="main tabs">
            <Tab label="Image Processing" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="Configuration" id="tab-1" aria-controls="tabpanel-1" />
            <Tab label="Progress" id="tab-2" aria-controls="tabpanel-2" />
            <Tab label="Results" id="tab-3" aria-controls="tabpanel-3" />
          </Tabs>
        </Box>

        <TabPanel value={tabIndex} index={0}>
          <NodeEditor nodes={state.workflow.steps} />
        </TabPanel>

        <TabPanel value={tabIndex} index={1}>
          <div data-testid="image-config">
            <ImageConfigView config={state.imageConfig} />
          </div>
        </TabPanel>

        <TabPanel value={tabIndex} index={2}>
          <div>Status: {state.progress.status}</div>
        </TabPanel>

        <TabPanel value={tabIndex} index={3}>
          <div>
            {state.results ? (
              <pre>{JSON.stringify(state.results, null, 2)}</pre>
            ) : (
              'No results available'
            )}
          </div>
        </TabPanel>
      </Paper>
    </Container>
  );
}; 