import { useState } from 'react';
import { useInstagramAutomation } from '../context/InstagramAutomationContext';
import type { NativeLead, LeadStatus } from '../types/instagramAutomation';
import {
    Target, Search, Clock, ChevronRight, X, CheckCircle2,
    Users, ArrowUpRight, DollarSign
} from 'lucide-react';

const STATUS_CONFIG: Record<LeadStatus, { label: string; bg: string; text: string; border: string }> = {
    'Novo': {
        label: 'Novo',
        bg: 'rgba(59, 130, 246, 0.12)',
        text: '#60a5fa',
        border: 'rgba(59, 130, 246, 0.25)'
    },
    'Contatado': {
        label: 'Contatado',
        bg: 'rgba(245, 158, 11, 0.12)',
        text: '#fbbf24',
        border: 'rgba(245, 158, 11, 0.25)'
    },
    'Qualificado': {
        label: 'Qualificado',
        bg: 'rgba(16, 185, 129, 0.12)',
        text: '#34d399',
        border: 'rgba(16, 185, 129, 0.25)'
    },
    'Oportunidade': {
        label: 'Oportunidade',
        bg: 'rgba(168, 85, 247, 0.12)',
        text: '#c084fc',
        border: 'rgba(168, 85, 247, 0.25)'
    },
    'Cliente': {
        label: 'Cliente (Venda)',
        bg: 'rgba(6, 182, 212, 0.12)',
        text: '#22d3ee',
        border: 'rgba(6, 182, 212, 0.25)'
    },
    'Perdido': {
        label: 'Perdido',
        bg: 'rgba(244, 63, 94, 0.12)',
        text: '#fb7185',
        border: 'rgba(244, 63, 94, 0.25)'
    }
};

