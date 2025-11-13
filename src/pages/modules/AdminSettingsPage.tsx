import React, { useState, useMemo } from 'react';
import { User, ModuleSettings } from '../../types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type PeriodFilter = 'day' | 'week' | 'month' | 'quarter' | 'year';

export type IssueSeverity = 'high' | 'medium' | 'low';
export type IssueCategory = 'connection' | 'auth' | 'performance' | 'schema' | 'config' | 'platform';

export interface DatabaseIssue {
  id: string;
  name: string;
  category: IssueCategory;
  severity: IssueSeverity;
  description: string;
  symptoms: string[];
  diagnosticSteps: string[];
  solutions: string[];
  platformSpecific?: {
    supabase?: string;
    neondb?: string;
    planetscale?: string;
  };
}

export interface AnalyticsData {
  totalEvents: number;
  activeUsers: number;
  totalUsageTime: number;
  efficiencyScore: number;
}

export interface ModuleUsage {
  moduleName: string;
  timesUsed: number;
  totalTime: number;
  activeUsers: number;
  avgSessionTime: number;
  lastUsed: string;
}

export interface UserEfficiency {
  userId: string;
  userName: string;
  efficiencyScore: number;
  eventCount: number;
  totalTime: number;
  eventsPerHour: number;
  lastActivity: string;
}

export interface OptimizationRecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  module: string;
  description: string;
  impact: string;
}

interface AdminSettingsPageProps {
  currentUser: User | null;
  moduleSettings: ModuleSettings[];
  setModuleSettings: React.Dispatch<React.SetStateAction<ModuleSettings[]>>;
}

type TabType = 'modules' | 'analytics' | 'diagnostics';

// ============================================================================
// CONSTANTS & STATIC DATA
// ============================================================================

const MODULE_ICONS: Record<string, string> = {
  Dashboard: '🏠',
  Inventory: '📦',
  POS: '🛒',
  WorkOrders: '📋',
  Accounting: '🧮',
  CRM: '👤',
  HRM: '👥',
  Planning: '📅',
  Reports: '📄',
  Webshop: '🏪',
  Admin: '🛡️'
};

