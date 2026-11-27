import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Check, Camera, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import avatar1 from '../assets/avatars/avatar-1.jpg';
import avatar2 from '../assets/avatars/avatar-2.jpg';
import avatar3 from '../assets/avatars/avatar-3.jpg';
import avatar4 from '../assets/avatars/avatar-4.jpg';
import avatar5 from '../assets/avatars/avatar-5.jpg';
import avatar6 from '../assets/avatars/avatar-6.jpg';
import avatar7 from '../assets/avatars/avatar-7.jpg';
import avatar8 from '../assets/avatars/avatar-8.jpg';

export const BEXLY_AVATARS = [
    { id: 'av1', label: 'Cacheada', src: avatar1 },
    { id: 'av2', label: 'Jovem', src: avatar2 },
    { id: 'av3', label: 'Barba & Careca', src: avatar3 },
    { id: 'av4', label: 'Óculos', src: avatar4 },
    { id: 'av5', label: 'Ondulado', src: avatar5 },
    { id: 'av6', label: 'Barba Estilo', src: avatar6 },
    { id: 'av7', label: 'Careca', src: avatar7 },
    { id: 'av8', label: 'Crespo', src: avatar8 },
];

interface AvatarPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({ isOpen, onClose }) => {
    const { user, updateAvatar } = useAuth();
    const currentAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '';