export default function Leads() {
    const { leads, updateLeadStatus, addLeadNote } = useInstagramAutomation();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedLead, setSelectedLead] = useState<NativeLead | null>(null);
    const [newNote, setNewNote] = useState('');

    const filteredLeads = leads.filter(lead => {
        const matchesSearch =
            lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.instagramUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.triggerKeyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.campaign.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalLeads = leads.length;
    const qualifiedCount = leads.filter(l => l.status === 'Qualificado' || l.status === 'Oportunidade' || l.status === 'Cliente').length;
    const totalAttributed = leads.reduce((acc, l) => acc + (l.attributedValue || 0), 0);
    const clientsCount = leads.filter(l => l.status === 'Cliente').length;

    const handleSaveNote = () => {
        if (!selectedLead || !newNote.trim()) return;
        addLeadNote(selectedLead.id, newNote);
        setSelectedLead(prev => prev ? { ...prev, notes: newNote } : null);
        setNewNote('');
    };

    return (
        <div style={{
            color: '#f8fafc',
            maxWidth: '1280px',
            margin: '0 auto',
            paddingBottom: '70px',
            display: 'flex',
            flexDirection: 'column',
            gap: '28px',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}>
            {/* ── HEADER ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: '1 1 500px', minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                        <h1 style={{ fontSize: '1.65rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em', color: '#ffffff' }}>
                            Gerenciamento de Leads
                        </h1>
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: 'rgba(16, 185, 129, 0.12)',
                            color: '#10b981',
                            border: '1px solid rgba(16, 185, 129, 0.25)'
                        }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                            CRM Nativo Bexly
                        </span>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                        Base unificada de contatos capturados automaticamente pelas interações e palavras-chave do Instagram.
                    </p>
                </div>
            </div>

            {/* ── KPI METRICS BAR ── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px'
            }}>
                <div style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '20px',
                    backdropFilter: 'blur(16px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '12px' }}>
                        <span>Total de Leads</span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={16} color="#60a5fa" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>{totalLeads}</span>
                        <span style={{ fontSize: '0.75rem', color: '#10b981' }}>captura automática</span>
                    </div>
                </div>

                <div style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '20px',
                    backdropFilter: 'blur(16px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '12px' }}>
                        <span>Leads Qualificados</span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle2 size={16} color="#34d399" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>{qualifiedCount}</span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {totalLeads > 0 ? `${((qualifiedCount / totalLeads) * 100).toFixed(0)}% conversão` : '0%'}
                        </span>
                    </div>
                </div>

                <div style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '20px',
                    backdropFilter: 'blur(16px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '12px' }}>
                        <span>Clientes Convertidos</span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(6, 182, 212, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowUpRight size={16} color="#22d3ee" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>{clientsCount}</span>
                        <span style={{ fontSize: '0.75rem', color: '#22d3ee' }}>vendas diretas</span>
                    </div>
                </div>

                <div style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '20px',
                    backdropFilter: 'blur(16px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '12px' }}>
                        <span>Receita Atribuída</span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(168, 85, 247, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DollarSign size={16} color="#c084fc" />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#38bdf8', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
                            R$ {totalAttributed.toLocaleString('pt-BR')}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── FILTER & SEARCH BAR ── */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '12px 16px',
                borderRadius: '16px',
                backdropFilter: 'blur(12px)'
            }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: '1 1 300px', minWidth: '240px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por lead, @username, palavra-chave ou campanha..."
                        style={{
                            width: '100%',
                            padding: '9px 14px 9px 38px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(15, 23, 42, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            color: '#ffffff',
                            fontSize: '0.82rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {/* Filter Status Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                    {['all', 'Novo', 'Contatado', 'Qualificado', 'Oportunidade', 'Cliente', 'Perdido'].map((st) => {
                        const isActive = statusFilter === st;
                        return (
                            <button
                                key={st}
                                onClick={() => setStatusFilter(st)}
                                style={{
                                    padding: '7px 14px',
                                    borderRadius: '10px',
                                    fontSize: '0.78rem',
                                    fontWeight: isActive ? 600 : 500,
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer',
                                    border: isActive ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255, 255, 255, 0.06)',
                                    backgroundColor: isActive ? '#3b82f6' : 'rgba(255, 255, 255, 0.03)',
                                    color: isActive ? '#ffffff' : '#94a3b8',
                                    boxShadow: isActive ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                {st === 'all' ? 'Todos os Leads' : st}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── LEADS TABLE ── */}
            <div style={{
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: 'rgba(15, 23, 42, 0.7)',
                overflow: 'hidden',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                        <thead>
                            <tr style={{
                                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                color: '#64748b',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase'
                            }}>
                                <th style={{ padding: '16px 20px' }}>Lead</th>
                                <th style={{ padding: '16px' }}>Origem / Campanha</th>
                                <th style={{ padding: '16px' }}>Gatilho</th>
                                <th style={{ padding: '16px' }}>Status</th>
                                <th style={{ padding: '16px' }}>Última Interação</th>
                                <th style={{ padding: '16px 20px', textAlign: 'right' }}>Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                                        Nenhum lead encontrado com os filtros atuais.
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => {
                                    const statusInfo = STATUS_CONFIG[lead.status] || {
                                        label: lead.status,
                                        bg: 'rgba(255, 255, 255, 0.05)',
                                        text: '#94a3b8',
                                        border: 'rgba(255, 255, 255, 0.1)'
                                    };

                                    return (
                                        <tr
                                            key={lead.id}
                                            onClick={() => setSelectedLead(lead)}
                                            style={{
                                                borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.15s ease'
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)')}
                                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                        >
                                            {/* Lead Profile */}
                                            <td style={{ padding: '14px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <img
                                                        src={lead.profilePicUrl}
                                                        alt={lead.name}
                                                        style={{
                                                            width: '38px',
                                                            height: '38px',
                                                            borderRadius: '50%',
                                                            objectFit: 'cover',
                                                            border: '1px solid rgba(255, 255, 255, 0.1)'
                                                        }}
                                                    />
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.86rem' }}>
                                                            {lead.name}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
                                                            @{lead.instagramUsername}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Origin */}
                                            <td style={{ padding: '14px', color: '#cbd5e1' }}>
                                                <div style={{
                                                    maxWidth: '240px',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 500
                                                }}>
                                                    {lead.sourcePostTitle}
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                                                    {lead.campaign}
                                                </div>
                                            </td>

                                            {/* Keyword */}
                                            <td style={{ padding: '14px' }}>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '3px 8px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.74rem',
                                                    fontWeight: 700,
                                                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                    color: '#60a5fa',
                                                    border: '1px solid rgba(59, 130, 246, 0.2)'
                                                }}>
                                                    {lead.triggerKeyword}
                                                </span>
                                            </td>

                                            {/* Status Badge */}
                                            <td style={{ padding: '14px' }}>
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '5px',
                                                    padding: '3px 10px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.72rem',
                                                    fontWeight: 600,
                                                    backgroundColor: statusInfo.bg,
                                                    color: statusInfo.text,
                                                    border: `1px solid ${statusInfo.border}`
                                                }}>
                                                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: statusInfo.text }} />
                                                    {statusInfo.label}
                                                </span>
                                            </td>

                                            {/* Interaction date */}
                                            <td style={{ padding: '14px', color: '#94a3b8', fontSize: '0.76rem', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
                                                {new Date(lead.lastInteractionAt).toLocaleDateString('pt-BR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>

                                            {/* Action button */}
                                            <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                                                <div style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '8px',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                                    color: '#94a3b8'
                                                }}>
                                                    <ChevronRight size={14} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── DETAIL DRAWER (MODAL) ── */}
            {selectedLead && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 50,
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div style={{
                        backgroundColor: '#0b1120',
                        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                        width: '100%',
                        maxWidth: '500px',
                        height: '100%',
                        padding: '28px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px',
                        boxShadow: '-20px 0 50px rgba(0, 0, 0, 0.5)'
                    }}>
                        {/* Drawer Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '18px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <img
                                    src={selectedLead.profilePicUrl}
                                    alt={selectedLead.name}
                                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255, 255, 255, 0.15)' }}
                                />
                                <div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>{selectedLead.name}</h3>
                                    <p style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", margin: '2px 0 0' }}>@{selectedLead.instagramUsername}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedLead(null)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '10px',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#94a3b8',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Pipeline Stage Switcher */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
                                Estágio do Funil
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                {(['Novo', 'Contatado', 'Qualificado', 'Oportunidade', 'Cliente', 'Perdido'] as LeadStatus[]).map((st) => {
                                    const isCurrent = selectedLead.status === st;
                                    const info = STATUS_CONFIG[st];
                                    return (
                                        <button
                                            key={st}
                                            onClick={() => {
                                                updateLeadStatus(selectedLead.id, st);
                                                setSelectedLead(prev => prev ? { ...prev, status: st } : null);
                                            }}
                                            style={{
                                                padding: '8px 4px',
                                                borderRadius: '8px',
                                                fontSize: '0.75rem',
                                                fontWeight: isCurrent ? 700 : 500,
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                transition: 'all 0.15s',
                                                border: isCurrent ? `1px solid ${info.border}` : '1px solid rgba(255, 255, 255, 0.06)',
                                                backgroundColor: isCurrent ? info.bg : 'rgba(255, 255, 255, 0.02)',
                                                color: isCurrent ? info.text : '#94a3b8'
                                            }}
                                        >
                                            {st}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Attribution Breakdown Box */}
                        <div style={{
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            backgroundColor: 'rgba(15, 23, 42, 0.6)',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Target size={13} color="#10b981" />
                                Dados de Atribuição (Instagram)
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                                    <span>Campanha:</span>
                                    <span style={{ color: '#ffffff', fontWeight: 500 }}>{selectedLead.campaign}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                                    <span>Palavra-Chave:</span>
                                    <span style={{ color: '#60a5fa', fontWeight: 700, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>"{selectedLead.triggerKeyword}"</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                                    <span>Receita Atribuída:</span>
                                    <span style={{ color: '#38bdf8', fontWeight: 700, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
                                        R$ {(selectedLead.attributedValue || 0).toLocaleString('pt-BR')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Interaction Timeline */}
                        <div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                                <Clock size={13} />
                                Linha do Tempo de Interações
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: '8px', borderLeft: '2px solid rgba(255, 255, 255, 0.08)', marginLeft: '6px' }}>
                                {selectedLead.timeline.map((item, idx) => (
                                    <div key={idx} style={{ position: 'relative', paddingLeft: '16px' }}>
                                        <div style={{
                                            position: 'absolute',
                                            left: '-21px',
                                            top: '3px',
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: '#10b981',
                                            boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)'
                                        }} />
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>{item.timestamp}</div>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f1f5f9', marginTop: '2px' }}>{item.title}</div>
                                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px', lineHeight: 1.4 }}>{item.description}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Operator Notes */}
                        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '18px' }}>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                                Observações do Operador
                            </label>
                            <textarea
                                value={newNote || selectedLead.notes || ''}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Adicione notas de negociação ou informações do cliente..."
                                rows={3}
                                style={{
                                    width: '100%',
                                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '10px',
                                    padding: '10px 12px',
                                    color: '#ffffff',
                                    fontSize: '0.8rem',
                                    outline: 'none',
                                    resize: 'vertical',
                                    boxSizing: 'border-box'
                                }}
                            />
                            {newNote && (
                                <button
                                    onClick={handleSaveNote}
                                    style={{
                                        marginTop: '8px',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        backgroundColor: '#3b82f6',
                                        color: '#ffffff',
                                        fontSize: '0.78rem',
                                        fontWeight: 600,
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Salvar Nota
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
