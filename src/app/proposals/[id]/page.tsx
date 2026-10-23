import React from 'react';
import { ProposalDetailView } from '@/components/proposals/ProposalDetailView';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <ProposalDetailView id={resolvedParams.id} />;
}