const DATABASE_ISSUES: DatabaseIssue[] = [
  // Connection Issues
  {
    id: 'conn-timeout',
    name: 'Connection Timeout',
    category: 'connection',
    severity: 'high',
    description: 'Database verbinding is verlopen voordat de query kon worden voltooid.',
    symptoms: [
      'Applicatie reageert niet na bepaalde tijd',
      'Error: "Connection timeout exceeded"',
      'Lange laadtijden gevolgd door foutmelding'
    ],
    diagnosticSteps: [
      'Controleer netwerk latency naar database server',
      'Verifieer firewall regels en security groups',
      'Test verbinding met database CLI tool',
      'Check connection timeout settings in applicatie'
    ],
    solutions: [
      'Verhoog connection timeout waarde in database configuratie',
      'Optimaliseer netwerk route naar database',
      'Gebruik connection pooling met retry logic',
      'Implementeer exponential backoff strategie'
    ],
    platformSpecific: {
      supabase: 'Controleer Supabase project status en region settings',
      neondb: 'Verifieer NeonDB compute endpoint status',
      planetscale: 'Check PlanetScale branch deployment status'
    }
  },
  {
    id: 'conn-refused',
    name: 'Connection Refused',
    category: 'connection',
    severity: 'high',
    description: 'Database server weigert de verbinding actief.',
    symptoms: [
      'Error: "Connection refused" of "ECONNREFUSED"',
      'Onmiddellijke foutmelding bij verbindingspoging',
      'Geen enkele query werkt'
    ],
    diagnosticSteps: [
      'Verifieer of database server actief is',
      'Controleer IP whitelist configuratie',
      'Test of juiste poort wordt gebruikt',
      'Valideer database credentials'
    ],
    solutions: [
      'Start database server opnieuw op',
      'Voeg client IP toe aan whitelist',
      'Corrigeer poort nummer in connection string',
      'Verifieer database service status'
    ],
    platformSpecific: {
      supabase: 'Check Supabase project pooler settings',
      neondb: 'Verifieer NeonDB connection pooler configuratie',
      planetscale: 'Controleer PlanetScale IP allowlist'
    }
  },
  {
    id: 'max-connections',
    name: 'Max Connections Reached',
    category: 'connection',
    severity: 'high',
    description: 'Maximaal aantal database verbindingen is bereikt.',
    symptoms: [
      'Error: "Too many connections"',
      'Intermittente verbindingsfouten',
      'Nieuwe gebruikers kunnen niet inloggen'
    ],
    diagnosticSteps: [
      'Check huidige aantal actieve connecties',
      'Analyseer connection pool metrics',
      'Identificeer queries die connecties vasthouden',
      'Review applicatie connection handling'
    ],
    solutions: [
      'Verhoog max_connections limiet',
      'Implementeer connection pooling',
      'Fix connection leaks in applicatie code',
      'Gebruik prepared statements met pooling'
    ],
    platformSpecific: {
      supabase: 'Upgrade naar hoger Supabase tier voor meer connecties',
      neondb: 'Gebruik NeonDB connection pooler (pgbouncer)',
      planetscale: 'PlanetScale heeft automatische connection pooling'
    }
  },
  {
    id: 'pool-exhausted',
    name: 'Connection Pool Exhausted',
    category: 'connection',
    severity: 'medium',
    description: 'Alle beschikbare connecties in de pool zijn in gebruik.',
    symptoms: [
      'Error: "Pool exhausted" of "No available connections"',
      'Trage responstijden tijdens piekuren',
      'Timeout errors onder hoge load'
    ],
    diagnosticSteps: [
      'Monitor connection pool size vs usage',
      'Analyseer query execution times',
      'Check voor lange lopende transacties',
      'Review connection lifecycle management'
    ],
    solutions: [
      'Vergroot connection pool size',
      'Optimaliseer query performance',
      'Implementeer connection timeout handling',
      'Gebruik queue mechanisme voor requests'
    ]
  },

  // Authentication & Authorization
  {
    id: 'invalid-credentials',
    name: 'Invalid Credentials',
    category: 'auth',
    severity: 'high',
    description: 'Database gebruikersnaam of wachtwoord is incorrect.',
    symptoms: [
      'Error: "Access denied" of "Authentication failed"',
      'Geen enkele database operatie werkt',
      'Applicatie start niet op'
    ],
    diagnosticSteps: [
      'Verifieer database gebruikersnaam',
      'Controleer wachtwoord in environment variables',
      'Test credentials met database CLI',
      'Check of user account actief is'
    ],
    solutions: [
      'Update credentials in .env bestand',
      'Reset database password via platform',
      'Verifieer credential format (URL encoding)',
      'Recreëer database user indien nodig'
    ],
    platformSpecific: {
      supabase: 'Gebruik connection string uit Supabase dashboard',
      neondb: 'Reset password in NeonDB console',
      planetscale: 'Genereer nieuwe credentials in PlanetScale'
    }
  },
  {
    id: 'expired-credentials',
    name: 'Expired Credentials',
    category: 'auth',
    severity: 'high',
    description: 'Database credentials zijn verlopen en moeten worden vernieuwd.',
    symptoms: [
      'Applicatie werkte eerder wel',
      'Error: "Credentials expired"',
      'Plotselinge authenticatie failures'
    ],
    diagnosticSteps: [
      'Check credential expiration date',
      'Verifieer token/password geldigheid',
      'Review platform credential policies',
      'Test met nieuwe credentials'
    ],
    solutions: [
      'Genereer nieuwe database credentials',
      'Update environment variables',
      'Implementeer credential rotation process',
      'Setup expiration monitoring'
    ],
    platformSpecific: {
      supabase: 'Service role keys verlopen niet, maar custom tokens wel',
      neondb: 'NeonDB passwords verlopen niet automatisch',
      planetscale: 'PlanetScale passwords kunnen handmatig worden geroteerd'
    }
  },
  {
    id: 'insufficient-permissions',
    name: 'Insufficient Permissions',
    category: 'auth',
    severity: 'medium',
    description: 'Database user heeft onvoldoende rechten voor gevraagde operatie.',
    symptoms: [
      'Error: "Permission denied" of "Access denied"',
      'Sommige queries werken wel, andere niet',
      'CREATE/DROP operaties falen'
    ],
    diagnosticSteps: [
      'Review database user permissions',
      'Check grant statements voor user',
      'Verifieer required permissions voor operatie',
      'Test met admin account'
    ],
    solutions: [
      'Grant nodige permissions aan database user',
      'Gebruik user met juiste role voor operatie',
      'Update Row Level Security policies',
      'Review en fix database permission schema'
    ],
    platformSpecific: {
      supabase: 'Check RLS policies en service role vs anon key',
      neondb: 'Verifieer user roles in NeonDB console',
      planetscale: 'PlanetScale gebruikt branch-based permissions'
    }
  },
  {
    id: 'ssl-required',
    name: 'SSL/TLS Required',
    category: 'auth',
    severity: 'medium',
    description: 'Database server vereist SSL/TLS encrypted verbinding.',
    symptoms: [
      'Error: "SSL required" of "TLS handshake failed"',
      'Verbinding wordt geweigerd',
      'Security warnings in logs'
    ],
    diagnosticSteps: [
      'Check database SSL/TLS requirements',
      'Verifieer client SSL configuration',
      'Test met sslmode parameter',
      'Review SSL certificate validity'
    ],
    solutions: [
      'Enable SSL in connection string (sslmode=require)',
      'Install SSL certificates indien nodig',
      'Update database client library',
      'Configure SSL parameters correct'
    ],
    platformSpecific: {
      supabase: 'Supabase vereist altijd SSL connecties',
      neondb: 'NeonDB gebruikt standaard SSL',
      planetscale: 'PlanetScale vereist TLS 1.2 of hoger'
    }
  },

  // Performance Issues
  {
    id: 'slow-queries',
    name: 'Slow Queries',
    category: 'performance',
    severity: 'high',
    description: 'Database queries nemen te veel tijd in beslag.',
    symptoms: [
      'Lange laadtijden in applicatie',
      'Timeout errors tijdens query execution',
      'Hoge database CPU usage',
      'Gebruikers klagen over traagheid'
    ],
    diagnosticSteps: [
      'Enable query logging en analyseer slow queries',
      'Run EXPLAIN ANALYZE op trage queries',
      'Check voor missing indexes',
      'Review query execution plans'
    ],
    solutions: [
      'Voeg indexes toe op vaak gebruikte kolommen',
      'Optimaliseer query structure (JOINs, subqueries)',
      'Implementeer query result caching',
      'Gebruik pagination voor grote result sets',
      'Consider denormalization voor read-heavy tables'
    ]
  },
  {
    id: 'high-cpu',
    name: 'High CPU Usage',
    category: 'performance',
    severity: 'high',
    description: 'Database server CPU is zwaar belast.',
    symptoms: [
      'Algemene traagheid van database',
      'Query timeouts',
      'Hoge response times',
      'Database server alerts'
    ],
    diagnosticSteps: [
      'Monitor CPU metrics over tijd',
      'Identificeer resource-intensive queries',
      'Check voor concurrent heavy operations',
      'Analyseer query patterns'
    ],
    solutions: [
      'Optimaliseer expensive queries',
      'Implementeer query result caching',
      'Scale database resources (vertical)',
      'Distribute load via read replicas',
      'Schedule heavy operations tijdens off-peak'
    ]
  },
  {
    id: 'memory-pressure',
    name: 'Memory Pressure',
    category: 'performance',
    severity: 'medium',
    description: 'Database server heeft onvoldoende geheugen beschikbaar.',
    symptoms: [
      'Slow query performance',
      'Disk swapping activity',
      'Out of memory errors',
      'Unstable database behavior'
    ],
    diagnosticSteps: [
      'Monitor memory usage metrics',
      'Check database buffer pool size',
      'Analyseer memory-hungry queries',
      'Review connection count vs memory'
    ],
    solutions: [
      'Increase database instance memory',
      'Optimize memory-intensive queries',
      'Reduce connection pool size',
      'Tune database cache settings',
      'Consider read replicas voor distribution'
    ],
    platformSpecific: {
      supabase: 'Upgrade Supabase tier voor meer memory',
      neondb: 'NeonDB autoscaling past memory aan',
      planetscale: 'Upgrade PlanetScale cluster size'
    }
  },
  {
    id: 'disk-io',
    name: 'Disk I/O Bottleneck',
    category: 'performance',
    severity: 'medium',
    description: 'Disk I/O is een bottleneck voor database performance.',
    symptoms: [
      'Hoge disk latency',
      'Slow write operations',
      'Query queue buildup',
      'Inconsistent response times'
    ],
    diagnosticSteps: [
      'Monitor disk I/O metrics (IOPS, throughput)',
      'Check disk queue length',
      'Analyseer write-heavy operations',
      'Review storage type en configuration'
    ],
    solutions: [
      'Upgrade naar faster storage (SSD/NVMe)',
      'Optimize write patterns en batch operations',
      'Implement write-behind caching',
      'Reduce unnecessary indexes',
      'Archive oude data'
    ]
  },

  // Schema Issues
  {
    id: 'table-not-found',
    name: 'Table Not Found',
    category: 'schema',
    severity: 'high',
    description: 'Gevraagde database tabel bestaat niet.',
    symptoms: [
      'Error: "Table doesn\'t exist" of "relation does not exist"',
      'Specifieke features werken niet',
      'Migration errors'
    ],
    diagnosticSteps: [
      'List alle tables in database',
      'Verifieer table name spelling (case-sensitive)',
      'Check of migrations zijn uitgevoerd',
      'Review database schema'
    ],
    solutions: [
      'Run database migrations',
      'Corrigeer table naam in code',
      'Create missing table via migration',
      'Verify database/schema selection'
    ]
  },
  {
    id: 'column-not-found',
    name: 'Column Not Found',
    category: 'schema',
    severity: 'medium',
    description: 'Gevraagde kolom bestaat niet in de tabel.',
    symptoms: [
      'Error: "Unknown column" of "column does not exist"',
      'Query failures voor specifieke velden',
      'Form submission errors'
    ],
    diagnosticSteps: [
      'Describe table structure',
      'Verifieer column name spelling',
      'Check migration history',
      'Compare code vs actual schema'
    ],
    solutions: [
      'Run pending migrations',
      'Add missing column via migration',
      'Fix column name in queries',
      'Update ORM/model definitions'
    ]
  },
  {
    id: 'schema-mismatch',
    name: 'Schema Mismatch',
    category: 'schema',
    severity: 'medium',
    description: 'Database schema komt niet overeen met applicatie verwachting.',
    symptoms: [
      'Data type errors',
      'Unexpected null values',
      'Constraint violations',
      'ORM/model errors'
    ],
    diagnosticSteps: [
      'Compare database schema met code definitions',
      'Review recent schema changes',
      'Check migration status',
      'Validate data types en constraints'
    ],
    solutions: [
      'Synchronize schema via migrations',
      'Update application models/types',
      'Fix data type mismatches',
      'Add missing constraints'
    ]
  },
  {
    id: 'migration-pending',
    name: 'Migration Pending',
    category: 'schema',
    severity: 'medium',
    description: 'Er zijn database migrations die nog niet zijn uitgevoerd.',
    symptoms: [
      'Schema-related errors',
      'Missing tables or columns',
      'Application warnings over schema',
      'Version mismatch errors'
    ],
    diagnosticSteps: [
      'Check migration status/history',
      'List pending migrations',
      'Review migration files',
      'Verify database version'
    ],
    solutions: [
      'Run pending migrations',
      'Fix failed migrations',
      'Rollback en re-run migrations indien nodig',
      'Update migration tracking table'
    ]
  },

  // Configuration Issues
  {
    id: 'incorrect-connection-string',
    name: 'Incorrect Connection String',
    category: 'config',
    severity: 'high',
    description: 'Database connection string is incorrect geformatteerd.',
    symptoms: [
      'Connection errors',
      'Parse errors in connection string',
      'Wrong database targeted',
      'Applicatie start niet'
    ],
    diagnosticSteps: [
      'Validate connection string format',
      'Check voor special characters die encoding nodig hebben',
      'Verifieer alle componenten (host, port, database, user)',
      'Test connection string met database tool'
    ],
    solutions: [
      'Corrigeer connection string syntax',
      'URL-encode special characters in password',
      'Gebruik juiste connection string template',
      'Copy connection string uit platform dashboard'
    ],
    platformSpecific: {
      supabase: 'Formaat: postgresql://user:password@host:5432/database',
      neondb: 'Include ?sslmode=require parameter',
      planetscale: 'Gebruik MySQL formaat met SSL'
    }
  },
  {
    id: 'wrong-database',
    name: 'Wrong Database Selected',
    category: 'config',
    severity: 'high',
    description: 'Applicatie verbindt met verkeerde database.',
    symptoms: [
      'Data komt niet overeen met verwachting',
      'Tables/data missing',
      'Unexpected data in tables',
      'Cross-environment issues'
    ],
    diagnosticSteps: [
      'Verify database name in connection string',
      'Check environment variables',
      'List databases on server',
      'Confirm current database selection'
    ],
    solutions: [
      'Update database name in connection string',
      'Set correct DATABASE_URL environment variable',
      'Use environment-specific configs',
      'Implement database name validation'
    ]
  },
  {
    id: 'env-vars-missing',
    name: 'Environment Variables Missing',
    category: 'config',
    severity: 'high',
    description: 'Vereiste environment variables zijn niet geconfigureerd.',
    symptoms: [
      'Error: "DATABASE_URL is not defined"',
      'Undefined values in connection',
      'Applicatie start niet',
      'Configuration errors'
    ],
    diagnosticSteps: [
      'Check .env file existence',
      'Verify environment variable names',
      'List loaded environment variables',
      'Check .env.example voor required vars'
    ],
    solutions: [
      'Create .env file met required variables',
      'Copy .env.example naar .env',
      'Set environment variables in deployment platform',
      'Verify .env is loaded door applicatie'
    ]
  },

  // Platform-Specific Issues
  {
    id: 'supabase-rls',
    name: 'Supabase RLS Policy Blocking',
    category: 'platform',
    severity: 'medium',
    description: 'Row Level Security policies blokkeren data access.',
    symptoms: [
      'Empty result sets terwijl data bestaat',
      'Permission denied voor queries',
      'Inconsistent data access tussen users',
      'Werkt met service role maar niet met anon key'
    ],
    diagnosticSteps: [
      'Check RLS policies in Supabase dashboard',
      'Test query met service role key',
      'Review policy definitions',
      'Verify user authentication state'
    ],
    solutions: [
      'Update RLS policies voor correcte access',
      'Use service role key voor admin operations',
      'Add policies voor required access patterns',
      'Test policies met verschillende user roles'
    ],
    platformSpecific: {
      supabase: 'RLS is Supabase-specifieke security feature. Disable RLS voor testing maar enable voor productie.'
    }
  },
  {
    id: 'neondb-branching',
    name: 'NeonDB Branch Issues',
    category: 'platform',
    severity: 'low',
    description: 'Problemen met NeonDB database branches.',
    symptoms: [
      'Wrong data version accessed',
      'Schema out of sync',
      'Branch not found errors',
      'Unexpected database state'
    ],
    diagnosticSteps: [
      'List NeonDB branches',
      'Verify branch name in connection string',
      'Check branch creation status',
      'Review branch point-in-time'
    ],
    solutions: [
      'Switch to correct branch',
      'Create new branch indien nodig',
      'Merge branch changes',
      'Update connection string met branch parameter'
    ],
    platformSpecific: {
      neondb: 'NeonDB branches zijn copy-on-write database copies. Gebruik ?branch=branchname in connection string.'
    }
  },
  {
    id: 'planetscale-deploy-request',
    name: 'PlanetScale Deploy Request Required',
    category: 'platform',
    severity: 'medium',
    description: 'Schema changes vereisen deploy request in PlanetScale.',
    symptoms: [
      'Schema changes niet zichtbaar in production',
      'DDL statements werken niet',
      'Branch schema out of sync',
      'Missing tables in production'
    ],
    diagnosticSteps: [
      'Check PlanetScale deploy requests',
      'Verify branch vs production schema',
      'Review pending schema changes',
      'Check deploy request status'
    ],
    solutions: [
      'Create deploy request in PlanetScale',
      'Approve en merge deploy request',
      'Run schema changes op development branch eerst',
      'Follow PlanetScale branching workflow'
    ],
    platformSpecific: {
      planetscale: 'PlanetScale gebruikt branch-based schema workflow. Schema changes moeten via deploy requests naar production.'
    }
  },
  {
    id: 'planetscale-no-fk',
    name: 'PlanetScale Foreign Key Limitation',
    category: 'platform',
    severity: 'low',
    description: 'PlanetScale ondersteunt geen foreign key constraints.',
    symptoms: [
      'CREATE TABLE met FOREIGN KEY faalt',
      'Migration errors voor FK constraints',
      'Referential integrity not enforced',
      'Schema migration failures'
    ],
    diagnosticSteps: [
      'Review schema voor foreign key usage',
      'Check migration files voor FK definitions',
      'Verify PlanetScale compatibility',
      'Test without FK constraints'
    ],
    solutions: [
      'Remove FOREIGN KEY constraints uit schema',
      'Implement referential integrity in application layer',
      'Use application-level validation',
      'Consider indexes op foreign key columns'
    ],
    platformSpecific: {
      planetscale: 'PlanetScale ondersteunt geen FK constraints door architectuur. Gebruik application-level integrity checks.'
    }
  }
];

