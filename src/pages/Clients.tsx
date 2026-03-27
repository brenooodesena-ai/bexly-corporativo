import { useState } from 'react';
import { Card, Button } from '../components/UI';
import { Plus, Search, MoreVertical, Mail, Phone, ExternalLink } from 'lucide-react';

interface Client {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    status: 'Ativo' | 'Inativo' | 'Pendente';
}

const Clients = () => {
    const [clients] = useState<Client[]>([
        { id: '1', name: 'John Doe', company: 'Tech Global', email: 'john@techglobal.com', phone: '+1 (555) 123-4567', status: 'Ativo' },
        { id: '2', name: 'Sarah Smith', company: 'Creative Solutions', email: 'sarah@creative.io', phone: '+1 (555) 987-6543', status: 'Ativo' },
        { id: '3', name: 'Mike Miller', company: 'Fast Logistics', email: 'mike@fastlog.com', phone: '+1 (555) 456-7890', status: 'Pendente' },
        { id: '4', name: 'Emma Wilson', company: 'Wilson & Co', email: 'emma@wilson.com', phone: '+1 (555) 234-5678', status: 'Inativo' },
    ]);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Gestão de Clientes</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Gerencie e acompanhe seus relacionamentos comerciais.</p>
                </div>
                <Button>
                    <Plus size={20} /> Adicionar Novo Cliente
                </Button>
            </div>

            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', backgroundColor: 'var(--nav-hover)', padding: '8px 16px', borderRadius: '40px', width: '300px', border: '1px solid var(--border-color)' }}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Filtrar clientes..."
                            style={{ background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: '0.8rem' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button variant="secondary" style={{ padding: '8px 16px' }}>Exportar CSV</Button>
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: 'var(--nav-hover)', borderBottom: '1px solid var(--border-color)' }}>
                        <tr>
                            <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Cliente</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Contato</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map(client => (
                            <tr key={client.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--nav-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--light-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-blue)', fontWeight: 600 }}>
                                            {client.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{client.name}</p>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{client.company}</p>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-gray)' }}>
                                            <Mail size={14} /> {client.email}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-gray)' }}>
                                            <Phone size={14} /> {client.phone}
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        backgroundColor: client.status === 'Ativo' ? 'rgba(16, 185, 129, 0.1)' : client.status === 'Pendente' ? 'rgba(245, 158, 11, 0.1)' : 'var(--nav-hover)',
                                        color: client.status === 'Ativo' ? 'var(--success)' : client.status === 'Pendente' ? 'var(--warning)' : 'var(--text-gray)'
                                    }}>
                                        {client.status}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', gap: '12px', color: 'var(--text-secondary)' }}>
                                        <button style={{ background: 'none' }}><ExternalLink size={18} /></button>
                                        <button style={{ background: 'none' }}><MoreVertical size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default Clients;
