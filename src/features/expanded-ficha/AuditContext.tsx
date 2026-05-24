'use client';

import { createContext, useContext } from 'react';

const AuditContext = createContext<string | null>(null);

export function AuditProvider({
  applicantId,
  children,
}: {
  applicantId: string;
  children: React.ReactNode;
}) {
  return (
    <AuditContext.Provider value={applicantId}>
      {children}
    </AuditContext.Provider>
  );
}

export function useAuditApplicantId() {
  return useContext(AuditContext);
}

export function useAuditFlush() {
  return null;
}