// Mock analytics data
const MOCK_ANALYTICS_DATA: AnalyticsData = {
  totalEvents: 15847,
  activeUsers: 23,
  totalUsageTime: 89640, // in seconds
  efficiencyScore: 87.5
};

const MOCK_MODULE_USAGE: ModuleUsage[] = [
  {
    moduleName: 'Dashboard',
    timesUsed: 3421,
    totalTime: 12340,
    activeUsers: 23,
    avgSessionTime: 180,
    lastUsed: '2025-11-13T14:30:00'
  },
  {
    moduleName: 'Inventory',
    timesUsed: 2891,
    totalTime: 18920,
    activeUsers: 12,
    avgSessionTime: 390,
    lastUsed: '2025-11-13T15:45:00'
  },
  {
    moduleName: 'POS',
    timesUsed: 1834,
    totalTime: 8730,
    activeUsers: 8,
    avgSessionTime: 285,
    lastUsed: '2025-11-13T16:20:00'
  },
  {
    moduleName: 'WorkOrders',
    timesUsed: 1567,
    totalTime: 15680,
    activeUsers: 15,
    avgSessionTime: 600,
    lastUsed: '2025-11-13T13:15:00'
  },
  {
    moduleName: 'Reports',
    timesUsed: 892,
    totalTime: 4560,
    activeUsers: 9,
    avgSessionTime: 306,
    lastUsed: '2025-11-13T10:30:00'
  }
];

