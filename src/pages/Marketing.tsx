import { Megaphone, Zap, Mail, MessageSquare, Plus, Clock, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { AIModal } from '../components/AIModal';

const Marketing = () => {
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [activities, setActivities] = useState([
        { id: 1, text: "Email 'Bem-vindo' enviado para 120 leads", time: "Há 15 minutos" },
        { id: 2, text: "Campanha de Retenção ativada", time: "Há 1 hora" },
    ]);

    const handleAIGenerate = (prompt: string) => {
        const newActivity = {
            id: Date.now(),
            text: `Copy Gerada via IA: ${prompt.substring(0, 30)}...`,
            time: "Agora mesmo"
        };
        setActivities([newActivity, ...activities]);
    };

    return (
        <div style={{ color: 'var(--text-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>Marketing & Automação</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Venda mais com automações inteligentes.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setIsAIModalOpen(true)}
                        className="btn btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--primary-blue)', color: 'var(--primary-blue)' }}
                    >
                        <Sparkles size={18} />
                        Gerar Copy com IA
                    </button>
                    <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={20} />
                        Nova Campanha
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignContent: 'start' }}>
                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ color: '#f59e0b', marginBottom: '16px' }}><Mail size={32} /></div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>Email Marketing</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>Crie sequências de emails altamente personalizadas.</p>
                        <button className="btn btn-secondary" style={{ width: '100%' }}>Configurar</button>
                    </div>

                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ color: '#3b82f6', marginBottom: '16px' }}><Zap size={32} /></div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>Automações</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>Gatilhos e ações automáticas baseadas em comportamento.</p>
                        <button className="btn btn-secondary" style={{ width: '100%' }}>Criar Workflow</button>
                    </div>

                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ color: '#10b981', marginBottom: '16px' }}><MessageSquare size={32} /></div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>WhatsApp CRM</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>Envios automáticos e chat direto no navegador.</p>
                        <button className="btn btn-secondary" style={{ width: '100%' }}>Conectar</button>
                    </div>

                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ color: '#ef4444', marginBottom: '16px' }}><Megaphone size={32} /></div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>Broadcasts</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>Envios em massa para toda sua base de uma vez.</p>
                        <button className="btn btn-secondary" style={{ width: '100%' }}>Programar</button>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px' }}>Atividades Recentes</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {activities.map(activity => (
                            <div key={activity.id} style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ minWidth: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-blue)', marginTop: '6px' }} />
                                <div>
                                    <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{activity.text}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-gray)', fontSize: '0.75rem' }}>
                                        <Clock size={12} />
                                        <span>{activity.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <AIModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                title="Escritor de Copy IA"
                description="Gere textos persuasivos para anúncios, e-mails ou páginas em segundos."
                placeholder="Ex: Escreva um e-mail de boas-vindas para clientes que acabaram de assinar o plano corporativo da Bexly."
                onGenerate={handleAIGenerate}
            />
        </div>
    );
};

export default Marketing;
