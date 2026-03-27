import { useState, useEffect } from 'react';
import { Sparkles, X, Wand2, Loader2, CheckCircle2 } from 'lucide-react';
import { Button, Card } from './UI';

interface AIModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    placeholder: string;
    onGenerate: (prompt: string) => void;
}

export const AIModal = ({ isOpen, onClose, title, description, placeholder, onGenerate }: AIModalProps) => {
    const [prompt, setPrompt] = useState('');
    const [status, setStatus] = useState<'idle' | 'generating' | 'success'>('idle');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!isOpen) {
            setStatus('idle');
            setPrompt('');
            setProgress(0);
        }
    }, [isOpen]);

    const handleGenerate = () => {
        if (!prompt.trim()) return;

        setStatus('generating');

        // Simulating AI generation process
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += Math.random() * 15;
            if (currentProgress >= 100) {
                currentProgress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    setStatus('success');
                    setTimeout(() => {
                        onGenerate(prompt);
                        onClose();
                    }, 1500);
                }, 500);
            }
            setProgress(currentProgress);
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(2, 6, 23, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <Card style={{
                width: '100%',
                maxWidth: '600px',
                padding: '40px',
                position: 'relative',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--card-bg)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', color: 'var(--text-gray)', cursor: 'pointer' }}
                >
                    <X size={20} />
                </button>

                {status === 'idle' && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ padding: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', borderRadius: '12px', color: 'white' }}>
                                <Sparkles size={24} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{title}</h2>
                                <p style={{ color: 'var(--text-secondary)' }}>{description}</p>
                            </div>
                        </div>

                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={placeholder}
                            style={{
                                width: '100%',
                                height: '140px',
                                padding: '20px',
                                borderRadius: '16px',
                                backgroundColor: 'var(--nav-hover)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                                outline: 'none',
                                resize: 'none',
                                marginBottom: '24px',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary-blue)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                        />

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                            <Button onClick={handleGenerate} disabled={!prompt.trim()}>
                                <Wand2 size={18} /> Gerar Agora
                            </Button>
                        </div>
                    </>
                )}

                {status === 'generating' && (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Loader2 className="animate-spin" size={48} color="var(--primary-blue)" style={{ margin: '0 auto 24px' }} />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px' }}>Gerando seu design...</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>A IA da Bexly está construindo sua estrutura personalizada.</p>

                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--nav-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${progress}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #3b82f6, #8B5CF6)',
                                transition: 'width 0.3s ease'
                            }} />
                        </div>
                        <p style={{ marginTop: '12px', fontSize: '0.875rem', color: 'var(--primary-blue)', fontWeight: 600 }}>{Math.round(progress)}%</p>
                    </div>
                )}

                {status === 'success' && (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '50%', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px' }}>Tudo pronto!</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Sua criação foi gerada com sucesso e já está disponível.</p>
                    </div>
                )}
            </Card>
        </div>
    );
};
