import { FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#e2e8f0', padding: '60px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '840px', margin: '0 auto', background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '48px', backdropFilter: 'blur(20px)' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a78bfa', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600, marginBottom: '28px' }}>
          <ArrowLeft size={16} /> Voltar para o início
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={24} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>Termos de Serviço — Bexly</h1>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '32px' }}>Última atualização: Novembro de 2026</p>

        <section style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '10px' }}>1. Aceitação dos Termos</h2>
          <p style={{ color: '#cbd5e1', lineHeight: '1.7', fontSize: '0.95rem' }}>
            Ao acessar ou utilizar a plataforma Bexly, você concorda em cumprir e estar vinculado a estes Termos de Serviço e a todas as diretrizes aplicáveis da Meta Platforms, Inc.
          </p>
        </section>

        <section style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '10px' }}>2. Uso Adequado das Automações</h2>
          <p style={{ color: '#cbd5e1', lineHeight: '1.7', fontSize: '0.95rem' }}>
            A Bexly fornece ferramentas para automação de mensagens e respostas a comentários no Instagram. O usuário compromete-se a:
          </p>
          <ul style={{ color: '#cbd5e1', lineHeight: '1.8', fontSize: '0.95rem', paddingLeft: '20px' }}>
            <li>Não enviar spam, conteúdos ofensivos ou mensagens em massa não solicitadas.</li>
            <li>Respeitar as políticas de uso comercial da Meta e os limites de envio de mensagens estabelecidos pela Graph API.</li>
            <li>Utilizar as automações exclusivamente em contas comerciais e perfis profissionais sob sua titularidade ou autorização expressa.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '10px' }}>3. Disponibilidade e Isenção</h2>
          <p style={{ color: '#cbd5e1', lineHeight: '1.7', fontSize: '0.95rem' }}>
            A plataforma Bexly esforça-se para manter 99.9% de disponibilidade. No entanto, interrupções temporárias decorrentes de manutenção ou indisponibilidade dos serviços da Meta Platforms estão fora do controle direto da Bexly.
          </p>
        </section>

        <section style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '10px' }}>4. Contato</h2>
          <p style={{ color: '#cbd5e1', lineHeight: '1.7', fontSize: '0.95rem' }}>
            Dúvidas ou solicitações relacionadas a estes Termos podem ser encaminhadas para <strong>suporte@bexly.com.br</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
