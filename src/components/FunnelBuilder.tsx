import { useState } from 'react';
import {
    Plus,
    MousePointer2,
    Layout,
    ShoppingCart,
    Mail,
    CheckCircle2,
    Trash2,
    Save,
    ChevronLeft,
    Settings2,
    Zap,
    Search,
    Clock,
    Split
} from 'lucide-react';
import { Button, Card } from './UI';

interface FunnelStep {
    id: string;
    type: 'capture' | 'sales' | 'checkout' | 'email' | 'thanks';
    title: string;
    description: string;
    config?: {
        delay?: string;
        condition?: string;
    };
}

interface FunnelBuilderProps {
    funnelName: string;
    onSave: (steps: FunnelStep[]) => void;
    onBack: () => void;
}

const STEP_TYPES = {
    capture: { icon: MousePointer2, color: '#3b82f6', label: 'Página de Captura', desc: 'Capture leads com formulários.' },
    sales: { icon: Layout, color: '#8b5cf6', label: 'Página de Vendas', desc: 'Apresente sua oferta principal.' },
    checkout: { icon: ShoppingCart, color: '#f59e0b', label: 'Checkout', desc: 'Finalize a venda com segurança.' },
    email: { icon: Mail, color: '#10b981', label: 'Automação de E-mail', desc: 'Nutrição automática de leads.' },
    thanks: { icon: CheckCircle2, color: '#22c55e', label: 'Página de Obrigado', desc: 'Confirmação e próximos passos.' },
};

