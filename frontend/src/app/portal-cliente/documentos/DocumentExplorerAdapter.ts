import { ExplorerRecordInternal, ExplorerAdapter } from '@/components/ui/explorer';

export class DocumentExplorerAdapter implements ExplorerAdapter<any> {
    toExplorerRecord(doc: any): ExplorerRecordInternal {
        return {
            id: doc.id,
            title: doc.title,
            description: doc.description,
            subtitle: doc.file_name,
            category: {
                id: doc.category?.id || 0,
                code: doc.category?.code || 'GENERAL',
                name: doc.category?.name || 'General',
                badge: doc.category?.display?.badge,
                views: doc.category?.display?.views,
            },
            metadata: {
                fileSize: doc.file_size,
                createdAt: doc.created_at,
                fileUrl: doc.file_url
            },
            __raw: doc
        };
    }
}
