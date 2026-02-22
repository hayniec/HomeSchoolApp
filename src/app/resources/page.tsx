import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export default async function ResourcesPage() {
    const { data: rawResources } = await supabase
        .from("Resource")
        .select(`
            *,
            uploadedBy:User!uploadedById(id, name)
        `)
        .order('createdAt', { ascending: false });

    const resources = rawResources as any[] || [];

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <h1 className="card-title" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Learning Resources</h1>

            <div className="grid">
                {resources.map((res, idx) => (
                    <div key={idx} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.5rem' }}>
                        <span style={{
                            background: 'var(--primary)',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            alignSelf: 'start',
                            fontWeight: 'bold'
                        }}>
                            {res.category}
                        </span>

                        <h3 style={{ margin: '0.5rem 0', color: 'var(--text-main)', fontSize: '1.3rem' }}>{res.title}</h3>
                        <p style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)' }}>{res.description}</p>

                        <a href={res.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ marginTop: 'auto', textAlign: 'center', textDecoration: 'none' }}>
                            View Resource
                        </a>

                        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                            Added by {res.uploadedBy.name}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                <button className="btn">Upload New Resource</button>
            </div>
        </div>
    );
}
