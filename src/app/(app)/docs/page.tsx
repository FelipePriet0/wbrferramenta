import { redirect } from 'next/navigation';
import { DOC_NAV } from '@/content/docs';

export default function DocsIndexPage() {
  redirect(`/docs/${DOC_NAV[0].slug}`);
}
