import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

export default function InstagramCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      setStatus('error');
      setErrorMessage(errorDescription || 'Autorização cancelada ou recusada pelo usuário.');
      return;
    }

    if (!code) {
      setStatus('error');
      setErrorMessage('Nenhum código de autorização foi retornado pela Meta.');
      return;
    }

    async function handleExchange() {
      try {
        const res = await api.handleCallback(code!, state || undefined);
        if (res && res.success && res.account) {
          localStorage.setItem('bexly_ig_account', JSON.stringify(res.account));
          if (res.account.accessToken) {
            localStorage.setItem('bexly_meta_access_token', res.account.accessToken);
          }
          setStatus('success');
          setTimeout(() => {
            navigate('/marketing?connected=true');
          }, 1500);
          return;
        }
        throw new Error(res?.message || 'A Meta não retornou os dados da conta.');
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(
          err.response?.data?.message || err.message || 'Falha ao vincular conta oficial do Instagram com a Meta.'
        );
      }
    }

    handleExchange();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#07090E] flex items-center justify-center p-6 text-white">
      <div className="max-w-md w-full bg-[#0D111A] border border-white/10 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Glow background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

        {status === 'loading' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Conectando ao Instagram...</h2>
            <p className="text-sm text-gray-400">
              Estamos validando suas credenciais oficiais com a Meta e configurando seus webhooks com segurança.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">Conta conectada com sucesso!</h2>
            <p className="text-sm text-gray-400">
              Seu perfil profissional foi integrado. Redirecionando para o painel de automações...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">Erro na integração</h2>
            <p className="text-sm text-rose-300/90 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-left text-xs font-mono">
              {errorMessage}
            </p>
            <button
              onClick={() => navigate('/marketing')}
              className="w-full mt-4 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition"
            >
              Voltar para o Marketing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
