import { useState } from 'react';
import {
    Users, Target, CheckCircle2, DollarSign, Sparkles,
    ArrowUpRight, Zap, ArrowDownRight, Instagram, MessageSquare,
    Activity, ShoppingBag, Star, ChevronRight, BarChart2,
    Clock, Briefcase, Award
} from 'lucide-react';
import { useInstagramAutomation } from '../context/InstagramAutomationContext';


// ── Sparkline SVG Chart ──────────────────────────────────────────────────────
function Sparkline({ data, color = '#3b82f6', height = 40, width = 100 }: {
    data: number[]; color?: string; height?: number; width?: number;
}) {
    if (!data.length) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);
    const points = data.map((v, i) => `${i * stepX},${height - ((v - min) / range) * (height - 4)}`).join(' ');
    const areaPoints = `0,${height} ${points} ${(data.length - 1) * stepX},${height}`;
    const gradId = `sp-${color.replace('#', '')}`;
    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" style={{ overflow: 'visible' }}>
            <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={areaPoints} fill={`url(#${gradId})`} />
            <polyline points={points} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={(data.length - 1) * stepX} cy={height - ((data[data.length - 1] - min) / range) * (height - 4)} r="3" fill={color} />
        </svg>
    );
}

// ── Area Chart ───────────────────────────────────────────────────────────────
function AreaChart({ datasets, period }: { datasets: { label: string; data: number[]; color: string }[]; period: string }) {
    const len = datasets[0]?.data.length || 12;
    const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const labels = period === '12m'
        ? monthLabels
        : period === '7d'
            ? ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
            : Array.from({ length: len }, (_, i) => `${i + 1}`).filter((_, i) => i % 5 === 0 || i === len - 1);

    const allValues = datasets.flatMap(d => d.data);
    const max = Math.max(...allValues) * 1.15;
    const W = 700, H = 220, PL = 52, PR = 20, PT = 16, PB = 32;
    const chartW = W - PL - PR;
    const chartH = H - PT - PB;
    const stepX = chartW / (len - 1);
    const toY = (v: number) => PT + chartH - (v / max) * chartH;
    const toX = (i: number) => PL + i * stepX;
    const gridVals = [0, 0.25, 0.5, 0.75, 1].map(r => Math.round(max * r));

    return (
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
            <defs>
                {datasets.map(d => (
                    <linearGradient key={d.label} id={`ag-${d.label}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={d.color} stopOpacity="0.18" />
                        <stop offset="100%" stopColor={d.color} stopOpacity="0" />
                    </linearGradient>
                ))}
            </defs>
            {gridVals.map((v, i) => (
                <g key={i}>
                    <line x1={PL} y1={toY(v)} x2={W - PR} y2={toY(v)} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                    <text x={PL - 8} y={toY(v) + 4} textAnchor="end" fontSize="10" fill="#4b5563">
                        {v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                    </text>
                </g>
            ))}
            {(period === '12m' ? labels : period === '7d' ? labels : labels).map((l, i) => {
                const dataIdx = period === '30d'
                    ? Math.round(i * (len - 1) / (labels.length - 1))
                    : i;
                return (
                    <text key={l} x={toX(period === '30d' ? dataIdx : i)} y={H - 4} textAnchor="middle" fontSize="10" fill="#4b5563">{l}</text>
                );
            })}
            {datasets.map(d => {
                const pts = d.data.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
                const areaPts = `${toX(0)},${toY(0)} ${pts} ${toX(d.data.length - 1)},${toY(0)}`;
                return (
                    <g key={d.label}>
                        <polygon points={areaPts} fill={`url(#ag-${d.label})`} />
                        <polyline points={pts} stroke={d.color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        {d.data.map((v, i) => (
                            <circle key={i} cx={toX(i)} cy={toY(v)} r={i === d.data.length - 1 ? 4 : 2}
                                fill={d.color} opacity={i === d.data.length - 1 ? 1 : 0.5} />
                        ))}
                    </g>
                );
            })}
        </svg>
    );
}

// ── DonutChart ───────────────────────────────────────────────────────────────
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
    const total = segments.reduce((s, sg) => s + sg.value, 0) || 1;
    let cumulative = 0;
    const R = 55, CX = 65, CY = 65, stroke = 20;
    const circumference = 2 * Math.PI * R;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <svg width={130} height={130} viewBox="0 0 130 130" style={{ flexShrink: 0 }}>
                {segments.map((sg, i) => {
                    const pct = sg.value / total;
                    const element = (
                        <circle key={i} cx={CX} cy={CY} r={R} fill="none" stroke={sg.color}
                            strokeWidth={stroke}
                            strokeDasharray={`${circumference * pct - 2} ${circumference * (1 - pct) + 2}`}
                            strokeDashoffset={circumference * 0.25 - circumference * cumulative}
                            strokeLinecap="round"
                            style={{ transition: 'all 0.6s ease' }}
                        />
                    );
                    cumulative += pct;
                    return element;
                })}
                <text x={CX} y={CY - 5} textAnchor="middle" fontSize="18" fontWeight="700" fill="#ffffff">{total}</text>
                <text x={CX} y={CY + 12} textAnchor="middle" fontSize="9" fill="#64748b">leads</text>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', flex: 1 }}>
                {segments.map(sg => (
                    <div key={sg.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: sg.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.73rem', color: '#94a3b8', flex: 1 }}>{sg.label}</span>
                        <span style={{ fontSize: '0.73rem', color: '#ffffff', fontWeight: 600 }}>{sg.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
    const { leads, automations, account } = useInstagramAutomation();
    const [chartPeriod, setChartPeriod] = useState<'7d' | '30d' | '12m'>('12m');

    const totalLeads = leads.length || 67;
    const activeAutomations = automations.filter(a => a.status === 'active').length || 4;
    const totalDms = automations.reduce((s, a) => s + a.metrics.dmsSent, 0) || 234;
    const totalRevenue = leads.filter(l => l.status === 'Cliente').reduce((s, l) => s + (l.attributedValue || 0), 0) || 14800;

    const revenueData: Record<string, number[]> = {
        '12m': [4200, 5800, 7100, 6400, 9200, 11400, 8900, 12100, 15300, 13800, 17200, 21450],
        '30d': [320, 450, 380, 510, 620, 580, 700, 830, 760, 940, 880, 1020, 1150, 1080, 1200, 980, 1350, 1420, 1300, 1580, 1450, 1700, 1620, 1850, 1780, 2100, 1950, 2250, 2180, 2450],
        '7d': [1950, 2180, 2350, 2100, 2580, 2420, 2690],
    };
    const leadsData: Record<string, number[]> = {
        '12m': [12, 18, 24, 21, 31, 38, 29, 42, 51, 46, 58, 72],
        '30d': [1, 2, 1, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 8, 7, 8, 9, 10, 8, 11, 10, 12, 11, 13, 12, 14, 13, 15, 14, 16],
        '7d': [8, 11, 9, 14, 12, 16, 14],
    };

    const chartDatasets = [
        { label: 'Faturamento', data: revenueData[chartPeriod], color: '#3b82f6' },
        { label: 'Leads (×200)', data: leadsData[chartPeriod].map(v => v * 200), color: '#8b5cf6' },
    ];

    const donutSegments = [
        { label: 'Novos', value: leads.filter(l => l.status === 'Novo').length || 18, color: '#3b82f6' },
        { label: 'Qualificados', value: leads.filter(l => l.status === 'Qualificado').length || 22, color: '#8b5cf6' },
        { label: 'Oportunidade', value: leads.filter(l => l.status === 'Oportunidade').length || 14, color: '#f59e0b' },
        { label: 'Clientes', value: leads.filter(l => l.status === 'Cliente').length || 8, color: '#10b981' },
        { label: 'Perdidos', value: leads.filter(l => l.status === 'Perdido').length || 5, color: '#f43f5e' },
    ];

    const activities = [
        { icon: <Instagram size={13} />, color: '#833ab4', text: 'Novo lead capturado via Instagram', sub: '@marketing.digital comentou "QUERO"', time: '2min' },
        { icon: <MessageSquare size={13} />, color: '#3b82f6', text: 'DM automático enviado com sucesso', sub: 'Campanha "Black Friday Pro"', time: '8min' },
        { icon: <CheckCircle2 size={13} />, color: '#10b981', text: 'Lead convertido em Cliente', sub: 'Pedro Alves • R$ 1.200/mês', time: '24min' },
        { icon: <Zap size={13} />, color: '#f59e0b', text: 'Automação ativada', sub: 'Regra "Palavra-chave: LINK"', time: '1h' },
        { icon: <ShoppingBag size={13} />, color: '#ec4899', text: 'Venda atribuída ao CRM', sub: 'Plano Profissional • R$ 497', time: '2h' },
        { icon: <Star size={13} />, color: '#06b6d4', text: 'Meta de leads atingida!', sub: '50 leads capturados este mês 🎉', time: '3h' },
    ];

    const goals = [
        { label: 'Leads este mês', current: totalLeads, target: 100, color: '#3b82f6' },
        { label: 'DMs enviados', current: totalDms, target: 500, color: '#8b5cf6' },
        { label: 'Taxa de conversão', current: 18, target: 25, color: '#10b981', suffix: '%' },
        { label: 'Faturamento', current: Math.round(totalRevenue / 1000), target: 20, color: '#f59e0b', suffix: 'k' },
    ];

    const kpis = [
        {
            icon: <Users size={17} />, iconBg: 'rgba(59,130,246,0.15)', iconColor: '#60a5fa',
            label: 'Total de Leads', value: totalLeads, trend: '+23%', up: true,
            sparkData: [12, 18, 15, 22, 28, 25, 31, 38, 34, 42, 48, 67], sparkColor: '#3b82f6', sub: 'vs mês anterior'
        },
        {
            icon: <Activity size={17} />, iconBg: 'rgba(139,92,246,0.15)', iconColor: '#a78bfa',
            label: 'Automações Ativas', value: activeAutomations, trend: '+2', up: true,
            sparkData: [1, 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 4], sparkColor: '#8b5cf6', sub: 'novas regras ativas'
        },
        {
            icon: <MessageSquare size={17} />, iconBg: 'rgba(16,185,129,0.15)', iconColor: '#34d399',
            label: 'DMs Enviados', value: totalDms, trend: '+41%', up: true,
            sparkData: [40, 55, 48, 70, 82, 75, 95, 110, 98, 130, 150, 234], sparkColor: '#10b981', sub: 'envios automáticos'
        },
        {
            icon: <DollarSign size={17} />, iconBg: 'rgba(245,158,11,0.15)', iconColor: '#fbbf24',
            label: 'Faturamento', value: `R$ ${totalRevenue.toLocaleString('pt-BR')}`, trend: '+18%', up: true,
            sparkData: [4200, 5800, 7100, 6400, 9200, 11400, 8900, 12100, 15300, 13800, 17200, 14800], sparkColor: '#f59e0b', sub: 'receita atribuída'
        },
    ];

    const glass = (extra: React.CSSProperties = {}): React.CSSProperties => ({
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        backdropFilter: 'blur(20px)',
        ...extra
    });

    return (
        <div style={{
            color: '#f8fafc', maxWidth: '1280px', margin: '0 auto', paddingBottom: '70px',
            display: 'flex', flexDirection: 'column', gap: '20px',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}>
            {/* ── HEADER ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                        <h1 style={{ fontSize: '1.65rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em', color: '#ffffff' }}>
                            Visão Geral
                        </h1>
                        {account && (
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px',
                                borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600,
                                backgroundColor: 'rgba(131,58,180,0.15)', color: '#c084fc',
                                border: '1px solid rgba(131,58,180,0.3)'
                            }}>
                                <Instagram size={10} /> @{account.username} conectado
                            </span>
                        )}
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
                        Centro de comando do seu negócio — métricas em tempo real da Bexly OS.
                    </p>
                </div>
                <button style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
                    borderRadius: '12px', border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    color: '#ffffff', fontWeight: 600, fontSize: '0.85rem',
                    boxShadow: '0 4px 20px rgba(59,130,246,0.3)'
                }}>
                    <Sparkles size={16} /> Relatório com IA
                </button>
            </div>

            {/* ── KPI CARDS ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                {kpis.map((kpi, i) => (
                    <div key={i} style={glass({ padding: '20px', position: 'relative', overflow: 'hidden' })}>
                        <div style={{
                            position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px',
                            borderRadius: '50%', background: kpi.iconBg, filter: 'blur(35px)', pointerEvents: 'none'
                        }} />
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '10px',
                                    backgroundColor: kpi.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: kpi.iconColor
                                }}>
                                    {kpi.icon}
                                </div>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.73rem', fontWeight: 700, color: kpi.up ? '#10b981' : '#f43f5e' }}>
                                    {kpi.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                                    {kpi.trend}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div>
                                    <p style={{ fontSize: '0.73rem', color: '#64748b', margin: '0 0 3px' }}>{kpi.label}</p>
                                    <p style={{ fontSize: '1.55rem', fontWeight: 700, color: '#ffffff', margin: 0, letterSpacing: '-0.03em' }}>{kpi.value}</p>
                                    <p style={{ fontSize: '0.68rem', color: '#4b5563', margin: '3px 0 0' }}>{kpi.sub}</p>
                                </div>
                                <Sparkline data={kpi.sparkData} color={kpi.sparkColor} width={76} height={36} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── MAIN CHART + DONUT ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '14px' }}>
                <div style={glass({ padding: '22px' })}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', margin: '0 0 3px' }}>Desempenho de Crescimento</h2>
                            <p style={{ fontSize: '0.73rem', color: '#64748b', margin: 0 }}>Faturamento e captação de leads no período</p>
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            {(['7d', '30d', '12m'] as const).map(p => (
                                <button key={p} onClick={() => setChartPeriod(p)} style={{
                                    padding: '4px 11px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
                                    backgroundColor: chartPeriod === p ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                                    color: chartPeriod === p ? '#ffffff' : '#64748b', transition: 'all 0.15s'
                                }}>
                                    {p === '7d' ? '7d' : p === '30d' ? '30d' : '12m'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '14px', marginBottom: '10px' }}>
                        {chartDatasets.map(d => (
                            <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '10px', height: '3px', borderRadius: '2px', backgroundColor: d.color }} />
                                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{d.label}</span>
                            </div>
                        ))}
                    </div>
                    <AreaChart datasets={chartDatasets} period={chartPeriod} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={glass({ padding: '20px', flex: 1 })}>
                        <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', margin: '0 0 14px' }}>Pipeline de Leads</h3>
                        <DonutChart segments={donutSegments} />
                    </div>
                    <div style={{
                        ...glass({ padding: '16px' }),
                        background: account
                            ? 'linear-gradient(135deg, rgba(131,58,180,0.15) 0%, rgba(253,29,29,0.08) 100%)'
                            : 'rgba(15,23,42,0.7)',
                        borderColor: account ? 'rgba(131,58,180,0.3)' : 'rgba(255,255,255,0.08)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                                background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Instagram size={17} color="#ffffff" />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                                    {account ? `@${account.username}` : 'Instagram não conectado'}
                                </p>
                                <p style={{ fontSize: '0.68rem', color: account ? '#10b981' : '#64748b', margin: '2px 0 0' }}>
                                    {account
                                        ? `${(account.followersCount || 0).toLocaleString('pt-BR')} seguidores • Ativo`
                                        : 'Conecte para ativar automações'
                                    }
                                </p>
                            </div>
                            <ChevronRight size={15} color="#4b5563" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── ACTIVITY + GOALS ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={glass({ padding: '22px' })}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>Atividade Recente</h3>
                        <span style={{ fontSize: '0.7rem', color: '#3b82f6', cursor: 'pointer', fontWeight: 600 }}>Ver tudo →</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {activities.map((act, i) => (
                            <div key={i} style={{
                                display: 'flex', gap: '11px', alignItems: 'flex-start',
                                paddingBottom: i < activities.length - 1 ? '13px' : 0,
                                marginBottom: i < activities.length - 1 ? '13px' : 0,
                                borderBottom: i < activities.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
                            }}>
                                <div style={{
                                    width: '26px', height: '26px', borderRadius: '7px', flexShrink: 0,
                                    backgroundColor: `${act.color}20`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: act.color
                                }}>
                                    {act.icon}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: '0.76rem', fontWeight: 600, color: '#e2e8f0', margin: '0 0 2px', lineHeight: 1.3 }}>{act.text}</p>
                                    <p style={{ fontSize: '0.68rem', color: '#64748b', margin: 0 }}>{act.sub}</p>
                                </div>
                                <span style={{ fontSize: '0.63rem', color: '#4b5563', flexShrink: 0, paddingTop: '2px' }}>{act.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={glass({ padding: '22px' })}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>Metas do Mês</h3>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px',
                            borderRadius: '10px', fontSize: '0.68rem', fontWeight: 600,
                            backgroundColor: 'rgba(16,185,129,0.12)', color: '#10b981',
                            border: '1px solid rgba(16,185,129,0.2)'
                        }}>
                            <Award size={9} /> outubro 2026
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {goals.map((goal, i) => {
                            const pct = Math.min((goal.current / goal.target) * 100, 100);
                            const fmt = (v: number) => goal.suffix === 'k' ? `R$ ${v}k` : goal.suffix === '%' ? `${v}%` : `${v}`;
                            return (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>{goal.label}</span>
                                        <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#ffffff' }}>
                                            {fmt(goal.current)} <span style={{ color: '#4b5563', fontWeight: 400 }}>/ {fmt(goal.target)}</span>
                                        </span>
                                    </div>
                                    <div style={{ height: '5px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${pct}%`, height: '100%', borderRadius: '10px',
                                            background: `linear-gradient(90deg, ${goal.color}, ${goal.color}99)`,
                                            boxShadow: `0 0 8px ${goal.color}60`, transition: 'width 0.8s ease'
                                        }} />
                                    </div>
                                    <p style={{ fontSize: '0.65rem', color: '#4b5563', margin: '3px 0 0', textAlign: 'right' }}>{pct.toFixed(0)}%</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── QUICK ACTIONS ── */}
            <div style={glass({ padding: '18px 22px' })}>
                <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4b5563', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    Acesso Rápido
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
                    {[
                        { icon: <Instagram size={15} />, label: 'Nova Automação', color: '#833ab4', href: '/marketing' },
                        { icon: <Users size={15} />, label: 'Ver Leads', color: '#3b82f6', href: '/leads' },
                        { icon: <BarChart2 size={15} />, label: 'Relatórios', color: '#10b981', href: '/dashboard' },
                        { icon: <Briefcase size={15} />, label: 'Clientes', color: '#f59e0b', href: '/clients' },
                        { icon: <Target size={15} />, label: 'Funis', color: '#ec4899', href: '/funnels' },
                        { icon: <Clock size={15} />, label: 'Histórico', color: '#06b6d4', href: '/marketing' },
                    ].map((action, i) => (
                        <a key={i} href={action.href} style={{
                            display: 'flex', alignItems: 'center', gap: '9px', padding: '11px 13px',
                            borderRadius: '11px', backgroundColor: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            color: '#cbd5e1', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none', cursor: 'pointer',
                            transition: 'all 0.15s',
                        }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.backgroundColor = `${action.color}18`;
                                (e.currentTarget as HTMLElement).style.borderColor = `${action.color}35`;
                                (e.currentTarget as HTMLElement).style.color = '#ffffff';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.04)';
                                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                                (e.currentTarget as HTMLElement).style.color = '#cbd5e1';
                            }}
                        >
                            <div style={{
                                width: '26px', height: '26px', borderRadius: '7px', flexShrink: 0,
                                backgroundColor: `${action.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: action.color
                            }}>
                                {action.icon}
                            </div>
                            {action.label}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

