import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, User, Mail, Shield, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AvatarPickerModal, BEXLY_AVATARS } from '../components/AvatarPickerModal';

const Settings: React.FC = () => {
    const { user, dbUser, isAdmin, updateAvatar } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [savedNotice, setSavedNotice] = useState(false);

    const displayName = user?.user_metadata?.full_name || dbUser?.name || (isAdmin ? 'Breno Silva' : user?.email?.split('@')[0] || 'Usuário');
    const displayEmail = user?.email || '';
    const displayRole = isAdmin ? 'Administrador' : 'Workspace Individual';
    const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
    const initials = displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p: string) => p[0]?.toUpperCase())
        .join('') || 'US';

    const handleSelectAvatar = async (src: string) => {
        await updateAvatar(src);
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 2500);
    };

    return (
        <div style={{ maxWidth: '960px', margin: '0 auto', color: '#ffffff' }}>
            {/* Cabeçalho da Página */}
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.4px' }}>
                    Configurações do Perfil
                </h1>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.55)', margin: 0 }}>
                    Personalize sua foto de perfil, dados de conta e preferências do workspace.
                </p>
            </div>

            {/* Aviso de Sucesso */}
            {savedNotice && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    style={{
                        padding: '12px 18px',
                        background: 'rgba(34, 197, 94, 0.15)',
                        border: '1px solid rgba(34, 197, 94, 0.35)',
                        borderRadius: '14px',
                        color: '#4ade80',
                        fontSize: '0.86rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '20px'
                    }}
                >
                    <Check size={18} strokeWidth={2.5} />
                    <span>Foto de perfil atualizada com sucesso em todo o sistema!</span>
                </motion.div>
            )}

            {/* Card Principal: Foto de Perfil */}
            <div style={{
                background: 'linear-gradient(180deg, rgba(24, 28, 40, 0.75) 0%, rgba(13, 16, 24, 0.82) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '32px',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6)',
                marginBottom: '24px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    flexWrap: 'wrap',
                    paddingBottom: '28px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                    {/* Foto Atual com Botão de Edição */}
                    <div
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            position: 'relative',
                            cursor: 'pointer',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            width: '100px',
                            height: '100px',
                            flexShrink: 0,
                            boxShadow: '0 8px 24px rgba(0, 102, 255, 0.3)',
                            border: '3px solid #0066FF'
                        }}
                        className="avatar-hover-wrap"
                    >
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={displayName}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                        ) : (
                            <div style={{
                                width: '100%',
                                height: '100%',
                                background: isAdmin ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                fontWeight: 700,
                                color: '#fff'
                            }}>
                                {initials}
                            </div>
                        )}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.55)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                            color: '#fff'
                        }}
                        className="avatar-hover-overlay"
                        >
                            <Camera size={22} />
                            <span style={{ fontSize: '0.66rem', fontWeight: 600, marginTop: '2px' }}>Alterar</span>
                        </div>
                    </div>

                    {/* Informações do Perfil */}
                    <div style={{ flex: 1, minWidth: '220px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, letterSpacing: '-0.3px' }}>
                                {displayName}
                            </h2>
                            <span style={{
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                padding: '3px 9px',
                                borderRadius: '999px',
                                background: isAdmin ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                                color: isAdmin ? '#60a5fa' : 'rgba(255, 255, 255, 0.7)',
                                border: isAdmin ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255, 255, 255, 0.12)'
                            }}>
                                {displayRole}
                            </span>
                        </div>
                        <p style={{ fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.55)', margin: '4px 0 16px 0' }}>
                            {displayEmail}
                        </p>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '9px 16px',
                                    background: '#0066FF',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: '#ffffff',
                                    fontSize: '0.84rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 14px rgba(0, 102, 255, 0.35)',
                                    transition: 'background 0.2s ease'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#1a75ff'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = '#0066FF'; }}
                            >
                                <Camera size={15} />
                                <span>Mudar Foto de Perfil</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Seletor Rápido de Avatares Oficiais 3D Bexly */}
                <div style={{ paddingTop: '24px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '16px'
                    }}>
                        <div>
                            <div style={{
                                fontSize: '0.92rem',
                                fontWeight: 600,
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <Sparkles size={16} color="#0066FF" />
                                <span>Avatares 3D Oficiais da Bexly</span>
                            </div>
                            <p style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.5)', margin: '2px 0 0 0' }}>
                                Clique em qualquer um para aplicar instantaneamente ao seu perfil:
                            </p>
                        </div>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))',
                        gap: '14px',
                        alignItems: 'center'
                    }}>
                        {BEXLY_AVATARS.map((av) => {
                            const isSelected = avatarUrl === av.src;
                            return (
                                <motion.button
                                    key={av.id}
                                    type="button"
                                    whileHover={{ scale: 1.12 }}
                                    whileTap={{ scale: 0.94 }}
                                    onClick={() => handleSelectAvatar(av.src)}
                                    title={av.label}
                                    style={{
                                        position: 'relative',
                                        width: '100%',
                                        aspectRatio: '1/1',
                                        borderRadius: '50%',
                                        padding: 0,
                                        border: isSelected ? '3px solid #0066FF' : '2px solid rgba(255, 255, 255, 0.1)',
                                        background: '#0b0f19',
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        boxShadow: isSelected ? '0 0 16px rgba(0, 102, 255, 0.6)' : 'none',
                                        transition: 'border 0.2s ease, box-shadow 0.2s ease'
                                    }}
                                >
                                    <img
                                        src={av.src}
                                        alt={av.label}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                    />
                                    {isSelected && (
                                        <div style={{
                                            position: 'absolute',
                                            right: '4px',
                                            bottom: '4px',
                                            width: '18px',
                                            height: '18px',
                                            borderRadius: '50%',
                                            background: '#0066FF',
                                            border: '2px solid #0f141e',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Check size={10} color="#ffffff" strokeWidth={3} />
                                        </div>
                                    )}
                                </motion.button>
                            );
                        })}

                        {/* Botão de Envio de Foto da Galeria */}
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.12 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => setIsModalOpen(true)}
                            title="Enviar da Galeria"
                            style={{
                                width: '100%',
                                aspectRatio: '1/1',
                                borderRadius: '50%',
                                border: '2px dashed rgba(255, 255, 255, 0.22)',
                                background: 'rgba(255, 255, 255, 0.04)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'rgba(255, 255, 255, 0.7)',
                                cursor: 'pointer',
                                gap: '4px',
                                padding: 0
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0066FF'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.22)'; e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'; }}
                        >
                            <Upload size={18} />
                            <span style={{ fontSize: '0.62rem', fontWeight: 600 }}>Galeria</span>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Card Secundário: Detalhes da Conta */}
            <div style={{
                background: 'linear-gradient(180deg, rgba(24, 28, 40, 0.75) 0%, rgba(13, 16, 24, 0.82) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '28px 32px',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6)'
            }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 18px 0', letterSpacing: '-0.3px' }}>
                    Informações da Conta
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    <div style={{
                        padding: '16px 20px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                        borderRadius: '16px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.78rem', marginBottom: '6px' }}>
                            <User size={14} />
                            <span>Nome de Exibição</span>
                        </div>
                        <div style={{ fontSize: '0.94rem', fontWeight: 600, color: '#ffffff' }}>
                            {displayName}
                        </div>
                    </div>

                    <div style={{
                        padding: '16px 20px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                        borderRadius: '16px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.78rem', marginBottom: '6px' }}>
                            <Mail size={14} />
                            <span>E-mail Vinculado</span>
                        </div>
                        <div style={{ fontSize: '0.94rem', fontWeight: 600, color: '#ffffff' }}>
                            {displayEmail}
                        </div>
                    </div>

                    <div style={{
                        padding: '16px 20px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                        borderRadius: '16px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.78rem', marginBottom: '6px' }}>
                            <Shield size={14} />
                            <span>Função no Workspace</span>
                        </div>
                        <div style={{ fontSize: '0.94rem', fontWeight: 600, color: '#ffffff' }}>
                            {displayRole}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Escolha de Avatar */}
            <AvatarPickerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            <style>{`
                .avatar-hover-wrap:hover .avatar-hover-overlay {
                    opacity: 1 !important;
                }
            `}</style>
        </div>
    );
};

export default Settings;
