import { Shield, Lock, CreditCard, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button, Input, Card } from '../components/UI';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#020617', padding: '40px 20px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '48px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield color="white" size={18} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>Bexly Pay</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.875rem' }}>
                        <Lock size={14} />
                        Pagamento Seguro & Criptografado
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px' }}>
                    {/* Left: Form */}
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '24px' }}>Detalhes do Pagamento</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <section>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', color: '#475569' }}>1. Informações Pessoais</h3>
                                <Input label="Nome Completo" placeholder="Como no cartão" required />
                                <Input label="E-mail para entrega" placeholder="seu@email.com" type="email" required />
                            </section>

                            <section>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', color: '#475569' }}>2. Método de Pagamento</h3>
                                <div style={{
                                    border: '2px solid var(--primary-blue)',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    marginBottom: '20px',
                                    backgroundColor: 'rgba(59, 130, 246, 0.05)'
                                }}>
                                    <CreditCard color="var(--primary-blue)" />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 600 }}>Cartão de Crédito</p>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Aprovação imediata</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <div style={{ width: '30px', height: '20px', backgroundColor: '#e2e8f0', borderRadius: '2px' }} />
                                        <div style={{ width: '30px', height: '20px', backgroundColor: '#e2e8f0', borderRadius: '2px' }} />
                                    </div>
                                </div>

                                <Input label="Número do Cartão" placeholder="0000 0000 0000 0000" required />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <Input label="Validade" placeholder="MM/AA" required />
                                    <Input label="CVV" placeholder="123" required />
                                </div>
                            </section>

                            <Button onClick={() => navigate('/dashboard')} style={{ padding: '18px', fontSize: '1.1rem' }}>
                                Finalizar Pedido <ChevronRight size={20} />
                            </Button>
                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    <div>
                        <Card style={{ padding: '32px', backgroundColor: 'white', position: 'sticky', top: '40px' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '24px' }}>Resumo do Pedido</h3>

                            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                                <div style={{ width: '60px', height: '60px', backgroundColor: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Shield color="var(--primary-blue)" />
                                </div>
                                <div>
                                    <p style={{ fontWeight: 600 }}>Mentoria Elite AI</p>
                                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Acesso vitalício + Suporte</p>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#64748b' }}>
                                    <span>Subtotal</span>
                                    <span>R$ 997,00</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#64748b' }}>
                                    <span>Taxas</span>
                                    <span>R$ 0,00</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700, color: '#020617', marginTop: '8px' }}>
                                    <span>Total</span>
                                    <span>R$ 997,00</span>
                                </div>
                            </div>

                            <div style={{
                                marginTop: '32px',
                                padding: '16px',
                                backgroundColor: '#f0fdf4',
                                borderRadius: '8px',
                                color: '#166534',
                                fontSize: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <CheckCircle2 size={16} />
                                Você tem 7 dias de garantia incondicional.
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
