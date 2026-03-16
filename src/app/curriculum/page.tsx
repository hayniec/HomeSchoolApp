"use client";

import { useEffect, useState, useCallback } from "react";
import { GraduationCap, Plus, X } from "lucide-react";

const SUBJECTS = ["Math", "Science", "Language Arts", "History", "Foreign Language", "Art", "Music", "PE", "Other"];
const GRADE_LEVELS = ["All Grade Levels", "Pre-K", "K-2", "3-5", "6-8", "9-12"];
const FORMATS = ["Online", "Printable", "Physical Copy"];
const COST_RANGES = ["Free", "Under $50", "$50-$150", "$150-$300", "Over $300"];

interface Suggestion {
    id: string;
    name: string;
    subject: string;
    gradeLevel: string | null;
    description: string | null;
    pros: string | null;
    cons: string | null;
    cost: string | null;
    rating: number | null;
    format: string | null;
    website: string | null;
    createdAt: string;
    author: { id: string; name: string } | null;
    comments: { id: string; content: string | null; rating: number | null; createdAt: string; author: { id: string; name: string } | null }[];
}

function StarRating({ rating, size = "1.6rem" }: { rating: number | null; size?: string }) {
    if (!rating) return null;
    return (
        <span style={{ fontSize: size, letterSpacing: '3px' }}>
            {[1, 2, 3, 4, 5].map(i => (
                <span key={i} style={{ color: i <= rating ? '#f39c12' : '#ddd' }}>&#9733;</span>
            ))}
        </span>
    );
}

function ClickableStarRating({ value, onChange, size = "1.4rem" }: { value: number; onChange: (v: number) => void; size?: string }) {
    return (
        <span style={{ fontSize: size, letterSpacing: '2px', cursor: 'pointer' }}>
            {[1, 2, 3, 4, 5].map(i => (
                <span key={i} onClick={() => onChange(value === i ? 0 : i)} style={{ color: i <= value ? '#f39c12' : '#ddd' }}>&#9733;</span>
            ))}
        </span>
    );
}

function CommunityRating({ suggestion }: { suggestion: Suggestion }) {
    const communityRatings = (suggestion.comments || []).filter(c => c.rating != null).map(c => c.rating as number);
    const avgRating = communityRatings.length > 0 ? communityRatings.reduce((a, b) => a + b, 0) / communityRatings.length : null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
            {suggestion.rating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Author:</span>
                    <StarRating rating={suggestion.rating} />
                </div>
            )}
            {avgRating !== null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Community: {avgRating.toFixed(1)}</span>
                    <StarRating rating={Math.round(avgRating)} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({communityRatings.length})</span>
                </div>
            )}
        </div>
    );
}

function costMatchesRange(cost: string | null, range: string): boolean {
    if (!cost) return false;
    const lower = cost.toLowerCase();
    if (range === "Free") return lower.includes("free") || lower.includes("$0");
    const numbers = cost.match(/[\d,.]+/g);
    if (!numbers) return false;
    const amount = parseFloat(numbers[0].replace(/,/g, ''));
    if (isNaN(amount)) return false;
    switch (range) {
        case "Under $50": return amount > 0 && amount < 50;
        case "$50-$150": return amount >= 50 && amount <= 150;
        case "$150-$300": return amount > 150 && amount <= 300;
        case "Over $300": return amount > 300;
        default: return false;
    }
}

