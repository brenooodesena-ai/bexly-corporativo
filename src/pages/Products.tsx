import { Package, TrendingUp, Plus, Search, Filter } from 'lucide-react';

const Products = () => {
    const products = [
        { id: 1, name: 'Mentoria Elite AI', price: 'R$ 997,00', sales: 45, revenue: 'R$ 44.865,00', stock: 'Infinito' },
        { id: 2, name: 'Bexly Platform - Pro Plan', price: 'R$ 197,00/mês', sales: 128, revenue: 'R$ 25.216,00', stock: 'Infinito' },
        { id: 3, name: 'E-book: Escala 10x', price: 'R$ 47,00', sales: 312, revenue: 'R$ 14.664,00', stock: 'Infinito' },
    ];

    return (
        <div style={{ color: 'var(--text-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>Meus Produtos</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Gerencie seus infoprodutos e ofertas.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Filter size={18} />
                        Filtros
                    </button>
                    <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={20} />
                        Novo Produto
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
                <div className="card" style={{ padding: '24px' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '4px' }}>Faturamento Total</p>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>R$ 84.745,00</h2>
                    <div style={{ color: '#22c55e', fontSize: '0.75rem', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TrendingUp size={14} />
                        <span>+12.5% este mês</span>
                    </div>
                </div>
                <div className="card" style={{ padding: '24px' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '4px' }}>Vendas Totais</p>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>485</h2>
                    <p style={{ color: 'var(--text-gray)', fontSize: '0.75rem', marginTop: '8px' }}>Processadas hoje: 12</p>
                </div>
                <div className="card" style={{ padding: '24px' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '4px' }}>Ticket Médio</p>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>R$ 174,73</h2>
                    <p style={{ color: 'var(--text-gray)', fontSize: '0.75rem', marginTop: '8px' }}>Otimizado há 2 dias</p>
                </div>
            </div>

            <div className="card" style={{ padding: '0' }}>
                <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '8px 16px', borderRadius: '12px', width: '300px', backgroundColor: 'var(--nav-hover)' }}>
                        <Search size={16} />
                        <input type="text" placeholder="Buscar produto..." style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }} />
                    </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: 'var(--nav-hover)' }}>
                        <tr>
                            <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>PRODUTO</th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>PREÇO</th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>VENDAS</th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>RECEITA</th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>ESTOQUE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ padding: '8px', backgroundColor: 'var(--nav-hover)', borderRadius: '8px', color: 'var(--primary-blue)' }}>
                                            <Package size={18} />
                                        </div>
                                        <span style={{ fontWeight: 500 }}>{product.name}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>{product.price}</td>
                                <td style={{ padding: '16px 24px' }}>{product.sales}</td>
                                <td style={{ padding: '16px 24px', color: '#22c55e', fontWeight: 600 }}>{product.revenue}</td>
                                <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{product.stock}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Products;
