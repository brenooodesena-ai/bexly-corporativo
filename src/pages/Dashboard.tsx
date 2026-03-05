import { Users, Target, CheckCircle2, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '../components/UI';

const Dashboard = () => {
    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Dashboard Overview</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Welcome back to your business command center.</p>
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
                    title="Active Clients"
                    value="124"
                    trend="+12%"
                    isUp={true}
                />
                <MetricCard
                    icon={<Target color="#8B5CF6" />}
                    title="New Leads"
                    value="48"
                    trend="+5%"
                    isUp={true}
                />
                <MetricCard
                    icon={<CheckCircle2 color="var(--success)" />}
                    title="Closed Deals"
                    value="18"
                    trend="-2%"
                    isUp={false}
                />
                <MetricCard
                    icon={<DollarSign color="#EC4899" />}
                    title="Revenue"
                    value="$12,450"
                    trend="+18%"
                    isUp={true}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Placeholder for Chart/Main Activity */}
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1.25rem' }}>Business Performance</h3>
                        <select style={{ background: 'none', border: '1px solid var(--border-color)', padding: '4px 12px', borderRadius: '8px' }}>
                            <option>Last 30 Days</option>
                            <option>Last 6 Months</option>
                        </select>
                    </div>
                    <div style={{ height: '300px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB', borderRadius: 'var(--radius)', border: '2px dashed var(--border-color)' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>Interactive Growth Chart Placeholder</p>
                    </div>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Recent Activity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <ActivityItem
                            user="John Doe"
                            action="Contract signed"
                            time="2h ago"
                            status="success"
                        />
                        <ActivityItem
                            user="Sarah Smith"
                            action="New lead inquiry"
                            time="4h ago"
                            status="info"
                        />
                        <ActivityItem
                            user="Tech Global"
                            action="Lead moved to Negotiation"
                            time="1d ago"
                            status="warning"
                        />
                        <ActivityItem
                            user="Mike Miller"
                            action="Meeting scheduled"
                            time="2d ago"
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
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
            </div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: isUp ? 'var(--success)' : 'var(--error)',
                fontSize: '0.875rem',
                fontWeight: 600
            }}>
                {isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {trend}
            </div>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{title}</p>
        <h2 style={{ fontSize: '1.75rem', color: 'var(--dark-blue)' }}>{value}</h2>
    </Card>
);

const ActivityItem = ({ user, action, time, status }: any) => {
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
                <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user} <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>{action}</span></p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{time}</p>
            </div>
        </div>
    );
};

export default Dashboard;
