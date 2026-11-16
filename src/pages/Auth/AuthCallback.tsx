import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { api } from '../../lib/api';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        const handleUserValidation = async (sessionUser: any) => {
          if (!sessionUser) return;

          const intent = sessionStorage.getItem('bexly_auth_intent') || 'login';
          sessionStorage.removeItem('bexly_auth_intent');

          const isAdminUser = sessionUser.email === 'brenooodesena@gmail.com';
          const isAccountRegistered = Boolean(sessionUser.user_metadata?.bexly_account_created) || isAdminUser;
          const createdAt = new Date(sessionUser.created_at).getTime();
          const now = Date.now();
          // Conta recém-criada neste exato OAuth (menos de 25 segundos atrás)
          const isBrandNewAccount = Math.abs(now - createdAt) < 25000;

          const saveUserLocally = (dbUserResult?: any) => {
            const fallbackUser = {
              id: sessionUser.id,
              email: sessionUser.email,
              name: sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'Usuário',
              role: isAdminUser ? 'admin' : 'user',
              organization_id: isAdminUser ? 'org_default' : `org_${sessionUser.id.slice(0, 12)}`,
            };
            const finalUser = dbUserResult?.user || fallbackUser;
            localStorage.setItem('bexly_current_user', JSON.stringify(finalUser));
          };

          if (intent === 'signup' || isAdminUser) {
            // Fluxo de Cadastro ou Admin: marcamos o usuário como registrado oficialmente e criamos seu tenant no banco
            await supabase.auth.updateUser({
              data: { bexly_account_created: true },
            }).catch(() => {});
            try {
              const res = await api.syncUser({
                id: sessionUser.id,
                email: sessionUser.email,
                name: sessionUser.user_metadata?.full_name,
              });
              saveUserLocally(res);
            } catch (err) {
              console.error('[AuthCallback] Erro ao sincronizar usuário no banco Bexly:', err);
              saveUserLocally();
            }
            if (isMounted) {
              navigate('/dashboard', { replace: true });
            }
          } else {
            // Fluxo de Login: Se o usuário NUNCA criou conta antes na Bexly
            if (isBrandNewAccount && !isAccountRegistered) {
              console.warn('[AuthCallback] Conta inexistente tentou login direto. Bloqueando.');
              await supabase.auth.signOut();
              if (isMounted) {
                navigate('/login?error=account_not_found', { replace: true });
              }
              return;
            }

            // Conta existente: sincroniza no banco e autoriza login
            try {
              const res = await api.syncUser({
                id: sessionUser.id,
                email: sessionUser.email,
                name: sessionUser.user_metadata?.full_name,
              });
              saveUserLocally(res);
            } catch (err) {
              console.error('[AuthCallback] Erro ao sincronizar usuário no banco Bexly:', err);
              saveUserLocally();
            }
            if (isMounted) {
              navigate('/dashboard', { replace: true });
            }
          }
        };

        if (data.session?.user) {
          await handleUserValidation(data.session.user);
          return;
        }

        // Se ainda não estiver carregado, escuta a mudança de estado
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
            subscription.unsubscribe();
            await handleUserValidation(session.user);
          }
        });

        // Timeout de fallback caso não autentique
        const timeout = setTimeout(() => {
          subscription.unsubscribe();
          if (isMounted) {
            setErrorMsg('Não foi possível confirmar o login com o Google. Redirecionando...');
            setTimeout(() => navigate('/login', { replace: true }), 2500);
          }
        }, 6000);

        return () => {
          clearTimeout(timeout);
          subscription.unsubscribe();
        };
      } catch (err: any) {
        console.error('[AuthCallback] Erro no callback de autenticação:', err);
        if (isMounted) {
          setErrorMsg(err.message || 'Erro durante a autenticação.');
          setTimeout(() => navigate('/login', { replace: true }), 3000);
        }
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#07090e',
      color: '#fff',
      padding: '24px',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        background: 'rgba(15, 23, 42, 0.65)',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        borderRadius: '24px',
        padding: '48px 40px',
        boxShadow: '0 0 50px -10px rgba(59, 130, 246, 0.25)',
        maxWidth: '420px',
        width: '100%',
        textAlign: 'center'
      }}>
        {errorMsg ? (
          <>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f87171',
              fontSize: '24px'
            }}>
              ✕
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f87171' }}>Falha na Autenticação</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5 }}>{errorMsg}</p>
          </>
        ) : (
          <>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '3px solid rgba(59, 130, 246, 0.2)',
              borderTopColor: '#60a5fa',
              animation: 'spin 1s linear infinite'
            }} />
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff' }}>Conectando com segurança...</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
              Finalizando sua autenticação na Bexly.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
