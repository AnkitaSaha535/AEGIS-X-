import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import type { Alert, Session, Metrics, SecurityContextType, NavItem, SectorUsage, ChatFeedback } from '../types';
import { SECTORS } from '../data/sectors';

const MOCK_ALERTS: Alert[] = [
  {
    id: 'alert-001',
    title: 'Suspicious Lateral Movement Detected',
    description: 'Anomalous SMB traffic observed between internal hosts on subnet 10.0.45.0/24',
    severity: 'critical',
    status: 'ACTIVE',
    source: 'Network Sensor Alpha',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    attackVector: 'Lateral Movement via SMB Exploit',
    targetIp: '10.0.45.102',
    trace: `[Agent Chain - Threat Analysis] 1. Researcher → Detected anomalous outbound traffic on port 445 (SMB) from host 10.0.45.102 2. Contextualizer → Correlated with CVE-2024-38077 known exploit pattern targeting LSASS 3. Reasoner → Pattern analysis reveals 87% confidence in lateral movement attempt using Pass-the-Hash 4. Verifier → Cross-referenced with MITRE ATT&CK T1550.002: CRITICAL MATCH 5. Enricher → Historical behavior baseline shows no prior SMB egress from this host 6. Decision → ALERT: Flag for immediate quarantine — isolate host 10.0.45.102`,
  },
  {
    id: 'alert-002',
    title: 'Unauthorized DNS Tunneling Attempt',
    description: 'DNS queries to known tunneling domain detected from internal DNS resolver',
    severity: 'high',
    status: 'PENDING_QUARANTINE',
    source: 'Threat Intel Feed',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    attackVector: 'DNS Exfiltration via Base64 Encoding',
    targetIp: '10.0.12.55',
    trace: `[Agent Chain - Threat Analysis] 1. Researcher → DNS query volume spike detected — 2,400 queries/min to subdomain clusters 2. Contextualizer → Subdomain entropy analysis reveals base64-encoded payloads consistent with data exfiltration 3. Reasoner → 94% probability of DNS tunneling tool (dnscat2 or Iodine) 4. Verifier → Checked against known tunneling domains: POSITIVE MATCH to threat intel cluster T-1042 5. Enricher → Payload size analysis shows incremental data transfer of ~2MB over 15 minutes 6. Decision → ALERT: PENDING_QUARANTINE — isolate DNS resolver and initiate packet capture`,
  },
  {
    id: 'alert-003',
    title: 'Privilege Escalation via Process Injection',
    description: 'LSASS process accessed by non-system process on domain controller DC-01',
    severity: 'critical',
    status: 'ACTIVE',
    source: 'EDR Agent DC-01',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    attackVector: 'Mimikatz-style Credential Dumping',
    targetIp: '10.0.0.1',
    trace: `[Agent Chain - Threat Analysis] 1. Researcher → OpenProcess API call targeting LSASS (PID 672) from powershell.exe with SeDebugPrivilege 2. Contextualizer → Process memory dump detected via MiniDumpWriteDump — signature matches credential dumping toolkit 3. Reasoner → 99% confidence in Mimikatz-style attack chain: privilege escalation → credential dumping 4. Verifier → Checked parent process chain: svchost.exe → powershell.exe — anomalous lineage detected 5. Enricher → User account associated: svc_backup — service account with elevated privileges 6. Decision → ALERT: CRITICAL — immediate quarantine, initiate credential rotation for svc_backup`,
  },
  {
    id: 'alert-004',
    title: 'Data Exfiltration to Unknown Endpoint',
    description: 'Outbound data transfer to unclassified external IP 198.51.100.23 on port 443',
    severity: 'high',
    status: 'PENDING_QUARANTINE',
    source: 'Network Sensor Bravo',
    timestamp: new Date(Date.now() - 480000).toISOString(),
    attackVector: 'Encrypted Data Exfiltration over HTTPS',
    targetIp: '198.51.100.23',
    trace: `[Agent Chain - Threat Analysis] 1. Researcher → Sustained outbound connection from finance-db-02 to 198.51.100.23:443 — 1.2GB transferred 2. Contextualizer → Destination IP geolocates to unregistered datacenter, no known business relationship 3. Reasoner → Data transfer pattern matches known exfiltration behavior: bulk transfer during off-peak hours 4. Verifier → No prior connection history to this IP in 90-day baseline — ZERO TRUST VIOLATION 5. Enricher → Data classification scan indicates possible PII transfer from customer_records table 6. Decision → ALERT: PENDING_QUARANTINE — block outbound to 198.51.100.23, initiate DLP incident`,
  },
  {
    id: 'alert-005',
    title: 'Brute Force Attack on SSH Gateway',
    description: 'Failed SSH authentication attempts exceeding threshold from external IP 203.0.113.45',
    severity: 'medium',
    status: 'ACTIVE',
    source: 'Gateway IDS',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    attackVector: 'Credential Brute Force over SSH',
    targetIp: '203.0.113.45',
    trace: `[Agent Chain - Threat Analysis] 1. Researcher → 1,847 failed SSH authentication attempts from 203.0.113.45 across 6 user accounts 2. Contextualizer → Attempt frequency analysis: 3.2 attempts/sec — automated tooling detected (Hydra/Medusa pattern) 3. Reasoner → Username enumeration confirmed: attempts target common admin accounts (root, admin, deploy) 4. Verifier → Source IP has no prior legitimate access history — flagged in threat intel with medium confidence 5. Enricher → GeoIP: originating from known hostile ASN 6. Decision → ALERT: Medium severity — rate-limit source IP, enable additional MFA challenge`,
  },
  {
    id: 'alert-006',
    title: 'Rogue Certificate Authority Detected',
    description: 'Unknown intermediate CA certificate issued in domain, potential machine-in-the-middle',
    severity: 'critical',
    status: 'ACTIVE',
    source: 'PKI Monitor',
    timestamp: new Date(Date.now() - 180000).toISOString(),
    attackVector: 'Rogue Certificate Injection',
    targetIp: '10.0.0.1',
    trace: `[Agent Chain - Threat Analysis] 1. Researcher → New intermediate CA certificate detected with subject CN=Corp-IT-CA issued 12 minutes ago 2. Contextualizer → Certificate fingerprint does not match any known CA in approved trust store — UNKNOWN ORIGIN 3. Reasoner → Certificate issued from non-standard template — no corresponding CA request in PKI logs 4. Verifier → CRL distribution point points to internal IP 10.0.0.1 — potential machine-in-the-middle infrastructure 5. Enricher → Certificate validity period: 10 years — anomalous for internal CA practices 6. Decision → ALERT: CRITICAL — revoke certificate immediately, trace issuance path, isolate affected endpoints`,
  },
  {
    id: 'alert-007',
    title: 'Port Scan from Untrusted Network',
    description: 'Vertical port scan detected against DMZ segment originating from guest network',
    severity: 'medium',
    status: 'DISMISSED',
    source: 'Network Sensor Charlie',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    attackVector: 'Network Reconnaissance',
    targetIp: '10.0.100.50',
    trace: `[Agent Chain - Threat Analysis] 1. Researcher → Sequential port scan detected from 10.100.0.50 (guest network) targeting DMZ subnet 10.0.100.0/24 2. Contextualizer → Scan pattern: SYN scan on ports 1-1024 — reconnaissance behavior consistent with Nmap default 3. Reasoner → Guest network origin suggests compromised endpoint or malicious insider on non-trusted segment 4. Verifier → Source host authenticated as guest-wifi-42 — no prior scanning behavior in baseline 5. Enricher → No active exploitation detected — but mapping of DMZ topology underway 6. Decision → ALERT: Low-Medium — block source IP, scan guest network for compromised endpoints`,
  },
  {
    id: 'alert-008',
    title: 'Suspicious PowerShell Execution',
    description: 'PowerShell launched with encoded command from user workstation WS-043',
    severity: 'high',
    status: 'PENDING_QUARANTINE',
    source: 'Endpoint Agent WS-043',
    timestamp: new Date(Date.now() - 240000).toISOString(),
    attackVector: 'Fileless Malware via PowerShell',
    targetIp: '10.0.78.43',
    trace: `[Agent Chain - Threat Analysis] 1. Researcher → PowerShell.exe launched with -EncodedCommand flag from user WS-043\\jdoe 2. Contextualizer → Decoded command reveals attempt to download and execute payload from pastebin.com — fileless malware pattern 3. Reasoner → 97% confidence in fileless attack chain: PowerShell download cradle → in-memory execution → C2 beacon 4. Verifier → Script contents match known malware family SHA256: a8f3b2c1... (DarkGate loader variant) 5. Enricher → Parent process: mshta.exe — atypical process tree indicating HTML application vector 6. Decision → ALERT: PENDING_QUARANTINE — terminate PowerShell process, isolate WS-043, scan for persistence`,
  },
];

