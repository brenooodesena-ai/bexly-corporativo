import { useState, useRef, useEffect } from 'react';
import { Card, Button } from '../components/UI';
import { Send, User, Sparkles, BrainCircuit } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const AIMentor = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Olá! Eu sou seu Mentor de Negócios IA da Bexly. Como posso ajudá-lo a otimizar o desempenho da sua empresa hoje? Posso analisar seu pipeline de vendas, sugerir estratégias de marketing ou ajudá-lo na retenção de clientes.' }
    ]);
    const [input, setInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        // Simulate AI response
        setTimeout(() => {
            const assistantMessage: Message = {
                role: 'assistant',
                content: `Com base nas métricas atuais do seu dashboard, sugiro focar na etapa de "Negociação" dos seus leads. Você tem 3 negócios no valor aproximado de R$ 13.500 que não são atualizados há 5 dias. Enviar um follow-up profissional pode melhorar sua taxa de conversão em 15%.`
            };
            setMessages(prev => [...prev, assistantMessage]);
        }, 1000);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <BrainCircuit color="var(--primary-blue)" size={28} /> Mentor de Negócios IA
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Consultor profissional para ajudá-lo a impulsionar o desempenho do seu negócio.</p>
            </div>

            <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                {/* Chat Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: 'var(--background)' }}>
                    {messages.map((msg, idx) => (
                        <div key={idx} style={{
                            display: 'flex',
                            gap: '16px',
                            marginBottom: '24px',
                            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                backgroundColor: msg.role === 'assistant' ? 'var(--primary-blue)' : 'var(--sidebar-bg)',
                                border: msg.role === 'user' ? '1px solid var(--border-color)' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {msg.role === 'assistant' ? <Sparkles color="white" size={20} /> : <User color="var(--text-gray)" size={20} />}
                            </div>

                            <div style={{
                                maxWidth: '70%',
                                padding: '16px 20px',
                                borderRadius: '16px',
                                backgroundColor: msg.role === 'assistant' ? 'var(--sidebar-bg)' : 'var(--primary-blue)',
                                color: msg.role === 'assistant' ? 'var(--text-primary)' : 'var(--white)',
                                boxShadow: 'var(--shadow-sm)',
                                lineHeight: 1.6,
                                fontSize: '0.9rem',
                                border: msg.role === 'assistant' ? '1px solid var(--border-color)' : 'none',
                                borderTopLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
                                borderTopRightRadius: msg.role === 'user' ? '4px' : '16px',
                            }}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div style={{ padding: '24px', backgroundColor: 'var(--sidebar-bg)', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Peça conselhos de negócios ao seu mentor..."
                            style={{
                                flex: 1,
                                padding: '16px 20px',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border-color)',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                        <Button onClick={handleSend} style={{ padding: '0 24px' }}>
                            <Send size={20} />
                        </Button>
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '12px' }}>
                        O Mentor IA da Bexly analisa seus dados atuais para fornecer estratégias de negócios personalizadas.
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default AIMentor;
