import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

export const dynamic = 'force-dynamic';

const SUBJECTS = ["Math", "Science", "Language Arts", "History", "Foreign Language", "Art", "Music", "PE", "Other"];
const GRADE_LEVELS = ["All Grade Levels", "Pre-K", "K-2", "3-5", "6-8", "9-12"];
const FORMATS = ["Online", "Printable", "Physical Copy"];

async function addSuggestion(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    const subject = formData.get("subject") as string;
    if (!name || !subject) return;

    const session = await getServerSession();
    const email = session?.user?.email ?? "admin@admin.com";

    const { data: user } = await supabase
        .from("User")
        .select("id")
        .eq("email", email)
        .single();

    if (!user) return;

    const formats = FORMATS.filter(f => formData.get(`format_${f}`) === "on");
    const ratingVal = formData.get("rating") as string;

    await supabase.from("CurriculumSuggestion").insert([{
        name,
        subject,
        gradeLevel: (formData.get("gradeLevel") as string) || null,
        description: (formData.get("description") as string) || null,
        pros: (formData.get("pros") as string) || null,
        cons: (formData.get("cons") as string) || null,
        cost: (formData.get("cost") as string) || null,
        rating: ratingVal ? parseInt(ratingVal) : null,
        format: formats.length > 0 ? formats.join(", ") : null,
        website: (formData.get("website") as string) || null,
        authorId: user.id
    }]);

    revalidatePath("/curriculum");
}

async function addComment(formData: FormData) {
    "use server";

    const content = formData.get("content") as string;
    const suggestionId = formData.get("suggestionId") as string;

    if (!content || !suggestionId) return;

    const session = await getServerSession();
    const email = session?.user?.email ?? "admin@admin.com";

    const { data: user } = await supabase
        .from("User")
        .select("id")
        .eq("email", email)
        .single();

    if (!user) return;

    await supabase.from("CurriculumComment").insert([{
        content,
        suggestionId,
        authorId: user.id
    }]);

    revalidatePath("/curriculum");
}

function StarRating({ rating }: { rating: number | null }) {
    if (!rating) return null;
    return (
        <span style={{ fontSize: '1.1rem', letterSpacing: '2px' }}>
            {[1, 2, 3, 4, 5].map(i => (
                <span key={i} style={{ color: i <= rating ? '#f39c12' : '#ddd' }}>&#9733;</span>
            ))}
        </span>
    );
}

