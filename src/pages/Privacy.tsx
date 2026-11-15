import { Shield, Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#e2e8f0', padding: '60px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '840px', margin: '0 auto', background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '24px', padding: '48px', backdropFilter: 'blur(20px)' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#a78bfa', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600, marginBottom: '28px' }}>
          <ArrowLeft size={16} /> Voltar para o início
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #833ab4, #fd1d1d)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={24} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>Política de Privacidade — Bexly</h1>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '32px' }}>Última atualização: Novembro de 2026</p>

        <section style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '10px' }}>1. Introdução e Compromisso</h2>
          <p style={{ color: '#cbd5e1', lineHeight: '1.7', fontSize: '0.95rem' }}>
            A Bexly Tecnologia preza pela privacidade, segurança e transparência no tratamento dos dados dos seus usuários e clientes. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações ao utilizar nossa plataforma de automação e CRM integrado à Meta (Instagram Graph API).
          </p>
        </section>

        <section style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '10px' }}>2. Dados Coletados via Meta / Instagram API</h2>
          <p style={{ color: '#cbd5e1', lineHeight: '1.7', fontSize: '0.95rem' }}>
            Ao conectar sua conta comercial do Instagram à Bexly, solicitamos apenas as permissões estritamente necessárias para a execução das automações configuradas por você:
          </p>
          <ul style={{ color: '#cbd5e1', lineHeight: '1.8', fontSize: '0.95rem', paddingLeft: '20px' }}>
            <li><strong>instagram_basic:</strong> Leitura das informações públicas do perfil (nome de usuário, contagem de mídias e foto).</li>
            <li><strong>instagram_manage_comments:</strong> Detecção de comentários em publicações para disparo de respostas automáticas configuradas.</li>
            <li><strong>instagram_manage_messages:</strong> Envio de mensagens diretas (DMs) automáticas contendo links ou informações solicitadas pelo usuário final.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '10px' }}>3. Armazenamento e Criptografia</h2>
          <p style={{ color: '#cbd5e1', lineHeight: '1.7', fontSize: '0.95rem' }}>
            Todos os tokens de acesso gerados pela Meta são armazenados de forma criptografada (AES-256) em bancos de dados seguros e isolados por organização (multi-tenant). Nenhuma informação de acesso é compartilhada com terceiros.
          </p>
        </section>

        <section style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '10px' }}>4. Exclusão de Dados</h2>
          <p style={{ color: '#cbd5e1', lineHeight: '1.7', fontSize: '0.95rem' }}>
            O usuário pode desconectar sua conta do Instagram a qualquer momento no painel de Automação da Bexly. Ao desconectar, os tokens de acesso são revogados e excluídos imediatamente. Para solicitar a exclusão total dos seus dados cadastrais, envie um e-mail para <strong>contato@bexly.com.br</strong>.
          </p>
        </section>

        <div style={{ marginTop: '40px', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.04)', display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '0.85rem' }}>
          <Lock size={16} color="#10b981" />
          <span>Plataforma 100% em conformidade com as Diretrizes da Meta e a LGPD (Lei Geral de Proteção de Dados).</span>
        </div>
      </div>
    </div>
  );
}