    const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setUploadError('Por favor selecione uma imagem válida (PNG, JPG, WEBP).');
            return;
        }

        if (file.size > 8 * 1024 * 1024) {
            setUploadError('A imagem deve ter no máximo 8MB.');
            return;
        }

        setUploadError(null);
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Otimiza via canvas para manter a performance e dimensões quadradas
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const size = 380;
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    const minDim = Math.min(img.width, img.height);
                    const sx = (img.width - minDim) / 2;
                    const sy = (img.height - minDim) / 2;
                    ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
                    const compressed = canvas.toDataURL('image/jpeg', 0.88);
                    setSelectedAvatar(compressed);
                } else {
                    setSelectedAvatar(result);
                }
            };
            img.src = result;
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (!selectedAvatar) return;
        setIsSaving(true);
        await updateAvatar(selectedAvatar);
        setIsSaving(false);
        onClose();
    };

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(2, 6, 23, 0.75)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px'
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: 14 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: 14 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    style={{
                        width: '100%',
                        maxWidth: '520px',
                        background: 'linear-gradient(180deg, rgba(24, 28, 40, 0.95) 0%, rgba(13, 16, 24, 0.98) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '28px',
                        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                        padding: '28px',
                        color: '#ffffff',
                        position: 'relative',
                        boxSizing: 'border-box'
                    }}
                >
                    {/* Botão fechar */}
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'rgba(255, 255, 255, 0.65)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; }}
                    >
                        <X size={16} />
                    </button>

                    {/* Cabeçalho */}
                    <div style={{ marginBottom: '22px' }}>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
                            Escolha sua Foto de Perfil
                        </h2>
                        <p style={{ fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.55)', margin: 0 }}>
                            Escolha um dos avatares 3D oficiais da Bexly ou envie uma foto da sua galeria.
                        </p>
                    </div>

                    {/* Pré-visualização da Foto Selecionada */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '18px',
                        padding: '16px',
                        borderRadius: '20px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                        marginBottom: '22px'
                    }}>
                        <div style={{ position: 'relative' }}>
                            {selectedAvatar ? (
                                <img
                                    src={selectedAvatar}
                                    alt="Pré-visualização"
                                    style={{
                                        width: '68px',
                                        height: '68px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '3px solid #0066FF',
                                        boxShadow: '0 0 20px rgba(0, 102, 255, 0.4)'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '68px',
                                    height: '68px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    fontWeight: 700
                                }}>
                                    {user?.email?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                            <div style={{
                                position: 'absolute',
                                right: '-2px',
                                bottom: '-2px',
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                background: '#0066FF',
                                border: '2px solid #0f141e',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Check size={12} strokeWidth={3} color="#ffffff" />
                            </div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#ffffff' }}>
                                Foto selecionada
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '2px' }}>
                                Esta foto aparecerá no menu e no seu workspace.
                            </div>
                        </div>
                        {/* Botão de carregar da galeria */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '9px 14px',
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.14)',
                                borderRadius: '12px',
                                color: '#ffffff',
                                fontSize: '0.82rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
                        >
                            <Upload size={14} />
                            <span>Galeria</span>
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                    </div>

                    {uploadError && (
                        <div style={{
                            padding: '10px 14px',
                            background: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '10px',
                            color: '#fca5a5',
                            fontSize: '0.8rem',
                            marginBottom: '16px'
                        }}>
                            {uploadError}
                        </div>
                    )}

                    {/* Grade de Avatares Oficiais */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            color: 'rgba(255, 255, 255, 0.45)',
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <Camera size={13} />
                            <span>Avatares 3D Oficiais Bexly</span>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '12px',
                            maxHeight: '230px',
                            overflowY: 'auto',
                            padding: '4px'
                        }}>
                            {BEXLY_AVATARS.map((av) => {
                                const isSelected = selectedAvatar === av.src;
                                return (
                                    <motion.button
                                        key={av.id}
                                        type="button"
                                        whileHover={{ scale: 1.08 }}
                                        whileTap={{ scale: 0.94 }}
                                        onClick={() => setSelectedAvatar(av.src)}
                                        style={{
                                            position: 'relative',
                                            aspectRatio: '1/1',
                                            borderRadius: '50%',
                                            padding: 0,
                                            border: isSelected ? '3px solid #0066FF' : '2px solid rgba(255, 255, 255, 0.1)',
                                            background: '#0b0f19',
                                            cursor: 'pointer',
                                            overflow: 'hidden',
                                            boxShadow: isSelected ? '0 0 16px rgba(0, 102, 255, 0.55)' : 'none',
                                            transition: 'border 0.2s ease, box-shadow 0.2s ease'
                                        }}
                                    >
                                        <img
                                            src={av.src}
                                            alt={av.label}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: 'block'
                                            }}
                                        />
                                        {isSelected && (
                                            <div style={{
                                                position: 'absolute',
                                                inset: 0,
                                                background: 'rgba(0, 102, 255, 0.25)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '50%',
                                                    background: '#ffffff',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Check size={14} color="#0066FF" strokeWidth={3} />
                                                </div>
                                            </div>
                                        )}
                                    </motion.button>
                                );
                            })}

                            {/* Card para escolher da galeria diretamente na grade */}
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.94 }}
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    aspectRatio: '1/1',
                                    borderRadius: '50%',
                                    border: '2px dashed rgba(255, 255, 255, 0.2)',
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'rgba(255, 255, 255, 0.65)',
                                    cursor: 'pointer',
                                    gap: '4px',
                                    padding: 0
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0066FF'; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)'; }}
                            >
                                <ImageIcon size={20} />
                                <span style={{ fontSize: '0.62rem', fontWeight: 600 }}>Sua Foto</span>
                            </motion.button>
                        </div>
                    </div>

                    {/* Botões de Ação */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            style={{
                                padding: '11px 20px',
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                color: '#ffffff',
                                fontSize: '0.86rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'background 0.2s ease'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving || !selectedAvatar}
                            style={{
                                padding: '11px 24px',
                                background: '#0066FF',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#ffffff',
                                fontSize: '0.86rem',
                                fontWeight: 600,
                                cursor: isSaving ? 'not-allowed' : 'pointer',
                                boxShadow: '0 6px 18px rgba(0, 102, 255, 0.4)',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseEnter={(e) => { if (!isSaving) e.currentTarget.style.background = '#1a75ff'; }}
                            onMouseLeave={(e) => { if (!isSaving) e.currentTarget.style.background = '#0066FF'; }}
                        >
                            {isSaving ? 'Salvando...' : 'Salvar Foto de Perfil'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
