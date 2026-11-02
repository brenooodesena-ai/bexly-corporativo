import { useState } from 'react';
import { FunnelBuilder } from '../components/FunnelBuilder';
import { Plus, GitMerge, MousePointer2, PieChart, ArrowRight, Pencil, X, Check } from 'lucide-react';

interface FunnelItem {
    id: number | string;
    name: string;
    steps: number;
    leads: number;
    cvr: string;
    status: string;
}

const Funnels = () => {
    const [funnels, setFunnels] = useState<FunnelItem[]>(() => {
        const saved = localStorage.getItem('bexly_funnels');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Erro ao carregar funis:', e);
            }
        }
        return [
            { id: 1, name: 'Lançamento Mentor AI', steps: 4, leads: 1240, cvr: '12.5%', status: 'Active' },
            { id: 2, name: 'Upsell Black Friday', steps: 3, leads: 850, cvr: '8.2%', status: 'Inactive' },
        ];
    });

    const [editingFunnel, setEditingFunnel] = useState<FunnelItem | { id: string; name: string; steps: number; leads: number; cvr: string; status: string } | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newFunnelName, setNewFunnelName] = useState('');
    const [renamingFunnelId, setRenamingFunnelId] = useState<number | string | null>(null);
    const [renameText, setRenameText] = useState('');

    const handleOpenCreateModal = () => {
        setNewFunnelName('');
        setIsCreateModalOpen(true);
    };

    const handleConfirmCreate = () => {
        const finalName = newFunnelName.trim() || 'Novo Funil de Vendas';
        setIsCreateModalOpen(false);
        setEditingFunnel({ id: 'new', name: finalName, steps: 0, leads: 0, cvr: '0%', status: 'Active' });
    };

    const handleSaveFunnel = (steps: any[], updatedName?: string) => {
        const finalName = (updatedName || editingFunnel?.name || 'Novo Funil de Vendas').trim();
        let updatedFunnels: FunnelItem[];
        if (editingFunnel?.id === 'new') {
            const newFunnel: FunnelItem = {
                id: Date.now(),
                name: finalName,
                steps: steps.length,
                leads: 0,
                cvr: '0%',
                status: 'Active'
            };
            updatedFunnels = [newFunnel, ...funnels];
        } else {
            updatedFunnels = funnels.map((f: FunnelItem) => f.id === editingFunnel?.id ? { ...f, name: finalName, steps: steps.length } : f);
        }
        setFunnels(updatedFunnels);
        localStorage.setItem('bexly_funnels', JSON.stringify(updatedFunnels));
        setEditingFunnel(null);
    };

    const handleStartRename = (funnel: FunnelItem) => {
        setRenamingFunnelId(funnel.id);
        setRenameText(funnel.name);
    };

    const handleSaveRename = (id: number | string) => {
        if (!renameText.trim()) return;
        const updated = funnels.map((f: FunnelItem) => f.id === id ? { ...f, name: renameText.trim() } : f);
        setFunnels(updated);
        localStorage.setItem('bexly_funnels', JSON.stringify(updated));
        setRenamingFunnelId(null);
    };

    if (editingFunnel) {
        return (
            <FunnelBuilder
                funnelName={editingFunnel.name}
                onSave={handleSaveFunnel}
                onBack={() => setEditingFunnel(null)}
            />
        );
    }

    return (
        <div style={{ color: 'var(--text-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>Meus Funis</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Estruture jornadas de compra irresistíveis manualmente.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={handleOpenCreateModal}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', cursor: 'pointer' }}
                    >
                        <Plus size={20} />
                        Criar Novo Funil
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                {funnels.map(funnel => (
                    <div key={funnel.id} className="card" style={{ padding: '24px', border: '1px solid var(--border-color)', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div style={{ padding: '10px', backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', color: '#8b5cf6' }}>
                                <GitMerge size={24} />
                            </div>
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: funnel.status === 'Active' ? '#22c55e' : 'var(--text-gray)',
                                padding: '4px 12px',
                                backgroundColor: funnel.status === 'Active' ? 'rgba(34, 197, 94, 0.1)' : 'var(--nav-hover)',
                                borderRadius: '20px'
                            }}>
                                {funnel.status === 'Active' ? 'ATIVO' : 'PAUSADO'}
                            </span>
                        </div>

                        {/* Nome do Funil com Edição Direta */}
                        {renamingFunnelId === funnel.id ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <input
                                    type="text"
                                    value={renameText}
                                    onChange={(e) => setRenameText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveRename(funnel.id);
                                        if (e.key === 'Escape') setRenamingFunnelId(null);
                                    }}
                                    autoFocus
                                    style={{
                                        fontSize: '1.15rem',
                                        fontWeight: 600,
                                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                        border: '1px solid var(--primary-blue)',
                                        borderRadius: '8px',
                                        padding: '6px 10px',
                                        color: 'white',
                                        outline: 'none',
                                        flex: 1
                                    }}
                                />
                                <button
                                    onClick={() => handleSaveRename(funnel.id)}
                                    className="btn btn-primary"
                                    style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    title="Confirmar alteração"
                                >
                                    <Check size={14} />
                                </button>
                                <button
                                    onClick={() => setRenamingFunnelId(null)}
                                    className="btn btn-secondary"
                                    style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                                    title="Cancelar"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '8px' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, wordBreak: 'break-word' }}>{funnel.name}</h3>
                                <button
                                    onClick={() => handleStartRename(funnel)}
                                    title="Alterar nome do funil"
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-gray)',
                                        cursor: 'pointer',
                                        padding: '6px',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        transition: 'all 0.2s',
                                        flexShrink: 0
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.color = 'var(--primary-blue)';
                                        e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.color = 'var(--text-gray)';
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <Pencil size={15} />
                                </button>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', textTransform: 'uppercase', letterSpacing: '1px' }}>Leads</p>
                                <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{funnel.leads}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', textTransform: 'uppercase', letterSpacing: '1px' }}>CVR</p>
                                <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary-blue)' }}>{funnel.cvr}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', textTransform: 'uppercase', letterSpacing: '1px' }}>Passos</p>
                                <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{funnel.steps}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--nav-hover)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MousePointer2 size={12} /></div>
                                <ArrowRight size={14} style={{ margin: '0 4px', color: 'rgba(255, 255, 255, 0.2)' }} />
                                <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><GitMerge size={12} /></div>
                                <ArrowRight size={14} style={{ margin: '0 4px', color: 'rgba(255, 255, 255, 0.2)' }} />
                                <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PieChart size={12} /></div>
                            </div>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Visualizar fluxo...</span>
                        </div>

                        <button
                            onClick={() => setEditingFunnel(funnel)}
                            className="btn btn-secondary"
                            style={{ width: '100%', cursor: 'pointer' }}
                        >
                            Editar Funil
                        </button>
                    </div>
                ))}

                <div
                    onClick={handleOpenCreateModal}
                    style={{
                        border: '2px dashed rgba(255, 255, 255, 0.1)',
                        borderRadius: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-blue)'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                >
                    <Plus size={32} style={{ color: 'var(--text-gray)', marginBottom: '12px', opacity: 0.5 }} />
                    <p style={{ color: 'var(--text-gray)', fontWeight: 500 }}>Criar Novo Funil</p>
                </div>
            </div>

            {/* Modal de Criação de Novo Funil com Definição de Nome */}
            {isCreateModalOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    padding: '16px'
                }}>
                    <div style={{
                        backgroundColor: '#0c101d',
                        border: '1px solid var(--border-color)',
                        borderRadius: '20px',
                        padding: '28px',
                        width: '100%',
                        maxWidth: '480px',
                        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ padding: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', color: 'var(--primary-blue)' }}>
                                    <GitMerge size={20} />
                                </div>
                                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'white' }}>Criar Novo Funil</h2>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer', padding: '4px' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
                            Dê um nome ao seu funil de vendas para começar a estruturar as etapas. Você também poderá alterar esse nome a qualquer momento.
                        </p>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleConfirmCreate();
                        }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-gray)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                                Nome do Funil de Vendas
                            </label>
                            <input
                                type="text"
                                value={newFunnelName}
                                onChange={(e) => setNewFunnelName(e.target.value)}
                                placeholder="Ex: Lançamento Mentor AI, Funil Perpétuo..."
                                autoFocus
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    backgroundColor: 'var(--sidebar-bg)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    marginBottom: '24px',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--primary-blue)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="btn btn-secondary"
                                    style={{ padding: '10px 20px', cursor: 'pointer' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                >
                                    <Plus size={18} />
                                    Criar Funil
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Funnels;
