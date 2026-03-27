import { Users, Target, CheckCircle2, DollarSign, TrendingUp, Sparkles, ArrowUpRight, Zap, Target as TargetIcon, ArrowDownRight } from 'lucide-react';
import { Card, Button } from '../components/UI';

const Dashboard = () => {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Visão Geral do Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Bem-vindo de volta ao seu centro de comando empresarial.</p>
                </div>
                <Button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}>
                    <Sparkles size={18} /> Gerar Relatório IA
                </Button>
            </div>

            {/* AI Insights Panel */}
            <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <Sparkles size={18} color="var(--primary-blue)" />
                    <h2 style={{ fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary-blue)' }}>AI Growth Insights</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    <InsightCard
                        icon={<TrendingUp size={20} />}
                        title="Oportunidade de Conversão"
                        description="Sua landing page de 'Black Friday' tem 2.1k visitas e 0.5% de CVR. A IA sugere mudar o CTA para 'Aproveitar agora' para subir para 1.8%."
                        action="Otimizar Landing Page"
                    />
                    <InsightCard
                        icon={<Zap size={20} />}
                        title="Automação Recomendada"
                        description="Identificamos 45 leads que abandonaram o checkout nas últimas 24h. Ative a sequência de recuperação via WhatsApp."
                        action="Ativar Automação"
                    />
                    <InsightCard
                        icon={<TargetIcon size={20} />}
                        title="Insight de Marketing"
                        description="O público de 'Tecnologia' está respondendo 4x melhor. Recomendamos dobrar o investimento nesta segmentação."
                        action="Ver Segmentos"
                    />
                </div>
            </div>

            {/* Metric Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
            }}>
                <MetricCard
                    icon={<Users color="var(--primary-blue)" />}
                    title="Clientes Ativos"
                    value="124"
                    trend="+12%"
                    isUp={true}
                />
                <MetricCard
                    icon={<Target color="#8B5CF6" />}
                    title="Novos Leads"
                    value="48"
                    trend="+5%"
                    isUp={true}
                />
                <MetricCard
                    icon={<CheckCircle2 color="var(--success)" />}
                    title="Negócios Fechados"
                    value="18"
                    trend="-2%"
                    isUp={false}
                />
                <MetricCard
                    icon={<DollarSign color="#EC4899" />}
                    title="Faturamento"
                    value="$12,450"
                    trend="+18%"
                    isUp={true}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Placeholder for Chart/Main Activity */}
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1.05rem' }}>Desempenho Empresarial</h3>
                        <select style={{ background: 'none', border: '1px solid var(--border-color)', padding: '4px 12px', borderRadius: '8px' }}>
                            <option>Últimos 30 Dias</option>
                            <option>Últimos 6 Meses</option>
                        </select>
                    </div>
                    <div style={{ height: '300px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--nav-hover)', borderRadius: 'var(--radius)', border: '2px dashed var(--border-color)' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>Placeholder do Gráfico de Crescimento Interativo</p>
                    </div>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Atividades Recentes</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <ActivityItem
                            user="John Doe"
                            action="Contrato assinado"
                            time="há 2h"
                            status="success"
                        />
                        <ActivityItem
                            user="Sarah Smith"
                            action="Nova consulta de lead"
                            time="há 4h"
                            status="info"
                        />
                        <ActivityItem
                            user="Tech Global"
                            action="Lead movido para Negociação"
                            time="há 1d"
                            status="warning"
                        />
                        <ActivityItem
                            user="Mike Miller"
                            action="Reunião agendada"
                            time="há 2d"
                            status="info"
                        />
                    </div>
                </Card>
            </div>
        </div>
    );
};

const MetricCard = ({ icon, title, value, trend, isUp }: any) => (
    <Card style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--nav-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
            </div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: isUp ? 'var(--success)' : 'var(--error)',
                fontSize: '0.8rem',
                fontWeight: 600
            }}>
                {isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {trend}
            </div>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{title}</p>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--heading-color)' }}>{value}</h2>
    </Card>
);

const InsightCard = ({ icon, title, description, action }: { icon: any, title: string, description: string, action: string }) => (
    <Card style={{
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        borderLeft: '4px solid var(--primary-blue)',
        background: 'linear-gradient(to right, rgba(59, 130, 246, 0.05), transparent)'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: 'var(--primary-blue)' }}>
            {icon}
            <h4 style={{ fontWeight: 600, fontSize: '0.9rem' }}>{title}</h4>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>{description}</p>
        <button style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary-blue)',
            fontWeight: 600,
            fontSize: '0.8rem',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        }}>
            {action} <ArrowUpRight size={14} />
        </button>
    </Card>
);

const ActivityItem = ({ user, action, time, status }: { user: string; action: string; time: string; status: 'success' | 'info' | 'warning' }) => {
    const getStatusColor = () => {
        switch (status) {
            case 'success': return 'var(--success)';
            case 'warning': return 'var(--warning)';
            default: return 'var(--primary-blue)';
        }
    };

    return (
        <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getStatusColor(), marginTop: '6px', flexShrink: 0 }} />
            <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>{user} <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>{action}</span></p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{time}</p>
            </div>
        </div>
    );
};

export default Dashboard;