export const FunnelBuilder = ({ funnelName, onSave, onBack }: FunnelBuilderProps) => {
    const [steps, setSteps] = useState<FunnelStep[]>([
        { id: '1', type: 'capture', title: 'Página de Captura - Lead Magnet', description: 'Otimizada para conversão de e-mails.' },
    ]);
    const [searchTerm, setSearchTerm] = useState('');

    const addStep = (type: keyof typeof STEP_TYPES) => {
        const newStep: FunnelStep = {
            id: Date.now().toString(),
            type,
            title: STEP_TYPES[type].label,
            description: STEP_TYPES[type].desc
        };
        setSteps([...steps, newStep]);
        setSearchTerm('');
    };

    const removeStep = (id: string) => {
        setSteps(steps.filter(s => s.id !== id));
    };

    const filteredStepTypes = (Object.keys(STEP_TYPES) as Array<keyof typeof STEP_TYPES>).filter(type =>
        STEP_TYPES[type].label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ChevronLeft size={20} /> Voltar
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>Blueprint Pro: {funnelName}</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Arquitete sua jornada de vendas manualmente com precisão técnica.</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button variant="outline" onClick={onBack}>Descartar</Button>
                    <Button onClick={() => onSave(steps)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Save size={18} /> Salvar Estrutura
                    </Button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', flex: 1, overflow: 'hidden' }}>
                {/* Sidebar - Pro Library */}
                <div style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.4)',
                    padding: '24px',
                    borderRadius: '24px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    overflowY: 'auto'
                }}>
                    <div style={{ position: 'relative', marginBottom: '8px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray)' }} />
                        <input
                            placeholder="Buscar componente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 40px',
                                borderRadius: '12px',
                                backgroundColor: 'var(--sidebar-bg)',
                                border: '1px solid var(--border-color)',
                                color: 'white',
                                fontSize: '0.9rem',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary-blue)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                        />
                    </div>

                    <h3 style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-gray)', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '8px' }}>Componentes Disponíveis</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {filteredStepTypes.map(type => {
                            const config = STEP_TYPES[type];
                            return (
                                <div
                                    key={type}
                                    onClick={() => addStep(type)}
                                    style={{
                                        padding: '14px',
                                        borderRadius: '16px',
                                        border: '1px solid var(--border-color)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        backgroundColor: 'rgba(30, 41, 59, 0.2)'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--primary-blue)';
                                        e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.5)';
                                        e.currentTarget.style.transform = 'translateX(4px)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--border-color)';
                                        e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.2)';
                                        e.currentTarget.style.transform = 'translateX(0)';
                                    }}
                                >
                                    <div style={{ padding: '8px', backgroundColor: `${config.color}15`, borderRadius: '10px', color: config.color, border: `1px solid ${config.color}30` }}>
                                        <config.icon size={20} />
                                    </div>
                                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)' }}>{config.label}</span>
                                    <Plus size={16} style={{ marginLeft: 'auto', color: 'var(--text-gray)', opacity: 0.5 }} />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Canvas - The Blueprint Canvas */}
                <div style={{
                    flex: 1,
                    backgroundColor: 'rgba(2, 6, 23, 0.4)',
                    borderRadius: '24px',
                    border: '1px solid var(--border-color)',
                    padding: '60px 40px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    overflowY: 'auto',
                    backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}>
                    {steps.length === 0 ? (
                        <div style={{ textAlign: 'center', marginTop: '100px' }}>
                            <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px dashed var(--border-color)' }}>
                                <Split size={32} style={{ color: 'var(--text-gray)', opacity: 0.3 }} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '8px' }}>Inicie seu Blueprint</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Selecione um componente na lateral para começar a arquitetar.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '0' }}>
                            {steps.map((step, index) => {
                                const config = STEP_TYPES[step.type];
                                return (
                                    <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                                        <Card style={{
                                            width: '500px',
                                            padding: '24px',
                                            position: 'relative',
                                            border: '1px solid var(--border-color)',
                                            backgroundColor: 'rgba(15, 23, 42, 0.8)',
                                            backdropFilter: 'blur(10px)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '20px',
                                            boxShadow: '0 20px 40px -20px rgba(0,0,0,0.5)',
                                            zIndex: 2
                                        }}>
                                            <div style={{
                                                width: '56px',
                                                height: '56px',
                                                backgroundColor: `${config.color}10`,
                                                borderRadius: '16px',
                                                color: config.color,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: `1px solid ${config.color}20`
                                            }}>
                                                <config.icon size={28} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <input
                                                    value={step.title}
                                                    onChange={(e) => {
                                                        const newSteps = [...steps];
                                                        newSteps[index].title = e.target.value;
                                                        setSteps(newSteps);
                                                    }}
                                                    style={{ border: 'none', background: 'none', color: 'white', fontWeight: 600, fontSize: '1.1rem', width: '100%', outline: 'none' }}
                                                />
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginTop: '4px' }}>{step.description}</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button title="Configurações" style={{ padding: '10px', background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer', borderRadius: '10px', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}><Settings2 size={18} /></button>
                                                <button title="Atraso (Delay)" style={{ padding: '10px', background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer', borderRadius: '10px', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}><Clock size={18} /></button>
                                                <button
                                                    title="Remover"
                                                    onClick={() => removeStep(step.id)}
                                                    style={{ padding: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', borderRadius: '10px', transition: 'all 0.2s' }}
                                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </Card>

                                        {index < steps.length - 1 && (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '60px', width: '2px', background: 'linear-gradient(to bottom, var(--primary-blue), rgba(59, 130, 246, 0.1))', margin: '0', position: 'relative' }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: '0',
                                                    width: '12px',
                                                    height: '12px',
                                                    backgroundColor: 'var(--primary-blue)',
                                                    borderRadius: '50%',
                                                    boxShadow: '0 0 15px var(--primary-blue)',
                                                    transform: 'translateY(50%)'
                                                }} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            <div style={{
                                marginTop: '40px',
                                padding: '20px',
                                border: '1px dashed var(--border-color)',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                color: 'var(--text-gray)',
                                fontSize: '0.875rem'
                            }}>
                                <Zap size={16} /> Use a barra lateral para adicionar novas etapas ao seu fluxo.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