const MOCK_USER_EFFICIENCY: UserEfficiency[] = [
  {
    userId: '1',
    userName: 'Jan de Vries',
    efficiencyScore: 92.3,
    eventCount: 2341,
    totalTime: 15600,
    eventsPerHour: 540,
    lastActivity: '2025-11-13T16:45:00'
  },
  {
    userId: '2',
    userName: 'Sophie Bakker',
    efficiencyScore: 88.7,
    eventCount: 2156,
    totalTime: 14820,
    eventsPerHour: 522,
    lastActivity: '2025-11-13T16:30:00'
  },
  {
    userId: '3',
    userName: 'Mike Johnson',
    efficiencyScore: 85.2,
    eventCount: 1987,
    totalTime: 13940,
    eventsPerHour: 512,
    lastActivity: '2025-11-13T15:20:00'
  },
  {
    userId: '4',
    userName: 'Lisa van Dam',
    efficiencyScore: 81.4,
    eventCount: 1823,
    totalTime: 16200,
    eventsPerHour: 405,
    lastActivity: '2025-11-13T14:10:00'
  }
];

const MOCK_OPTIMIZATION_RECOMMENDATIONS: OptimizationRecommendation[] = [
  {
    id: 'opt-1',
    priority: 'high',
    module: 'Inventory',
    description: 'Verhoog cache time voor product afbeeldingen om 23% sneller laden te bereiken',
    impact: 'Geschatte verbetering: 230ms sneller, -15% server load'
  },
  {
    id: 'opt-2',
    priority: 'high',
    module: 'WorkOrders',
    description: 'Implementeer virtualisatie voor lange werk order lijsten met >100 items',
    impact: 'Geschatte verbetering: 60% sneller renderen, betere UX'
  },
  {
    id: 'opt-3',
    priority: 'medium',
    module: 'Dashboard',
    description: 'Pre-load veel gebruikte modules tijdens idle time',
    impact: 'Geschatte verbetering: 40% sneller module switching'
  },
  {
    id: 'opt-4',
    priority: 'medium',
    module: 'Reports',
    description: 'Cache rapport resultaten voor 5 minuten om database load te verminderen',
    impact: 'Geschatte verbetering: -40% database queries'
  },
  {
    id: 'opt-5',
    priority: 'low',
    module: 'CRM',
    description: 'Lazy load contact details tot ze worden opgevraagd',
    impact: 'Geschatte verbetering: 12% sneller initiële load'
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getSeverityColor = (severity: IssueSeverity): string => {
  switch (severity) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getCategoryColor = (category: IssueCategory): string => {
  switch (category) {
    case 'connection':
      return 'bg-blue-100 text-blue-800';
    case 'auth':
      return 'bg-purple-100 text-purple-800';
    case 'performance':
      return 'bg-yellow-100 text-yellow-800';
    case 'schema':
      return 'bg-pink-100 text-pink-800';
    case 'config':
      return 'bg-indigo-100 text-indigo-800';
    case 'platform':
      return 'bg-teal-100 text-teal-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getCategoryIcon = (category: IssueCategory): string => {
  switch (category) {
    case 'connection':
      return '🖥️';
    case 'auth':
      return '🔒';
    case 'performance':
      return '⚡';
    case 'schema':
      return '🌿';
    case 'config':
      return '🔧';
    case 'platform':
      return '☁️';
    default:
      return '🗄️';
  }
};

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const formatPercentage = (num: number): string => {
  return `${num.toFixed(1)}%`;
};

const getCategoryLabel = (category: IssueCategory): string => {
  const labels: Record<IssueCategory, string> = {
    connection: 'Verbinding',
    auth: 'Authenticatie',
    performance: 'Performance',
    schema: 'Schema',
    config: 'Configuratie',
    platform: 'Platform'
  };
  return labels[category];
};

const getSeverityLabel = (severity: IssueSeverity): string => {
  const labels: Record<IssueSeverity, string> = {
    high: 'Hoog',
    medium: 'Gemiddeld',
    low: 'Laag'
  };
  return labels[severity];
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({
  currentUser,
  moduleSettings,
  setModuleSettings
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [activeTab, setActiveTab] = useState<TabType>('modules');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('week');
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDisableWarning, setShowDisableWarning] = useState<string | null>(null);

  // Analytics state (in real app would come from backend)
  const [analyticsData] = useState<AnalyticsData>(MOCK_ANALYTICS_DATA);
  const [moduleUsageData] = useState<ModuleUsage[]>(MOCK_MODULE_USAGE);
  const [userEfficiencyData] = useState<UserEfficiency[]>(MOCK_USER_EFFICIENCY);
  const [optimizationRecommendations] = useState<OptimizationRecommendation[]>(
    MOCK_OPTIMIZATION_RECOMMENDATIONS
  );

  // ============================================================================
  // COMPUTED DATA
  // ============================================================================

  const filteredIssues = useMemo(() => {
    let filtered = DATABASE_ISSUES;

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(issue => issue.category === categoryFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        issue =>
          issue.name.toLowerCase().includes(query) ||
          issue.description.toLowerCase().includes(query) ||
          issue.symptoms.some(s => s.toLowerCase().includes(query)) ||
          issue.solutions.some(s => s.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [categoryFilter, searchQuery]);

  const severityStats = useMemo(() => {
    const stats = {
      high: 0,
      medium: 0,
      low: 0
    };

    filteredIssues.forEach(issue => {
      stats[issue.severity]++;
    });

    return stats;
  }, [filteredIssues]);

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin';

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleModuleToggle = (moduleId: string) => {
    // Prevent disabling Admin module
    if (moduleId === 'admin') {
      return;
    }

    const module = moduleSettings.find(m => m.id === moduleId);
    if (!module) return;

    // Show warning before disabling
    if (module.enabled) {
      setShowDisableWarning(moduleId);
    } else {
      // Enable without warning
      setModuleSettings(prev =>
        prev.map(m => (m.id === moduleId ? { ...m, enabled: true } : m))
      );
    }
  };

  const confirmDisableModule = () => {
    if (showDisableWarning) {
      setModuleSettings(prev =>
        prev.map(m =>
          m.id === showDisableWarning ? { ...m, enabled: false } : m
        )
      );
      setShowDisableWarning(null);
    }
  };

  const handleResetAnalytics = () => {
    // In real app, this would call backend API
    console.log('Resetting analytics data...');
    setShowResetConfirm(false);
    // Show success message (would need toast/notification system)
  };

  const handleTestIssue = (issueId: string) => {
    // Placeholder for future backend integration
    console.log('Testing database issue:', issueId);
    // Would run diagnostic tests and return results
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderModuleIcon = (moduleId: string) => {
    const icon = MODULE_ICONS[moduleId] || '⚙️';
    return <span className="text-lg">{icon}</span>;
  };

  const renderTabButton = (tab: TabType, icon: string, label: string) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
        activeTab === tab
          ? 'text-blue-600 border-b-2 border-blue-600'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </button>
  );

  const renderModuleBeheerTab = () => (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <span className="text-xl text-blue-600 flex-shrink-0 mt-0.5">ℹ️</span>
        <div>
          <h4 className="font-semibold text-blue-900 mb-1">Module Beheer</h4>
          <p className="text-sm text-blue-800">
            Schakel modules in of uit voor alle gebruikers. Uitgeschakelde modules zijn niet
            toegankelijk in de navigatie. Let op: Admin Settings module kan niet worden
            uitgeschakeld.
          </p>
        </div>
      </div>

      {/* Module List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Beschikbare Modules</h3>
          <p className="text-sm text-gray-600 mt-1">
            {moduleSettings.filter(m => m.enabled).length} van {moduleSettings.length} modules
            actief
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {moduleSettings.map(module => {
            const isAdminModule = module.id === 'admin';
            return (
              <div
                key={module.id}
                className={`p-6 flex items-center justify-between transition-colors ${
                  module.enabled ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`p-3 rounded-lg ${
                      module.enabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {renderModuleIcon(module.id)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{module.displayName}</h4>
                      {module.enabled && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Actief
                        </span>
                      )}
                      {isAdminModule && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          Verplicht
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {getModuleDescription(module.id)}
                    </p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  onClick={() => handleModuleToggle(module.id)}
                  disabled={isAdminModule}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    module.enabled ? 'bg-green-600' : 'bg-gray-300'
                  } ${isAdminModule ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      module.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Warning Dialog */}
      {showDisableWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl text-orange-600 flex-shrink-0">⚠️</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Module Uitschakelen
                </h3>
                <p className="text-sm text-gray-600">
                  Weet je zeker dat je deze module wilt uitschakelen? De module zal niet meer
                  beschikbaar zijn voor gebruikers totdat je deze weer inschakelt.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDisableWarning(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={confirmDisableModule}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
              >
                Uitschakelen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAnalyticsTab = () => {
    const hasData = analyticsData.totalEvents > 0;

    return (
      <div className="space-y-6">
        {/* Period Filter */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Systeem Analytics</h3>
            <p className="text-sm text-gray-600 mt-1">
              Overzicht van systeemgebruik en efficiëntie metrieken
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg text-gray-400">📋</span>
            <select
              value={periodFilter}
              onChange={e => setPeriodFilter(e.target.value as PeriodFilter)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="day">Vandaag</option>
              <option value="week">Deze Week</option>
              <option value="month">Deze Maand</option>
              <option value="quarter">Dit Kwartaal</option>
              <option value="year">Dit Jaar</option>
            </select>
          </div>
        </div>

        {!hasData ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-6xl text-gray-400 mx-auto mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Geen Analytics Data Beschikbaar
            </h3>
            <p className="text-gray-600">
              Er is nog geen usage data verzameld voor deze periode.
            </p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg text-lg">
                    📊
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {analyticsData.totalEvents.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Totaal Events</div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-green-100 rounded-lg text-lg">
                    👥
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {analyticsData.activeUsers}
                </div>
                <div className="text-sm text-gray-600">Actieve Gebruikers</div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg text-lg">
                    ⏱️
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatTime(analyticsData.totalUsageTime)}
                </div>
                <div className="text-sm text-gray-600">Totale Gebruikstijd</div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-orange-100 rounded-lg text-lg">
                    📈
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatPercentage(analyticsData.efficiencyScore)}
                </div>
                <div className="text-sm text-gray-600">Efficiëntie Score</div>
              </div>
            </div>

            {/* Module Usage Table */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Module Gebruik</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Gedetailleerde statistieken per module
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Module
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Keer Gebruikt
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Totale Tijd
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actieve Users
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gem. Sessie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Laatst Gebruikt
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {moduleUsageData.map((usage, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              {renderModuleIcon(usage.moduleName)}
                            </div>
                            <span className="font-medium text-gray-900">
                              {usage.moduleName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {usage.timesUsed.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTime(usage.totalTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {usage.activeUsers}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTime(usage.avgSessionTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(usage.lastUsed).toLocaleString('nl-NL', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User Efficiency Table */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Gebruiker Efficiëntie Scores
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Performance metrics per gebruiker
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gebruiker
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Efficiëntie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Events
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Totale Tijd
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Events/Uur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Laatste Activiteit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {userEfficiencyData.map(user => (
                      <tr key={user.userId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {user.userName
                                .split(' ')
                                .map(n => n[0])
                                .join('')}
                            </div>
                            <span className="font-medium text-gray-900">{user.userName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${user.efficiencyScore}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {formatPercentage(user.efficiencyScore)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.eventCount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTime(user.totalTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.eventsPerHour}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(user.lastActivity).toLocaleString('nl-NL', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Optimization Recommendations */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-lg text-yellow-600">⚡</span>
                  Optimalisatie Aanbevelingen
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Automatisch gegenereerde suggesties voor performance verbetering
                </p>
              </div>
              <div className="p-6 space-y-4">
                {optimizationRecommendations.map(rec => (
                  <div
                    key={rec.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            rec.priority === 'high'
                              ? 'bg-red-100 text-red-800'
                              : rec.priority === 'medium'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {rec.priority === 'high'
                            ? 'Hoge Prioriteit'
                            : rec.priority === 'medium'
                            ? 'Gemiddelde Prioriteit'
                            : 'Lage Prioriteit'}
                        </span>
                        <span className="text-xs font-medium text-gray-600">{rec.module}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-900 mb-2">{rec.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="text-lg">📈</span>
                      {rec.impact}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reset Analytics Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
              >
                <span>🔄</span>
                Reset Analytics Data
              </button>
            </div>
          </>
        )}

        {/* Reset Confirmation Dialog */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl text-red-600 flex-shrink-0">⚠️</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Analytics Data Resetten
                  </h3>
                  <p className="text-sm text-gray-600">
                    Weet je zeker dat je alle analytics data wilt resetten? Deze actie kan niet
                    ongedaan worden gemaakt. Alle usage statistieken, efficiency scores en
                    module metrics worden permanent verwijderd.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleResetAnalytics}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Reset Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDiagnosticsTab = () => (
    <div className="space-y-6">
      {/* Header with Search and Filter */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Database Diagnostics</h3>
          <p className="text-sm text-gray-600 mt-1">
            Uitgebreide database probleem diagnose en oplossingen
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Zoek in problemen, symptomen, oplossingen..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 sm:w-64">
            <span className="text-lg text-gray-400 flex-shrink-0">📋</span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value as IssueCategory | 'all')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle Categorieën</option>
              <option value="connection">Verbinding</option>
              <option value="auth">Authenticatie</option>
              <option value="performance">Performance</option>
              <option value="schema">Schema</option>
              <option value="config">Configuratie</option>
              <option value="platform">Platform</option>
            </select>
          </div>
        </div>
      </div>

      {/* Severity Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-red-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-700">{severityStats.high}</div>
              <div className="text-sm text-gray-600">Hoge Severity</div>
            </div>
            <span className="text-3xl text-red-600">❌</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-orange-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-700">{severityStats.medium}</div>
              <div className="text-sm text-gray-600">Gemiddelde Severity</div>
            </div>
            <span className="text-3xl text-orange-600">⚠️</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-green-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-700">{severityStats.low}</div>
              <div className="text-sm text-gray-600">Lage Severity</div>
            </div>
            <span className="text-3xl text-green-600">✅</span>
          </div>
        </div>
      </div>

      {/* Issues List */}
      {filteredIssues.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl text-gray-400 mx-auto mb-4">🗄️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Geen Resultaten</h3>
          <p className="text-gray-600">
            Geen database issues gevonden voor de huidige filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIssues.map(issue => {
            const categoryIcon = getCategoryIcon(issue.category);
            return (
              <div
                key={issue.id}
                className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${getCategoryColor(issue.category)} text-lg`}>
                        {categoryIcon}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900">{issue.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(issue.severity)}`}>
                        {getSeverityLabel(issue.severity)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(issue.category)}`}>
                        {getCategoryLabel(issue.category)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Symptoms */}
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-lg text-orange-600">⚠️</span>
                      Symptomen
                    </h5>
                    <ul className="space-y-1 ml-6">
                      {issue.symptoms.map((symptom, idx) => (
                        <li key={idx} className="text-sm text-gray-700 list-disc">
                          {symptom}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Diagnostic Steps */}
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-lg text-blue-600">🔍</span>
                      Diagnostische Stappen
                    </h5>
                    <ol className="space-y-1 ml-6 list-decimal">
                      {issue.diagnosticSteps.map((step, idx) => (
                        <li key={idx} className="text-sm text-gray-700">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Solutions */}
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-lg text-green-600">✅</span>
                      Oplossingen
                    </h5>
                    <ul className="space-y-1 ml-6">
                      {issue.solutions.map((solution, idx) => (
                        <li key={idx} className="text-sm text-gray-700 list-disc">
                          {solution}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Platform Specific Info */}
                  {issue.platformSpecific && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <span className="text-lg">☁️</span>
                        Platform-Specifieke Informatie
                      </h5>
                      <div className="space-y-2">
                        {issue.platformSpecific.supabase && (
                          <div>
                            <span className="text-xs font-semibold text-blue-700">
                              Supabase:
                            </span>
                            <p className="text-sm text-blue-800">
                              {issue.platformSpecific.supabase}
                            </p>
                          </div>
                        )}
                        {issue.platformSpecific.neondb && (
                          <div>
                            <span className="text-xs font-semibold text-blue-700">
                              NeonDB:
                            </span>
                            <p className="text-sm text-blue-800">
                              {issue.platformSpecific.neondb}
                            </p>
                          </div>
                        )}
                        {issue.platformSpecific.planetscale && (
                          <div>
                            <span className="text-xs font-semibold text-blue-700">
                              PlanetScale:
                            </span>
                            <p className="text-sm text-blue-800">
                              {issue.platformSpecific.planetscale}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Test Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleTestIssue(issue.id)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                    >
                      <span>💾</span>
                      Test Dit Probleem
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  // Only allow admin access
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-6xl text-red-600 mx-auto mb-4">🛡️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Toegang Geweigerd</h2>
            <p className="text-gray-600">
              Deze pagina is alleen toegankelijk voor administrators.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-2xl">
              ⚙️
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
              <p className="text-gray-600">Systeem configuratie en diagnostics</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200 -mb-px">
            {renderTabButton(
              'modules',
              '⚡',
              'Module Beheer'
            )}
            {renderTabButton(
              'analytics',
              '📊',
              'Systeem Analytics'
            )}
            {renderTabButton(
              'diagnostics',
              '🗄️',
              'Database Diagnostics'
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {activeTab === 'modules' && renderModuleBeheerTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
        {activeTab === 'diagnostics' && renderDiagnosticsTab()}
      </div>
    </div>
  );
};

// Helper function for module descriptions
function getModuleDescription(moduleId: string): string {
  const descriptions: Record<string, string> = {
    Dashboard: 'Overzicht van alle belangrijke metrics en snelle toegang tot modules',
    Inventory: 'Beheer voorraad, producten, artikelen, diensten en bundles',
    POS: 'Point of Sale systeem voor verkoop en kassa transacties',
    WorkOrders: 'Beheer werk orders, projecten en taken met Kanban board',
    Accounting: 'Boekhouding, facturen, offertes en financiële administratie',
    CRM: 'Customer Relationship Management - klantenbeheer en relaties',
    HRM: 'Human Resources Management - personeelsbeheer en planning',
    Planning: 'Agenda, afspraken en resource planning',
    Reports: 'Rapportages, analyses en exports van bedrijfsdata',
    Webshop: 'E-commerce integratie en online shop beheer',
    Admin: 'Systeem instellingen, gebruikersbeheer en configuratie'
  };
  return descriptions[moduleId] || 'Geen beschrijving beschikbaar';
}

export default AdminSettingsPage;