const MOCK_SESSIONS: Session[] = [
  { id: 'sess-001', userId: 'jdoe@corp.net', hostname: 'WS-043', ipAddress: '10.0.78.43', threatScore: 87, status: 'PENDING_QUARANTINE', lastActive: new Date().toISOString(), nodeType: 'endpoint' },
  { id: 'sess-002', userId: 'asmith@corp.net', hostname: 'WS-012', ipAddress: '10.0.12.55', threatScore: 72, status: 'PENDING_QUARANTINE', lastActive: new Date(Date.now() - 300000).toISOString(), nodeType: 'endpoint' },
  { id: 'sess-003', userId: 'svc_backup@corp.net', hostname: 'DC-01', ipAddress: '10.0.0.1', threatScore: 99, status: 'ACTIVE', lastActive: new Date(Date.now() - 60000).toISOString(), nodeType: 'server' },
  { id: 'sess-004', userId: 'bwilson@corp.net', hostname: 'WS-089', ipAddress: '10.0.89.12', threatScore: 23, status: 'ACTIVE', lastActive: new Date(Date.now() - 120000).toISOString(), nodeType: 'endpoint' },
  { id: 'sess-005', userId: 'ksato@corp.net', hostname: 'AP-02', ipAddress: '10.0.34.67', threatScore: 15, status: 'ACTIVE', lastActive: new Date(Date.now() - 600000).toISOString(), nodeType: 'server' },
  { id: 'sess-006', userId: 'mrivera@corp.net', hostname: 'GW-01', ipAddress: '10.0.0.254', threatScore: 45, status: 'ACTIVE', lastActive: new Date(Date.now() - 180000).toISOString(), nodeType: 'gateway' },
  { id: 'sess-007', userId: 'nchen@corp.net', hostname: 'WS-034', ipAddress: '10.0.34.78', threatScore: 8, status: 'ACTIVE', lastActive: new Date(Date.now() - 900000).toISOString(), nodeType: 'endpoint' },
  { id: 'sess-008', userId: 'jalvarez@corp.net', hostname: 'DB-02', ipAddress: '10.0.45.102', threatScore: 91, status: 'PENDING_QUARANTINE', lastActive: new Date(Date.now() - 480000).toISOString(), nodeType: 'server' },
];

