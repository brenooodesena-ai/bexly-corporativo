import { Plus, Layout as LayoutIcon, MoreVertical, ExternalLink, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { AIModal } from '../components/AIModal';

const Pages = () => {
    const [pages, setPages] = useState([
        { id: 1, name: 'Página Inicial', status: 'Published', visits: '1.2k', conversion: '3.2%', updated: 'há 2 horas' },
        { id: 2, name: 'Landing Page - Black Friday', status: 'Draft', visits: '-', conversion: '-', updated: 'Ontem' },
        { id: 3, name: 'Obrigado - Checkout', status: 'Published', visits: '450', conversion: '12%', updated: 'há 3 dias' },
    ]);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    const handleAIGenerate = (prompt: string) => {
        const newPage = {
            id: Date.now(),
            name: `Página: ${prompt.length > 20 ? prompt.substring(0, 20) + '...' : prompt}`,
            status: 'Draft',
            visits: '0',
            conversion: '0%',
            updated: 'Agora mesmo'
        };
        setPages([newPage, ...pages]);
    };

    return (
        <div style={{ color: 'var(--text-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>Minhas Páginas</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Gerencie e crie suas páginas de alta conversão.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setIsAIModalOpen(true)}
                        className="btn btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--primary-blue)', color: 'var(--primary-blue)' }}
                    >
                        <Sparkles size={18} />
                        Gerar com IA
                    </button>
                    <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={20} />
                        Criar Nova Página
                    </button>
                </div>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: 'var(--nav-hover)', borderBottom: '1px solid var(--border-color)' }}>
                        <tr>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>NOME DA PÁGINA</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>STATUS</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>VISITAS</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>CONVERSÃO</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>ATUALIZADO</th>
                            <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {pages.map((page) => (
                            <tr key={page.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ padding: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: 'var(--primary-blue)' }}>
                                            <LayoutIcon size={18} />
                                        </div>
                                        <span style={{ fontWeight: 500 }}>{page.name}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        backgroundColor: page.status === 'Published' ? 'rgba(34, 197, 94, 0.1)' : 'var(--nav-hover)',
                                        color: page.status === 'Published' ? '#22c55e' : 'var(--text-secondary)'
                                    }}>
                                        {page.status === 'Published' ? 'Publicada' : 'Rascunho'}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px', color: 'var(--text-primary)' }}>{page.visits}</td>
                                <td style={{ padding: '16px 24px', color: 'var(--text-primary)' }}>{page.conversion}</td>
                                <td style={{ padding: '16px 24px', color: 'var(--text-gray)', fontSize: '0.875rem' }}>{page.updated}</td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button style={{ background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer' }}><ExternalLink size={18} /></button>
                                        <button style={{ background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer' }}><MoreVertical size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <AIModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                title="Gerador de Páginas IA"
                description="Descreva sua página e nossa inteligência criará o layout e a copy completa."
                placeholder="Ex: Crie uma landing page moderna para uma agência de marketing digital focada em empresas enterprise."
                onGenerate={handleAIGenerate}
            />
        </div>
    );
};

export default Pages;
