import { PrismaClient } from "@prisma/client";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function ForumPage() {
    const posts = await prisma.forumPost.findMany({
        include: {
            author: true,
            comments: {
                include: { author: true }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <h1 className="card-title" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Community Forum</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {posts.map(post => (
                    <div key={post.id} className="glass-card" style={{ padding: '1.5rem' }}>
                        <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>{post.title}</h2>
                        <p style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Posted by {post.author.name} • {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                        <p style={{ margin: '0 0 1.5rem 0', lineHeight: 1.6 }}>{post.content}</p>

                        <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Comments ({post.comments.length})</h3>
                            {post.comments.map(comment => (
                                <div key={comment.id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                                    <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>{comment.author.name}</p>
                                    <p style={{ margin: 0 }}>{comment.content}</p>
                                </div>
                            ))}
                            <input type="text" className="input" placeholder="Write a reply..." style={{ marginBottom: 0, marginTop: '0.5rem' }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