const MOCK_METRICS: Metrics = {
  breachDetectionSpeed: '47ms',
  breachDetectionLabel: 'Breach Detection Speed (10x Faster)',
  triageLoadReduction: '60%',
  triageLoadLabel: 'Triage Load Reduction (60%)',
  systemStatus: '98.7%',
  systemStatusLabel: 'System Status (Active HITL Monitoring)',
  uptime: '14d 7h 32m',
};

const SecurityContext = createContext<SecurityContextType | null>(null);

export function SecurityProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>('alert-001');
  const [sessions] = useState<Session[]>(MOCK_SESSIONS);
  const [metrics] = useState<Metrics>(MOCK_METRICS);
  const [activeNav, setActiveNav] = useState<NavItem>('dashboard');
  const [activeSectorId, setActiveSectorId] = useState<string | null>(null);
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [sectorUsage, setSectorUsage] = useState<SectorUsage[]>([]);
  const [chatFeedback, setChatFeedback] = useState<ChatFeedback[]>([]);

  const trackToolUsage = useCallback((sectorId: string, toolId: string) => {
    const sector = SECTORS.find(s => s.id === sectorId);
    const tool = sector?.tools.find(t => t.id === toolId);
    if (!sector || !tool) return;
    setSectorUsage(prev => {
      const existing = prev.find(u => u.sectorId === sectorId && u.toolId === toolId);
      if (existing) {
        return prev.map(u => u.sectorId === sectorId && u.toolId === toolId ? { ...u, count: u.count + 1 } : u);
      }
      return [...prev, { sectorId, sectorName: sector.title, toolId, toolName: tool.title, count: 1 }];
    });
  }, []);

  const addFeedback = useCallback((toolId: string, messageIndex: number, feedback: 'like' | 'dislike') => {
    setChatFeedback(prev => {
      const existing = prev.find(f => f.toolId === toolId && f.messageIndex === messageIndex);
      if (existing && existing.feedback === feedback) return prev;
      if (existing) {
        return prev.map(f => f.toolId === toolId && f.messageIndex === messageIndex ? { ...f, feedback } : f);
      }
      return [...prev, { toolId, messageIndex, feedback }];
    });
  }, []);

  const selectAlert = useCallback((id: string | null) => setSelectedAlertId(id), []);
  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'DISMISSED' as const } : a));
    if (selectedAlertId === id) setSelectedAlertId(null);
  }, [selectedAlertId]);
  const confirmQuarantine = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'PENDING_QUARANTINE' as const } : a));
  }, []);
  const navigateToDashboard = useCallback(() => {
    setActiveNav('dashboard');
    setActiveSectorId(null);
    setActiveToolId(null);
  }, []);
  const navigateToSector = useCallback((id: string) => {
    setActiveNav('threats');
    setActiveSectorId(id);
    setActiveToolId(null);
  }, []);
  const navigateToTool = useCallback((sectorId: string, toolId: string) => {
    setActiveSectorId(sectorId);
    setActiveToolId(toolId);
  }, []);

  const generateAlert = useCallback(() => {
    const templates = [
      { title: 'Abnormal Process Termination', description: 'Critical system process terminated unexpectedly on server AP-02', severity: 'high' as const },
      { title: 'Unusual Database Query Pattern', description: 'SELECT * FROM users executed 500 times in 60 seconds', severity: 'critical' as const },
    ];
    const t = templates[Math.floor(Math.random() * templates.length)];
    const alert: Alert = {
      id: `alert-${Date.now()}`,
      title: t.title,
      description: t.description,
      severity: t.severity,
      status: 'ACTIVE',
      source: 'Detection Engine',
      timestamp: new Date().toISOString(),
      attackVector: 'Automated Detection',
      targetIp: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      trace: `[Agent Chain] 1. Researcher → Anomaly detected via heuristic baseline 2. Decision → ALERT: Flag for review`,
    };
    setAlerts(prev => [alert, ...prev]);
  }, []);

  useEffect(() => {
    const intervalRef = setInterval(() => {
      if (Math.random() > 0.6) return;
      const templates = [
        { title: 'Suspicious Registry Modification', description: 'Registry run key modified on endpoint', severity: 'high' as const },
        { title: 'Unusual Outbound Connection', description: 'Connection to unknown IP on port 4444', severity: 'critical' as const },
      ];
      const t = templates[Math.floor(Math.random() * templates.length)];
      const alert: Alert = {
        id: `alert-${Date.now()}`,
        title: t.title,
        description: t.description,
        severity: t.severity,
        status: 'ACTIVE',
        source: 'Detection Engine',
        timestamp: new Date().toISOString(),
        attackVector: 'Automated Detection',
        targetIp: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        trace: `[Agent Chain] 1. Researcher → Automated alert triggered 2. Decision → ALERT: Flagging for review`,
      };
      setAlerts(prev => [alert, ...prev]);
    }, 45000);
    return () => clearInterval(intervalRef);
  }, []);

  return (
    <SecurityContext.Provider value={{
      alerts, selectedAlertId, sessions, metrics, activeNav, activeSectorId, activeToolId,
      selectAlert, dismissAlert, confirmQuarantine, setActiveNav, navigateToDashboard,
      navigateToSector, navigateToTool, generateAlert,
      trackToolUsage, sectorUsage, chatFeedback, addFeedback,
    }}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const ctx = useContext(SecurityContext);
  if (!ctx) throw new Error('useSecurity must be used within SecurityProvider');
  return ctx;
}
