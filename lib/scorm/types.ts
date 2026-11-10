// Standard SCORM 1.2 API Interface
export interface Scorm12API {
  LMSInitialize: (param: string) => string;
  LMSFinish: (param: string) => string;
  LMSGetValue: (element: string) => string;
  LMSSetValue: (element: string, value: string) => string;
  LMSCommit: (param: string) => string;
  LMSGetLastError: () => string;
  LMSGetErrorString: (errorCode: string) => string;
  LMSGetDiagnostic: (errorCode: string) => string;
}

// Standard SCORM 2004 3rd/4th Edition API Interface
export interface Scorm2004API {
  Initialize: (param: string) => string;
  Terminate: (param: string) => string;
  GetValue: (element: string) => string;
  SetValue: (element: string, value: string) => string;
  Commit: (param: string) => string;
  GetLastError: () => string;
  GetErrorString: (errorCode: string) => string;
  GetDiagnostic: (errorCode: string) => string;
}

// Extend Window with SCORM Runtime Adapters
declare global {
  interface Window {
    API?: Scorm12API;
    API_1484_11?: Scorm2004API;
  }
}

// xAPI (Tin Can) Specification Interfaces
export interface XApiActor {
  objectType?: 'Agent' | 'Group';
  name: string;
  mbox?: string;
  account?: {
    homePage: string;
    name: string;
  };
}

export interface XApiVerb {
  id: string;
  display: Record<string, string>;
}

export interface XApiObject {
  objectType?: 'Activity' | 'Agent' | 'StatementRef' | 'SubStatement';
  id: string;
  definition?: {
    name?: Record<string, string>;
    description?: Record<string, string>;
    type?: string;
  };
}

export interface XApiResult {
  score?: {
    scaled?: number;
    raw?: number;
    min?: number;
    max?: number;
  };
  success?: boolean;
  completion?: boolean;
  response?: string;
  duration?: string;
}

export interface XApiContext {
  registration?: string;
  instructor?: XApiActor;
  team?: XApiActor;
  contextActivities?: {
    parent?: XApiObject[];
    grouping?: XApiObject[];
    category?: XApiObject[];
    other?: XApiObject[];
  };
  extensions?: Record<string, unknown>;
}

export interface XApiStatementPayload {
  enrollmentId: string;
  actor: XApiActor;
  verb: XApiVerb;
  object: XApiObject;
  result?: XApiResult;
  context?: XApiContext;
  timestamp?: string;
  cmiSnapshot?: Record<string, string>;
}
