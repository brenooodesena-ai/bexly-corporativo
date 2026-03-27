import { useState } from 'react';
import { Card, Button } from '../components/UI';
import { Plus, GripVertical, MoreHorizontal, Calendar } from 'lucide-react';

interface Lead {
    id: string;
    title: string;
    company: string;
    value: string;
    date: string;
}

interface Column {
    id: string;
    title: string;
    leads: Lead[];
}

const Leads = () => {
    const [columns] = useState<Column[]>([
        {
            id: 'new',
            title: 'Novo Lead',
            leads: [
                { id: 'L1', title: 'ERP Implementation', company: 'Global Corp', value: '$5,000', date: 'Mar 10' },
                { id: 'L2', title: 'UI/UX Redesign', company: 'Startup Inc', value: '$3,200', date: 'Mar 12' },
            ]
        },
        {
            id: 'contacted',
            title: 'Contatado',
            leads: [
                { id: 'L3', title: 'Cloud Migration', company: 'Tech Hub', value: '$12,000', date: 'Mar 08' },
            ]
        },
        {
            id: 'negotiation',
            title: 'Negociação',
            leads: [
                { id: 'L4', title: 'Consultancy Retainer', company: 'Blue Chip', value: '$2,500/mo', date: 'Mar 05' },
                { id: 'L5', title: 'Mobile App Dev', company: 'Innovate LLC', value: '$8,500', date: 'Mar 01' },
            ]
        },
        {
            id: 'closed',
            title: 'Negócio Fechado',
            leads: [
                { id: 'L6', title: 'Web Platform', company: 'Omega Group', value: '$15,000', date: 'Feb 25' },
            ]
        }
    ]);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Pipeline de Vendas</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Acompanhe e gerencie seus leads através do funil de vendas.</p>
                </div>
                <Button>
                    <Plus size={20} /> Criar Novo Lead
                </Button>
            </div>

            <div style={{
                display: 'flex',
                gap: '24px',
                overflowX: 'auto',
                paddingBottom: '20px',
                minHeight: 'calc(100vh - 250px)'
            }}>
                {columns.map(column => (
                    <div key={column.id} style={{
                        minWidth: '300px',
                        width: '300px',
                        backgroundColor: 'var(--nav-hover)', // Adaptive background for the column
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-gray)' }}>
                                {column.title} <span style={{ marginLeft: '8px', color: 'var(--text-secondary)', fontWeight: 400 }}>{column.leads.length}</span>
                            </h3>
                            <button style={{ background: 'none', color: 'var(--text-secondary)' }}><Plus size={16} /></button>
                        </div>

                        <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {column.leads.map(lead => (
                                <Card key={lead.id} style={{ padding: '16px', cursor: 'grab' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <GripVertical size={16} color="var(--border-color)" />
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{lead.company}</span>
                                        </div>
                                        <button style={{ background: 'none', color: 'var(--text-secondary)' }}><MoreHorizontal size={16} /></button>
                                    </div>

                                    <h4 style={{ fontSize: '0.85rem', marginBottom: '12px', color: 'var(--heading-color)' }}>{lead.title}</h4>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                        <span style={{ fontWeight: 600, color: 'var(--primary-blue)', fontSize: '0.8rem' }}>{lead.value}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                            <Calendar size={14} /> {lead.date}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leads;