export default function CurriculumPage() {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
    const [commentRatings, setCommentRatings] = useState<Record<string, number>>({});

    // Filters
    const [filterSubject, setFilterSubject] = useState("");
    const [filterGrade, setFilterGrade] = useState("");
    const [filterRating, setFilterRating] = useState("");
    const [filterCost, setFilterCost] = useState("");
    const [filterFormat, setFilterFormat] = useState("");

    const fetchSuggestions = useCallback(async () => {
        try {
            const res = await fetch("/api/curriculum");
            const data = await res.json();
            setSuggestions(data.suggestions || []);
        } catch (err) {
            console.error("Failed to fetch curriculum suggestions:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSuggestions(); }, [fetchSuggestions]);

    const handleSubmitSuggestion = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const formats = FORMATS.filter(f => formData.get(`format_${f}`) === "on");

        const body = {
            name: formData.get("name"),
            subject: formData.get("subject"),
            gradeLevel: formData.get("gradeLevel") || null,
            description: formData.get("description") || null,
            pros: formData.get("pros") || null,
            cons: formData.get("cons") || null,
            cost: formData.get("cost") || null,
            rating: formData.get("rating") || null,
            format: formats.length > 0 ? formats.join(", ") : null,
            website: formData.get("website") || null,
        };

        await fetch("/api/curriculum", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        form.reset();
        setShowModal(false);
        fetchSuggestions();
    };

    const handlePostComment = async (suggestionId: string) => {
        const content = commentTexts[suggestionId]?.trim() || null;
        const rating = commentRatings[suggestionId] || null;
        if (!content && !rating) return;

        await fetch("/api/curriculum/comments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content, suggestionId, rating }),
        });

        setCommentTexts(prev => ({ ...prev, [suggestionId]: "" }));
        setCommentRatings(prev => ({ ...prev, [suggestionId]: 0 }));
        fetchSuggestions();
    };

    const filtered = suggestions.filter(s => {
        if (filterSubject && s.subject !== filterSubject) return false;
        if (filterGrade && s.gradeLevel !== filterGrade) return false;
        if (filterRating && (s.rating === null || s.rating < parseInt(filterRating))) return false;
        if (filterCost && !costMatchesRange(s.cost, filterCost)) return false;
        if (filterFormat && (!s.format || !s.format.includes(filterFormat))) return false;
        return true;
    });

    const hasActiveFilters = filterSubject || filterGrade || filterRating || filterCost || filterFormat;

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <h1 className="card-title" style={{ fontSize: '2.5rem', margin: 0 }}>Curriculum Suggestions</h1>
                <button className="btn" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> Suggest a Curriculum
                </button>
            </div>

            {/* Filters */}
            <div className="glass-card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>Filter by:</span>
                    <select className="input" value={filterSubject} onChange={e => setFilterSubject(e.target.value)} style={{ marginBottom: 0, minWidth: '140px', flex: '1 1 140px' }}>
                        <option value="">All Subjects</option>
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select className="input" value={filterGrade} onChange={e => setFilterGrade(e.target.value)} style={{ marginBottom: 0, minWidth: '140px', flex: '1 1 140px' }}>
                        <option value="">All Grades</option>
                        {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <select className="input" value={filterRating} onChange={e => setFilterRating(e.target.value)} style={{ marginBottom: 0, minWidth: '140px', flex: '1 1 140px' }}>
                        <option value="">Any Rating</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4+ Stars</option>
                        <option value="3">3+ Stars</option>
                        <option value="2">2+ Stars</option>
                        <option value="1">1+ Stars</option>
                    </select>
                    <select className="input" value={filterCost} onChange={e => setFilterCost(e.target.value)} style={{ marginBottom: 0, minWidth: '140px', flex: '1 1 140px' }}>
                        <option value="">Any Cost</option>
                        {COST_RANGES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select className="input" value={filterFormat} onChange={e => setFilterFormat(e.target.value)} style={{ marginBottom: 0, minWidth: '140px', flex: '1 1 140px' }}>
                        <option value="">Any Format</option>
                        {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    {hasActiveFilters && (
                        <button className="btn btn-outline" onClick={() => { setFilterSubject(""); setFilterGrade(""); setFilterRating(""); setFilterCost(""); setFilterFormat(""); }} style={{ whiteSpace: 'nowrap' }}>
                            Clear Filters
                        </button>
                    )}
                </div>
                {hasActiveFilters && (
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Showing {filtered.length} of {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}
                    </p>
                )}
            </div>

            {/* Suggestions List */}
            {loading ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading suggestions...</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {filtered.length === 0 && (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                            {hasActiveFilters ? "No suggestions match your filters." : "No curriculum suggestions yet. Be the first to share one!"}
                        </p>
                    )}
                    {filtered.map(suggestion => (
                        <div key={suggestion.id} className="glass-card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div>
                                    <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>{suggestion.name}</h2>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                                        <span style={{ background: 'var(--primary)', color: 'white', padding: '3px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                            {suggestion.subject}
                                        </span>
                                        {suggestion.gradeLevel && (
                                            <span style={{ background: '#6c5ce7', color: 'white', padding: '3px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                {suggestion.gradeLevel}
                                            </span>
                                        )}
                                        {suggestion.format && suggestion.format.split(", ").map((f: string) => (
                                            <span key={f} style={{ background: '#00b894', color: 'white', padding: '3px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                {f}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <CommunityRating suggestion={suggestion} />
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
                                {(suggestion.comments || []).map((comment) => (
                                    <div key={comment.id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>
                                                {comment.author?.name ?? "Unknown"}{' '}
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'normal' }}>
                                                    &bull; {new Date(comment.createdAt).toLocaleDateString()}
                                                </span>
                                            </p>
                                            {comment.rating && <StarRating rating={comment.rating} size="1rem" />}
                                        </div>
                                        {comment.content && <p style={{ margin: 0 }}>{comment.content}</p>}
                                    </div>
                                ))}
                                <div style={{ marginTop: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Your rating:</span>
                                        <ClickableStarRating
                                            value={commentRatings[suggestion.id] || 0}
                                            onChange={v => setCommentRatings(prev => ({ ...prev, [suggestion.id]: v }))}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Share your thoughts... (optional)"
                                            style={{ marginBottom: 0, flex: 1 }}
                                            value={commentTexts[suggestion.id] || ""}
                                            onChange={e => setCommentTexts(prev => ({ ...prev, [suggestion.id]: e.target.value }))}
                                            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handlePostComment(suggestion.id); } }}
                                        />
                                        <button className="btn" onClick={() => handlePostComment(suggestion.id)}>Post</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={() => setShowModal(false)}>
                    <div className="glass-card" style={{ padding: '2rem', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <X size={22} />
                        </button>
                        <h2 style={{ margin: '0 0 1.25rem 0', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <GraduationCap size={24} /> Suggest a Curriculum
                        </h2>
                        <form onSubmit={handleSubmitSuggestion} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <input type="text" name="name" className="input" placeholder="Curriculum Name *" required style={{ marginBottom: 0 }} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <input type="text" name="cost" className="input" placeholder="Cost (e.g. $150/year, Free)" style={{ marginBottom: 0 }} />
                                <input type="url" name="website" className="input" placeholder="Website URL" style={{ marginBottom: 0 }} />
                            </div>
                            <select name="rating" className="input" style={{ marginBottom: 0 }}>
                                <option value="">Rating</option>
                                <option value="5">&#9733;&#9733;&#9733;&#9733;&#9733; (5)</option>
                                <option value="4">&#9733;&#9733;&#9733;&#9733; (4)</option>
                                <option value="3">&#9733;&#9733;&#9733; (3)</option>
                                <option value="2">&#9733;&#9733; (2)</option>
                                <option value="1">&#9733; (1)</option>
                            </select>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Format:</span>
                                {FORMATS.map(f => (
                                    <label key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                                        <input type="checkbox" name={`format_${f}`} />
                                        {f}
                                    </label>
                                ))}
                            </div>
                            <button type="submit" className="btn" style={{ alignSelf: 'start', marginTop: '0.5rem' }}>Share Suggestion</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
