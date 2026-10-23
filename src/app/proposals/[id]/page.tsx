import React from 'react';
// { } хаалт нэмэгдсэн:
import { ProposalDetailView } from '@/components/proposals/ProposalDetailView';

export default async function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <ProposalDetailView id={resolvedParams.id} />;
}
