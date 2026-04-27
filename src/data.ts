import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  BarChart2,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Database,
  FileSearch,
  FileText,
  Heart,
  Landmark,
  Map,
  MessageSquare,
  Network,
  Radio,
  ScanFace,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Stethoscope,
  Tags,
  Tractor,
  Users,
  Video,
  Zap,
  Droplets,
  Factory,
} from 'lucide-react';

export type ToolType = 'form' | 'chat' | 'dashboard';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'file';
  placeholder?: string;
}

export interface Tool {
  id: string;
  title: string;
  description: string;
  icon: any;
  type: ToolType;
  formFields?: FormField[];
  mockActionLabel?: string;
  mockResultText?: string;
}

export interface Sector {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  nodeType: 'Edge' | 'Cloud';
  tools: Tool[];
}

export const SECTORS: Sector[] = [
  {
    id: 'health',
    title: 'Health Sector',
    subtitle: 'Secure Local Data Processing',
    description: 'Local edge processing for sensitive medical data. Strictly adheres to PII scrubbing before metadata sync.',
    icon: Heart,
    nodeType: 'Edge',
    tools: [
      {
        id: 'secure-data-ingest',
        title: 'Secure Data Processing',
        description: 'Convert medical scans and survey data into FHIR-compliant JSON. PII is scrubbed locally.',
        icon: FileText,
        type: 'form',
        formFields: [
          { id: 'scanDesc', label: 'Medical Scan Description', type: 'textarea', placeholder: 'e.g., Chest X-ray showing signs of...' },
          { id: 'scanImage', label: 'Medical Scan Image', type: 'file' },
          { id: 'surveyData', label: 'Patient Survey Data', type: 'textarea', placeholder: 'Paste raw survey data here...' },
        ],
        mockActionLabel: 'Process Data Locally',
        mockResultText: '{\n  "status": "success",\n  "pii_scrubbed": true,\n  "format": "FHIR-JSON",\n  "data_hash": "a8f3b2..."\n}'
      },
      {
        id: 'patient-triage',
        title: 'Patient Triage Bot',
        description: 'Automate patient intake and preliminary triage based on reported urgency.',
        icon: MessageSquare,
        type: 'chat',
      },
      {
        id: 'symptom-assessment',
        title: 'Symptom Assessment AI',
        description: 'Assess patient-reported symptoms against known pathogen databases.',
        icon: Stethoscope,
        type: 'form',
        formFields: [
          { id: 'symptoms', label: 'Describe Symptoms', type: 'textarea', placeholder: 'e.g., Persistent cough, high fever...' }
        ],
        mockActionLabel: 'Assess Symptoms',
        mockResultText: 'Assessment complete. High correlation with seasonal influenza. Local model confidence: 92%.'
      },
      {
        id: 'anonymity-monitor',
        title: 'Data Firewall Monitor',
        description: 'Real-time monitoring of the local-to-cloud PII stripping buffer.',
        icon: ShieldCheck,
        type: 'dashboard',
      },
      {
        id: 'local-model-status',
        title: 'Llama 4 Edge Status',
        description: 'Monitor local model inference hardware and token throughput.',
        icon: Activity,
        type: 'dashboard',
      },
      {
        id: 'zkp-gateway-health',
        title: 'Zero-Knowledge Proof Gateway',
        description: 'Verify cross-sector triggers (e.g., from Finance) without exposing underlying PII.',
        icon: ShieldAlert,
        type: 'form',
        formFields: [
          { id: 'token', label: 'ZKP Handshake Token', type: 'text', placeholder: 'Enter authorization hash...' }
        ],
        mockActionLabel: 'Verify Token',
        mockResultText: 'Token Verified. Cryptographic proof accepted. Underlying data remains unexposed. Transfer authorized.'
      }
    ]
  },
  {
    id: 'finance',
    title: 'Finance Sector',
    subtitle: 'Financial Audit & Bias Detection',
    description: 'Cloud-based orchestration for resource allocation, ensuring equitable cross-sector funding.',
    icon: Landmark,
    nodeType: 'Cloud',
    tools: [
      {
        id: 'bias-audit',
        title: 'Resource Allocation Bias Audit',
        description: 'Scan transaction patterns across sectors to ensure equitable service delivery.',
        icon: FileSearch,
        type: 'form',
        formFields: [
          { id: 'dateRange', label: 'Audit Timeframe', type: 'text', placeholder: 'YYYY-MM-DD to YYYY-MM-DD' },
          { id: 'targetSector', label: 'Target Sector (Optional)', type: 'text', placeholder: 'e.g., Education' }
        ],
        mockActionLabel: 'Run Audit Engine',
        mockResultText: 'Audit complete. No significant bias detected. Allocation variance is within 1.2% of target equity benchmark.'
      },
      {
        id: 'fraud-detection',
        title: 'Anomaly Transaction Stream',
        description: 'Real-time monitoring of cross-sector handshakes for financial irregularities.',
        icon: AlertTriangle,
        type: 'dashboard',
      },
      {
        id: 'zkp-verifier',
        title: 'Zero-Knowledge Proof Gateway',
        description: 'Verify cross-sector triggers (e.g., Health event requires funding) without exposing underlying PII.',
        icon: ShieldAlert,
        type: 'form',
        formFields: [
          { id: 'token', label: 'ZKP Handshake Token', type: 'text', placeholder: 'Enter authorization hash...' }
        ],
        mockActionLabel: 'Verify Token',
        mockResultText: 'Token Verified. Cryptographic proof accepted. Underlying data remains unexposed. Transfer authorized.'
      },
      {
        id: 'equity-dashboard',
        title: 'Equitable Distribution Tracker',
        description: 'Visual tracking of resource flows mapped against demographic density.',
        icon: BarChart2,
        type: 'dashboard',
      },
      {
        id: 'contract-auditor',
        title: 'Smart Policy Auditor',
        description: 'Validate organizational compliance policies against regulatory frameworks.',
        icon: CheckCircle2,
        type: 'form',
        formFields: [
          { id: 'policyText', label: 'Policy Document Text', type: 'textarea', placeholder: 'Paste policy draft here...' }
        ],
        mockActionLabel: 'Analyze Policy',
        mockResultText: 'Policy structure sound. Recommended additions: Clause 4.2 requires stronger phrasing regarding data retention parity.'
      }
    ]
  },
  {
    id: 'edu',
    title: 'Education Sector',
    subtitle: 'Intelligent Lesson Plan Tool',
    description: 'Autonomous RAG systems building self-refining, adaptive learning pathways.',
    icon: BookOpen,
    nodeType: 'Cloud',
    tools: [
      {
        id: 'rag-lesson-builder',
        title: 'Autonomous RAG Architect',
        description: 'Generate adaptive learning paths. Researcher Agent fetches data, Reviewer loops until complete.',
        icon: Network,
        type: 'form',
        formFields: [
          { id: 'topic', label: 'Subject Matter', type: 'text', placeholder: 'e.g., Quantum Mechanics basics.' },
          { id: 'level', label: 'Target Proficiency', type: 'text', placeholder: 'Beginner / Intermediate / Advanced' }
        ],
        mockActionLabel: 'Initialize RAG Loop',
        mockResultText: 'Agent Loop Complete (4 iterations). Lesson plan generated. 12 external sources verified and synthesized.'
      },
      {
        id: 'gap-analyzer',
        title: 'Knowledge Gap Profiler',
        description: 'Upload cohort metrics to identify systemic misunderstandings.',
        icon: Tags,
        type: 'form',
        formFields: [
          { id: 'assessmentData', label: 'Assessment Cohort Data (CSV)', type: 'file' }
        ],
        mockActionLabel: 'Profile Cohort',
        mockResultText: 'Cluster analysis complete. 42% of cohort exhibiting recurring errors in module 3 (Thermodynamics). Recommending curriculum adjustment.'
      },
      {
        id: 'student-tutor',
        title: 'Adaptive Peer Tutor Bot',
        description: 'Interact with the fine-tuned education model specialized in Socratic questioning.',
        icon: MessageSquare,
        type: 'chat',
      },
      {
        id: 'source-verifier',
        title: 'Material Truth Engine',
        description: 'Cross-reference uploaded teaching materials against high-trust academic databases.',
        icon: Database,
        type: 'form',
        formFields: [
          { id: 'material', label: 'Teaching Material', type: 'textarea', placeholder: 'Paste excerpt or chapter...' }
        ],
        mockActionLabel: 'Verify Material',
        mockResultText: 'Verification Status: 98% factual alignment. Note: Paragraph 2 cites a superseded study from 2018. See newer references.'
      },
      {
        id: 'pathway-visualizer',
        title: 'Curriculum Topology Map',
        description: 'Visualize the generated non-linear learning pathways.',
        icon: Map,
        type: 'dashboard',
      }
    ]
  },
  {
    id: 'logistics',
    title: 'Logistics Sector',
    subtitle: 'Dynamic Volunteer Routing',
    description: 'Real-time optimization of fleets and personnel responding to cross-sector demands.',
    icon: ArrowLeftRight,
    nodeType: 'Cloud',
    tools: [
      {
        id: 'volunteer-router',
        title: 'Dynamic Volunteer Dispatch',
        description: 'Interfaces with Internal Network Tool to route volunteers based on live incident spikes.',
        icon: Map,
        type: 'form',
        formFields: [
          { id: 'incidentId', label: 'Incident Vector ID', type: 'text', placeholder: 'e.g., EVT-889' },
          { id: 'resourceReq', label: 'Resource Requirement', type: 'text', placeholder: 'e.g., 5 personnel, medical' }
        ],
        mockActionLabel: 'Calculate Routes',
        mockResultText: 'Optimal routes calculated. 5 volunteers dispatched from staging area Bravo. ETA 14 minutes.'
      },
      {
        id: 'supply-predictor',
        title: 'Supply Chain Predictor Agent',
        description: 'Forecast material shortages before they occur based on cross-sector consumption rates.',
        icon: BarChart2,
        type: 'dashboard',
      },
      {
        id: 'fleet-optimizer',
        title: 'Fleet Balancing Engine',
        description: 'Rebalance physical transport assets across operational zones.',
        icon: ArrowLeftRight,
        type: 'form',
        formFields: [
          { id: 'zones', label: 'Target Zones', type: 'text', placeholder: 'North, West Sector' }
        ],
        mockActionLabel: 'Rebalance Assets',
        mockResultText: 'Fleet rebalanced. Cost efficiency improved by 8.4%. Coverage gap in West Sector closed.'
      },
      {
        id: 'dispatch-bot',
        title: 'Dispatcher Communications Bot',
        description: 'Automated natural language coordination with active field units.',
        icon: MessageSquare,
        type: 'chat',
      },
      {
        id: 'bottleneck-monitor',
        title: 'Real-time Bottleneck Alerts',
        description: 'Live feed of logistical friction points identified by the optimization graph.',
        icon: AlertTriangle,
        type: 'dashboard',
      }
    ]
  },
  {
    id: 'safety',
    title: 'Public Safety Sector',
    subtitle: 'Instant Alerting System',
    description: 'Multimodal edge-processing for rapid threat assessment and community reporting.',
    icon: Siren,
    nodeType: 'Edge',
    tools: [
      {
        id: 'signal-verification',
        title: 'Multimodal Signal Verifier',
        description: 'Process video/audio field reports to gauge urgency before broadcasting alerts. Handled locally.',
        icon: Video,
        type: 'form',
        formFields: [
          { id: 'media', label: 'Field Report Media', type: 'file' },
          { id: 'context', label: 'Reporter Context', type: 'textarea', placeholder: 'Description provided by field unit...' }
        ],
        mockActionLabel: 'Analyze Signal Data',
        mockResultText: 'Analysis complete. Visual confirmation of hazard. Urgency classified as Critical (Level 4). Alert protocol initiated.'
      },
      {
        id: 'alert-broadcaster',
        title: 'Instant Action Broadcaster',
        description: 'Push verified alerts across connected community channels.',
        icon: Radio,
        type: 'form',
        formFields: [
          { id: 'msg', label: 'Alert Payload', type: 'textarea', placeholder: 'Draft emergency notification...' },
          { id: 'radius', label: 'Broadcast Radius (km)', type: 'text', placeholder: '5' }
        ],
        mockActionLabel: 'Broadcast Alert',
        mockResultText: 'Alert dispatched to 14,200 devices in targeted zone. Handshake initiated with Logistics sector for support.'
      },
      {
        id: 'voice-triage',
        title: 'Community Voice Triage',
        description: 'NLP pipeline to categorize and rank incoming civilian reports by severity.',
        icon: Users,
        type: 'dashboard',
      },
      {
        id: 'threat-assessor',
        title: 'Active Threat Map',
        description: 'Geospatial visualization of verified incidents and risk vectors.',
        icon: Map,
        type: 'dashboard',
      },
      {
        id: 'crisis-bot',
        title: 'Emergency Intake Assistant',
        description: 'Conversational agent for rapid information gathering during high-stress reports.',
        icon: MessageSquare,
        type: 'chat',
      }
    ]
  },
  {
    id: 'agriculture',
    title: 'Agriculture Sector',
    subtitle: 'AI-Powered Crop Analysis',
    description: 'Edge-to-Cloud architecture for precision farming, predictive yield analysis, and climate resilience.',
    icon: Tractor,
    nodeType: 'Edge',
    tools: [
      {
        id: 'crop-yield-predictor',
        title: 'Yield Prediction Engine',
        description: 'Forecast seasonal crop performance based on hyper-local weather and soil data.',
        icon: BarChart2,
        type: 'form',
        formFields: [
          { id: 'region', label: 'Farm Region/Zone', type: 'text', placeholder: 'e.g., North Valley' },
          { id: 'soilData', label: 'Soil Telemetry JSON', type: 'file' }
        ],
        mockActionLabel: 'Run Yield Model',
        mockResultText: 'Forecast generated: 14% yield increase over previous season. Optimal harvest window calculated.'
      },
      {
        id: 'drone-survey',
        title: 'UAV Survey Dashboard',
        description: 'Real-time telemetry and multispectral imaging from autonomous drone surveys.',
        icon: Video,
        type: 'dashboard',
      },
      {
        id: 'irrigation-bot',
        title: 'Smart Irrigation Assistant',
        description: 'Conversational interface for managing automated, AI-driven irrigation schedules.',
        icon: MessageSquare,
        type: 'chat',
      },
      {
        id: 'pest-detection',
        title: 'Early Pest Detection',
        description: 'Analyze leaf imagery via local edge models to identify invasive anomalies early.',
        icon: ScanFace,
        type: 'form',
        formFields: [
          { id: 'leafScan', label: 'Leaf / Crop Imagery', type: 'file' }
        ],
        mockActionLabel: 'Analyze Imagery',
        mockResultText: 'Analysis complete. Trace signs of corn borer detected in sector 4. Mitigation protocol recommended.'
      },
      {
        id: 'zkp-agri',
        title: 'Agri-Credit ZKP Gateway',
        description: 'Securely verify farm compliance for subsidies without exposing proprietary yield maps.',
        icon: ShieldAlert,
        type: 'form',
        formFields: [
          { id: 'authKey', label: 'Compliance Handshake Token', type: 'text', placeholder: 'Enter token...' }
        ],
        mockActionLabel: 'Verify Compliance',
        mockResultText: 'Verification successful. Carbon offset credits authorized for distribution.'
      }
    ]
  },
  {
    id: 'energy',
    title: 'Energy Sector',
    subtitle: 'Smart Grid & Orchestration',
    description: 'Dynamic load balancing and micro-grid orchestration using high-reasoning cloud agents.',
    icon: Zap,
    nodeType: 'Cloud',
    tools: [
      {
        id: 'load-balancer',
        title: 'Predictive Load Balancer',
        description: 'Anticipate peak energy draw during extreme weather events and pre-route power.',
        icon: Network,
        type: 'form',
        formFields: [
          { id: 'gridZone', label: 'Target Grid Zone', type: 'text', placeholder: 'e.g., Downtown Core' },
          { id: 'forecast', label: 'Weather Forecast Vector', type: 'textarea', placeholder: 'Paste severe weather indicators...' }
        ],
        mockActionLabel: 'Simulate Load',
        mockResultText: 'Simulation: Grid strain detected. Pre-routing 40MW from renewable storage to buffer peak hours.'
      },
      {
        id: 'outage-monitor',
        title: 'Live Outage Topology',
        description: 'Geospatial dashboard tracking active grid failures and self-healing recovery paths.',
        icon: Map,
        type: 'dashboard',
      },
      {
        id: 'market-agent',
        title: 'Energy Market Broker',
        description: 'Autonomous agent trading surplus locally-generated power on micro-grid exchanges.',
        icon: ArrowLeftRight,
        type: 'dashboard',
      },
      {
        id: 'maintenance-bot',
        title: 'Grid Maintenance Chatops',
        description: 'Coordinate dispatch of repair crews based on automated fault isolation.',
        icon: MessageSquare,
        type: 'chat',
      },
      {
        id: 'zkp-energy',
        title: 'Energy Subsidy ZKP',
        description: 'Verify low-income household energy relief eligibility without sharing personal tax data.',
        icon: ShieldCheck,
        type: 'form',
        formFields: [
          { id: 'reliefToken', label: 'Household Eligibility Token', type: 'text', placeholder: 'Enter token...' }
        ],
        mockActionLabel: 'Verify Status',
        mockResultText: 'Status Verified. Winter heating subsidy applied to account ID automatically.'
      }
    ]
  },
  {
    id: 'water',
    title: 'Water Management',
    subtitle: 'Quality & Distribution AI',
    description: 'Local edge agents monitoring municipal water purity and autonomous pressure regulation.',
    icon: Droplets,
    nodeType: 'Edge',
    tools: [
      {
        id: 'purity-analyzer',
        title: 'Contaminant AI Scanner',
        description: 'Process telemetry from local reservoir sensors to detect chemical anomalies instantly.',
        icon: Database,
        type: 'form',
        formFields: [
          { id: 'sensorData', label: 'Sensor Array Telemetry', type: 'file' }
        ],
        mockActionLabel: 'Scan Telemetry',
        mockResultText: 'Scan clean. pH and chlorine levels within optimal operating parameters.'
      },
      {
        id: 'leak-detection',
        title: 'Acoustic Leak Dashboard',
        description: 'Real-time analysis of pipe acoustics to pinpoint micro-fractures in city mains.',
        icon: Activity,
        type: 'dashboard',
      },
      {
        id: 'flow-optimizer',
        title: 'Dynamic Pressure Controller',
        description: 'Optimize water pressure based on predictive community usage patterns to save energy.',
        icon: BarChart2,
        type: 'dashboard',
      },
      {
        id: 'citizen-bot',
        title: 'Citizen Usage Assistant',
        description: 'AI bot advising households on conservation techniques based on their usage profile.',
        icon: MessageSquare,
        type: 'chat',
      },
      {
        id: 'zkp-water',
        title: 'Conservation Credit ZKP',
        description: 'Verify community water reduction targets securely for municipal rebate processing.',
        icon: ShieldAlert,
        type: 'form',
        formFields: [
          { id: 'blockId', label: 'Community Block Token', type: 'text', placeholder: 'Enter token...' }
        ],
        mockActionLabel: 'Verify Reduction',
        mockResultText: 'Target verified. 15% reduction confirmed. Conservation rebates distributed to block.'
      }
    ]
  }
];
