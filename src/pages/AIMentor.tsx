import { useState, useRef, useEffect } from 'react';
import { Card, Button } from '../components/UI';
import { Send, User, Sparkles, BrainCircuit } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const AIMentor = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am your Bexly AI Business Mentor. How can I help you optimize your business performance today? I can analyze your sales pipeline, suggest marketing strategies, or help you with client retention.' }
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
                content: `Based on your current dashboard metrics, I suggest focusing on the "Negotiation" stage of your leads. You have 3 deals worth approximately $13,500 that haven't been updated in 5 days. Sending a professional follow-up could improve your conversion rate by 15%.`
            };
            setMessages(prev => [...prev, assistantMessage]);
        }, 1000);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <BrainCircuit color="var(--primary-blue)" size={28} /> AI Business Mentor
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Professional advisor to help you grow your business performance.</p>
            </div>

            <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                {/* Chat Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: '#F9FAFB' }}>
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
                                backgroundColor: msg.role === 'assistant' ? 'var(--primary-blue)' : 'var(--white)',
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
                                backgroundColor: msg.role === 'assistant' ? 'var(--white)' : 'var(--primary-blue)',
                                color: msg.role === 'assistant' ? 'var(--text-primary)' : 'var(--white)',
                                boxShadow: 'var(--shadow-sm)',
                                lineHeight: 1.6,
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
                <div style={{ padding: '24px', backgroundColor: 'var(--white)', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask your mentor for business advice..."
                            style={{
                                flex: 1,
                                padding: '16px 20px',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border-color)',
                                outline: 'none',
                                fontSize: '1rem'
                            }}
                        />
                        <Button onClick={handleSend} style={{ padding: '0 24px' }}>
                            <Send size={20} />
                        </Button>
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '12px' }}>
                        Bexly AI Mentor analyzes your current data to provide custom business strategies.
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default AIMentor;
