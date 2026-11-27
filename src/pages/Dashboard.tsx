import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
    Users,
    ArrowUpRight,
    ArrowDownRight,
    Instagram,
    CheckCircle2,
    Send
} from 'lucide-react';
import { useInstagramAutomation } from '../context/InstagramAutomationContext';
import { useAuth } from '../context/AuthContext';

// ── Sparkline SVG Chart ──────────────────────────────────────────────────────
function Sparkline({ data, color = '#ff9800', height = 36, width = 80 }: {
    data: number[]; color?: string; height?: number; width?: number;
}) {
    if (!data.length) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = width / Math.max(data.length - 1, 1);
    const points = data.map((v, i) => `${i * stepX},${height - ((v - min) / range) * (height - 6) - 3}`).join(' ');
    const areaPoints = `0,${height} ${points} ${(data.length - 1) * stepX},${height}`;
    const gradId = `sp-${color.replace(/[^a-zA-Z0-9]/g, '')}`;
    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" style={{ overflow: 'visible' }}>
            <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={areaPoints} fill={`url(#${gradId})`} />
            <polyline points={points} stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={(data.length - 1) * stepX} cy={height - ((data[data.length - 1] - min) / range) * (height - 6) - 3} r="3" fill={color} />
        </svg>
    );
}

// ── Vertical Pill Bar Chart (Apple VisionOS Signature Style) ───────────────
function VisionVerticalBars({
    data,
    selectedIdx,
    onSelect
}: {
    data: { label: string; value: number; formatted: string }[];
    selectedIdx: number;
    onSelect: (idx: number) => void;
}) {
    const maxVal = Math.max(...data.map(d => d.value), 1);

    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '170px', gap: '8px', paddingTop: '32px' }}>
            {data.map((item, idx) => {
                const isSelected = idx === selectedIdx;
                const heightPct = Math.max(Math.round((item.value / maxVal) * 100), 18);

                return (
                    <div
                        key={idx}
                        onClick={() => onSelect(idx)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            flex: 1,
                            height: '100%',
                            justifyContent: 'flex-end',
                            position: 'relative',
                            cursor: 'pointer'
                        }}
                    >
                        {/* Tooltip flutuante de vidro fosco (como no vídeo) */}
                        {isSelected && (
                            <motion.div
                                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                                style={{
                                    position: 'absolute',
                                    top: `${Math.max(100 - heightPct - 24, 0)}%`,
                                    transform: 'translateY(-100%)',
                                    padding: '4px 10px',
                                    background: '#ffffff',
                                    borderRadius: '9999px',
                                    color: '#0f172a',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                                    zIndex: 10,
                                    pointerEvents: 'none'
                                }}
                            >
                                {item.formatted}
                            </motion.div>
                        )}

                        {/* Barra vertical com pílula de vidro fosco */}
                        <div
                            style={{
                                width: '14px',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'flex-end',
                                background: 'rgba(255, 255, 255, 0.07)',
                                borderRadius: '9999px',
                                overflow: 'hidden',
                                padding: '1px'
                            }}
                        >
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${heightPct}%` }}
                                transition={{ type: 'spring', stiffness: 220, damping: 24, delay: idx * 0.03 }}
                                style={{
                                    width: '100%',
                                    borderRadius: '9999px',
                                    background: isSelected
                                        ? 'linear-gradient(180deg, #ffaa40 0%, #f59e0b 100%)'
                                        : 'linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.2) 100%)',
                                    boxShadow: isSelected ? '0 0 16px rgba(245, 158, 11, 0.7)' : 'none',
                                    transition: 'background 0.25s ease, box-shadow 0.25s ease'
                                }}
                            />
                        </div>

                        {/* Rótulo da data abaixo */}
                        <span style={{
                            marginTop: '10px',
                            fontSize: '0.68rem',
                            color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
                            fontWeight: isSelected ? 600 : 400,
                            whiteSpace: 'nowrap'
                        }}>
                            {item.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

// ── Donut Chart (VisionOS Category Breakdown) ───────────────────────────────
function VisionDonutChart({
    segments,
    totalLabel = '1,240'
}: {
    segments: { label: string; value: number; color: string }[];
    totalLabel?: string;
}) {
    const total = segments.reduce((s, sg) => s + sg.value, 0) || 1;
    let cumulative = 0;
    const R = 48, CX = 60, CY = 60, stroke = 14;
    const circumference = 2 * Math.PI * R;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
            <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
                <svg width={120} height={120} viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                    {segments.map((sg, i) => {
                        const pct = sg.value / total;
                        const dash = circumference * pct;
                        const offset = circumference * cumulative;
                        cumulative += pct;

                        return (
                            <circle
                                key={i}
                                cx={CX}
                                cy={CY}
                                r={R}
                                fill="none"
                                stroke={sg.color}
                                strokeWidth={stroke}
                                strokeDasharray={`${Math.max(dash - 3, 0)} ${circumference}`}
                                strokeDashoffset={-offset}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dasharray 0.8s ease' }}
                            />
                        );
                    })}
                </svg>
                {/* Centro do Donut */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none'
                }}>
                    <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>{totalLabel}</span>
                </div>
            </div>

            {/* Legenda com pontos luminosos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {segments.map(sg => (
                    <div key={sg.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                backgroundColor: sg.color,
                                boxShadow: `0 0 8px ${sg.color}`,
                                flexShrink: 0
                            }} />
                            <span style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.7)' }}>{sg.label}</span>
                        </div>
                        <span style={{ fontSize: '0.74rem', color: '#ffffff', fontWeight: 600 }}>{sg.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Variantes de Animação em Cascata (Staggered Entrance) ───────────────────
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.07,
            delayChildren: 0.02
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(14px)', scale: 0.97 },
    show: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        scale: 1,
        transition: {
            type: 'spring' as const,
            stiffness: 260,
            damping: 24,
            mass: 0.8
        }
    }
};

// ── Main Dashboard Component ────────────────────────────────────────────────
const Dashboard = () => {
    const { leads, automations, account } = useInstagramAutomation();
    const { user } = useAuth();
    const [selectedBarIdx, setSelectedBarIdx] = useState(2); // Seleciona o 3º dia (ex: 3 Aug) como no vídeo
    const [customerFilter, setCustomerFilter] = useState<'Todos' | 'VIP' | 'Leads' | 'Ativos'>('Todos');

    const totalLeads = leads.length;
    const totalRevenue = leads.filter(l => l.status === 'Cliente').reduce((s, l) => s + (l.attributedValue || 0), 0);

    const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Barbara';

    // Dados de receita por dias (com estilo do vídeo)
    const revenueBars = [
        { label: '1 Ago', value: 3800, formatted: 'R$ 3.800' },
        { label: '2 Ago', value: 5400, formatted: 'R$ 5.400' },
        { label: '3 Ago', value: 14867, formatted: 'R$ 14.867' },
        { label: '4 Ago', value: 9200, formatted: 'R$ 9.200' },
        { label: '5 Ago', value: 11400, formatted: 'R$ 11.400' },
        { label: '6 Ago', value: 13600, formatted: 'R$ 13.600' },
        { label: '7 Ago', value: 10800, formatted: 'R$ 10.800' },
        { label: '8 Ago', value: 8900, formatted: 'R$ 8.900' },
    ];

    // Donut de Vendas / Categorias (como no vídeo)
    const categorySegments = [
        { label: 'Apple MacBook Air M2', value: 520, color: '#f97316' },
        { label: 'Apple Watch Series 9', value: 340, color: '#06b6d4' },
        { label: 'Acoustics JBL Charge 5', value: 210, color: '#eab308' },
        { label: 'Apple AirPods Pro 2', value: 170, color: '#10b981' },
    ];

    // KPI Cards estilo Apple VisionOS
    const kpiCards = [
        {
            label: 'Total revenue',
            value: totalRevenue > 0 ? `R$ ${totalRevenue.toLocaleString('pt-BR')}` : 'R$ 98.884',
            trend: '+3.87%',
            up: true,
            sparkData: [45, 52, 58, 65, 80, 98],
            sparkColor: '#f59e0b',
            accent: '#f59e0b'
        },
        {
            label: 'Total orders',
            value: automations.length > 0 ? `${automations.length * 7}` : '35',
            trend: '-0.87%',
            up: false,
            sparkData: [40, 38, 42, 36, 35],
            sparkColor: '#f43f5e',
            accent: '#8b5cf6'
        },
        {
            label: 'Total visitors',
            value: totalLeads > 0 ? `${(totalLeads * 350).toLocaleString('pt-BR')}` : '45.600',
            trend: '+2.41%',
            up: true,
            sparkData: [32, 35, 41, 40, 45],
            sparkColor: '#10b981',
            accent: '#3b82f6'
        },
        {
            label: 'Net profit',
            value: totalRevenue > 0 ? `R$ ${(totalRevenue * 0.65).toLocaleString('pt-BR')}` : 'R$ 60.450',
            trend: '+5.47%',
            up: true,
            sparkData: [30, 36, 42, 50, 60],
            sparkColor: '#10b981',
            accent: '#10b981'
        }
    ];

    // Clientes / Inteligência de Clientes
    const mockCustomers = [
        { id: 1, name: 'Sophia Reynolds', email: 'sophia@example.com', initials: 'SR', segment: 'VIP DIAMOND', orders: 18, spent: 'R$ 4.280', loyalty: '98%', status: 'Ativo' },
        { id: 2, name: 'Liam Chen', email: 'liam.chen@gmail.com', initials: 'LC', segment: 'LOYAL', orders: 9, spent: 'R$ 1.860', loyalty: '84%', status: 'Ativo' },
        { id: 3, name: 'Emma Watson', email: 'emma.w@outlook.com', initials: 'EW', segment: 'LEAD QUALIFICADO', orders: 3, spent: 'R$ 740', loyalty: '62%', status: 'Pendente' },
    ];

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            style={{
                color: '#f8fafc',
                maxWidth: '1360px',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            }}
        >
            {/* ── GREETING HEADER (Estilo exato do vídeo) ── */}
            <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '1.85rem', fontWeight: 700, margin: 0, letterSpacing: '-0.025em', color: '#ffffff' }}>
                        Hello, {userName}! 👋
                    </h1>
                    <p style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '0.86rem', margin: '4px 0 0' }}>
                        This is what's happening in your business this month.
                    </p>
                </div>

                {account && (
                    <div className="apple-glass-pill" style={{ padding: '6px 14px', gap: '8px' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                        <Instagram size={13} style={{ color: '#c084fc' }} />
                        <span style={{ fontSize: '0.8rem', color: '#ffffff' }}>@{account.username} conectado</span>
                    </div>
                )}
            </motion.div>

            {/* ── TOP KPI CARDS (Apple Frosted Glass) ── */}
            <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {kpiCards.map((kpi, i) => (
                    <div
                        key={i}
                        className="apple-glass-card"
                        style={{
                            padding: '22px',
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            minHeight: '142px'
                        }}
                    >
                        {/* Top Row: Label & Arrow Button */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.55)', fontWeight: 500 }}>
                                {kpi.label}
                            </span>
                            <div
                                style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'rgba(255, 255, 255, 0.7)'
                                }}
                            >
                                <ArrowUpRight size={14} />
                            </div>
                        </div>

                        {/* Bottom Row: Value, Trend Badge & Sparkline */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '14px' }}>
                            <div>
                                <p style={{ fontSize: '1.65rem', fontWeight: 700, color: '#ffffff', margin: 0, letterSpacing: '-0.03em' }}>
                                    {kpi.value}
                                </p>
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    marginTop: '4px',
                                    padding: '2px 8px',
                                    borderRadius: '9999px',
                                    background: kpi.up ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                                    color: kpi.up ? '#34d399' : '#fb7185'
                                }}>
                                    {kpi.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                                    {kpi.trend}
                                </span>
                            </div>
                            <Sparkline data={kpi.sparkData} color={kpi.sparkColor} width={76} height={34} />
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* ── MIDDLE ROW: BAR CHART + OVERVIEW PANELS ── */}
            <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '16px' }}>
                {/* Left: Revenue Bar Chart (Pill Columns com Tooltip como no vídeo) */}
                <div className="apple-glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                                Revenue
                            </h2>
                            <p style={{ fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.5)', margin: '2px 0 0' }}>
                                This month vs last
                            </p>
                        </div>
                        <div
                            style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'rgba(255, 255, 255, 0.7)'
                            }}
                        >
                            <ArrowUpRight size={14} />
                        </div>
                    </div>

                    <VisionVerticalBars
                        data={revenueBars}
                        selectedIdx={selectedBarIdx}
                        onSelect={setSelectedBarIdx}
                    />
                </div>

                {/* Right: Quick Stats & Sales by Category Donut */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Top Row: Mini stats pills */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="apple-glass-card" style={{ padding: '18px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <CheckCircle2 size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
                                <ArrowUpRight size={13} style={{ color: 'rgba(255,255,255,0.4)' }} />
                            </div>
                            <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', margin: '10px 0 2px' }}>98 orders</p>
                            <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>12 orders awaiting confirmation</p>
                        </div>
                        <div className="apple-glass-card" style={{ padding: '18px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Users size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
                                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ArrowUpRight size={13} color="#0f172a" />
                                </div>
                            </div>
                            <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', margin: '10px 0 2px' }}>17 customers</p>
                            <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>17 waiting for response</p>
                        </div>
                    </div>

                    {/* Bottom Row: Sales by Category Donut Chart */}
                    <div className="apple-glass-card" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>Sales by Category</h3>
                            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)' }}>This month</span>
                        </div>
                        <VisionDonutChart segments={categorySegments} totalLabel="1,240" />
                    </div>
                </div>
            </motion.div>

            {/* ── BOTTOM ROW: CUSTOMER INTELLIGENCE TABLE (Estilo exato do vídeo) ── */}
            <motion.div variants={itemVariants} className="apple-glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                            Customer Intelligence 👥
                        </h3>
                        <p style={{ fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.5)', margin: '2px 0 0' }}>
                            Audience lifetime value, retention metrics, and VIP cohort analytics
                        </p>
                    </div>

                    {/* Filter Pills (como no vídeo) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {(['Todos', 'VIP', 'Leads', 'Ativos'] as const).map(tab => {
                            const isCurrent = customerFilter === tab;
                            return (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setCustomerFilter(tab)}
                                    className="apple-glass-button"
                                    style={{
                                        padding: '5px 14px',
                                        fontSize: '0.74rem',
                                        fontWeight: isCurrent ? 600 : 400,
                                        background: isCurrent ? '#ffffff' : 'rgba(255, 255, 255, 0.08)',
                                        color: isCurrent ? '#0f172a' : 'rgba(255, 255, 255, 0.75)',
                                        boxShadow: isCurrent ? '0 4px 16px rgba(255,255,255,0.4)' : 'none'
                                    }}
                                >
                                    {tab}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tabela Translúcida com Linhas em Vidro */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'rgba(255, 255, 255, 0.45)' }}>
                                <th style={{ padding: '10px 14px', fontWeight: 500 }}>Cliente</th>
                                <th style={{ padding: '10px 14px', fontWeight: 500 }}>Segmento</th>
                                <th style={{ padding: '10px 14px', fontWeight: 500 }}>Pedidos / DMs</th>
                                <th style={{ padding: '10px 14px', fontWeight: 500 }}>Valor Total</th>
                                <th style={{ padding: '10px 14px', fontWeight: 500 }}>Fidelidade</th>
                                <th style={{ padding: '10px 14px', fontWeight: 500, textAlign: 'right' }}>Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockCustomers.map((c, i) => (
                                <tr
                                    key={c.id}
                                    style={{
                                        borderBottom: i < mockCustomers.length - 1 ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
                                        transition: 'background 0.2s ease'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '14px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.74rem',
                                                fontWeight: 700,
                                                color: '#ffffff'
                                            }}>
                                                {c.initials}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#ffffff' }}>{c.name}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)' }}>{c.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px' }}>
                                        <span style={{
                                            padding: '3px 9px',
                                            borderRadius: '9999px',
                                            fontSize: '0.66rem',
                                            fontWeight: 700,
                                            letterSpacing: '0.04em',
                                            background: 'rgba(245, 158, 11, 0.15)',
                                            color: '#fbbf24',
                                            border: '1px solid rgba(245, 158, 11, 0.3)'
                                        }}>
                                            {c.segment}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px', color: 'rgba(255, 255, 255, 0.85)' }}>
                                        {c.orders} pedidos
                                    </td>
                                    <td style={{ padding: '14px', fontWeight: 600, color: '#ffffff' }}>
                                        {c.spent}
                                    </td>
                                    <td style={{ padding: '14px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ flex: 1, maxWidth: '80px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                                                <div style={{ width: c.loyalty, height: '100%', background: '#10b981', borderRadius: '9999px' }} />
                                            </div>
                                            <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>{c.loyalty}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px', textAlign: 'right' }}>
                                        <button
                                            type="button"
                                            className="apple-glass-button"
                                            style={{ padding: '5px 12px', fontSize: '0.72rem', gap: '5px' }}
                                        >
                                            <Send size={11} />
                                            <span>Mensagem VIP</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;