export default async function CurriculumPage() {
    const { data: rawSuggestions } = await supabase
        .from("CurriculumSuggestion")
        .select(`
            id, name, subject, gradeLevel, description, pros, cons, cost, rating, format, website, createdAt,
            author:User!authorId(id, name),
            comments:CurriculumComment(id, content, createdAt, author:User!authorId(id, name))
        `)
        .order('createdAt', { ascending: false });

    const suggestions = rawSuggestions as any[] || [];

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <h1 className="card-title" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Curriculum Suggestions</h1>

            {/* Add Suggestion Form */}
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <h2 style={{ margin: '0 0 1rem 0', color: 'var(--primary)' }}>Share a Curriculum</h2>
                <form action={addSuggestion} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                        <input type="text" name="name" className="input" placeholder="Curriculum Name *" required style={{ marginBottom: 0 }} />
                        <select name="subject" className="input" required style={{ marginBottom: 0 }}>
                            <option value="">Select Subject *</option>
                            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select name="gradeLevel" className="input" style={{ marginBottom: 0 }}>
                            <option value="">Grade Level</option>
                            {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>

                    <textarea name="description" className="input" placeholder="Description" rows={2} style={{ marginBottom: 0, resize: 'vertical' }} />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <textarea name="pros" className="input" placeholder="Pros / What you liked" rows={2} style={{ marginBottom: 0, resize: 'vertical' }} />
                        <textarea name="cons" className="input" placeholder="Cons / Drawbacks" rows={2} style={{ marginBottom: 0, resize: 'vertical' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                        <input type="text" name="cost" className="input" placeholder="Cost (e.g. $150/year, Free)" style={{ marginBottom: 0 }} />
                        <input type="url" name="website" className="input" placeholder="Website URL" style={{ marginBottom: 0 }} />
                        <select name="rating" className="input" style={{ marginBottom: 0 }}>
                            <option value="">Rating</option>
                            <option value="5">&#9733;&#9733;&#9733;&#9733;&#9733; (5)</option>
                            <option value="4">&#9733;&#9733;&#9733;&#9733; (4)</option>
                            <option value="3">&#9733;&#9733;&#9733; (3)</option>
                            <option value="2">&#9733;&#9733; (2)</option>
                            <option value="1">&#9733; (1)</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Format:</span>
                        {FORMATS.map(f => (
                            <label key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                                <input type="checkbox" name={`format_${f}`} />
                                {f}
                            </label>
                        ))}
                    </div>

                    <button type="submit" className="btn" style={{ alignSelf: 'start' }}>Share Suggestion</button>
                </form>
            </div>

            {/* Suggestions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {suggestions.length === 0 && (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.1rem' }}>No curriculum suggestions yet. Be the first to share one!</p>
                )}
                {suggestions.map(suggestion => (
                    <div key={suggestion.id} className="glass-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div>
                                <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>{suggestion.name}</h2>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                                    <span style={{
                                        background: 'var(--primary)',
                                        color: 'white',
                                        padding: '3px 10px',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {suggestion.subject}
                                    </span>
                                    {suggestion.gradeLevel && (
                                        <span style={{
                                            background: '#6c5ce7',
                                            color: 'white',
                                            padding: '3px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {suggestion.gradeLevel}
                                        </span>
                                    )}
                                    {suggestion.format && suggestion.format.split(", ").map((f: string) => (
                                        <span key={f} style={{
                                            background: '#00b894',
                                            color: 'white',
                                            padding: '3px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {f}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <StarRating rating={suggestion.rating} />
                        </div>

                        <p style={{ margin: '0 0 0.25rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Suggested by {suggestion.author?.name ?? "Unknown"} &bull; {new Date(suggestion.createdAt).toLocaleDateString()}
                            {suggestion.cost && <> &bull; {suggestion.cost}</>}
                        </p>

                        {suggestion.description && (
                            <p style={{ margin: '0.75rem 0', lineHeight: 1.6 }}>{suggestion.description}</p>
                        )}

                        {(suggestion.pros || suggestion.cons) && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '0.75rem 0' }}>
                                {suggestion.pros && (
                                    <div style={{ background: 'rgba(0,184,148,0.1)', padding: '0.75rem', borderRadius: '8px' }}>
                                        <strong style={{ color: '#00b894' }}>Pros</strong>
                                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>{suggestion.pros}</p>
                                    </div>
                                )}
                                {suggestion.cons && (
                                    <div style={{ background: 'rgba(255,107,107,0.1)', padding: '0.75rem', borderRadius: '8px' }}>
                                        <strong style={{ color: '#FF6B6B' }}>Cons</strong>
                                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>{suggestion.cons}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {suggestion.website && (
                            <a href={suggestion.website} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '1rem' }}>
                                Visit Website
                            </a>
                        )}

                        {/* Comments Section */}
                        <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Comments ({suggestion.comments?.length ?? 0})</h3>
                            {(suggestion.comments || []).map((comment: any) => (
                                <div key={comment.id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                                    <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>
                                        {comment.author?.name ?? "Unknown"}{' '}
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'normal' }}>
                                            &bull; {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                    </p>
                                    <p style={{ margin: 0 }}>{comment.content}</p>
                                </div>
                            ))}
                            <form action={addComment} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                <input type="hidden" name="suggestionId" value={suggestion.id} />
                                <input type="text" name="content" className="input" placeholder="Share your thoughts..." style={{ marginBottom: 0, flex: 1 }} required />
                                <button type="submit" className="btn">Post</button>
                            </form>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
