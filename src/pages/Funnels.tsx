import { useState } from 'react';
import { FunnelBuilder } from '../components/FunnelBuilder';
import { Plus, GitMerge, MousePointer2, PieChart, ArrowRight } from 'lucide-react';

const Funnels = () => {
    const [funnels, setFunnels] = useState([
        { id: 1, name: 'Lançamento Mentor AI', steps: 4, leads: 1240, cvr: '12.5%', status: 'Active' },
        { id: 2, name: 'Upsell Black Friday', steps: 3, leads: 850, cvr: '8.2%', status: 'Inactive' },
    ]);
    const [editingFunnel, setEditingFunnel] = useState<any>(null);

    const handleCreateNew = () => {
        setEditingFunnel({ id: 'new', name: 'Novo Funil de Vendas', steps: 0, leads: 0, cvr: '0%', status: 'Active' });
    };

    const handleSaveFunnel = (steps: any[]) => {
        if (editingFunnel.id === 'new') {
            const newFunnel = {
                id: Date.now(),
                name: editingFunnel.name,
                steps: steps.length,
                leads: 0,
                cvr: '0%',
                status: 'Active'
            };
            setFunnels([newFunnel, ...funnels]);
        } else {
            setFunnels(funnels.map(f => f.id === editingFunnel.id ? { ...f, steps: steps.length } : f));
        }
        setEditingFunnel(null);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>Meus Funis</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Estruture jornadas de compra irresistíveis manualmente.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={handleCreateNew}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
                    >
                        <Plus size={20} />
                        Criar Novo Funil Pro
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

                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>{funnel.name}</h3>

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
                            style={{ width: '100%' }}
                        >
                            Editar Estrutura Pro
                        </button>
                    </div>
                ))}

                <div
                    onClick={handleCreateNew}
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
                    <p style={{ color: 'var(--text-gray)', fontWeight: 500 }}>Criar Novo Blueprint</p>
                </div>
            </div>
        </div>
    );
};

export default Funnels;
