import React from "react";
import { Modal, Box, Typography, List, ListItem, ListItemText, Divider } from "@mui/material";

// Estilo do Box que fica dentro do Modal
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 420,
    bgcolor: 'background.paper',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)', // Sombra mais leve
    p: 4,
    borderRadius: 0, // <-- Zerei as bordas para ficar totalmente reto
    outline: 'none',
};

export default function ModalNotificacao({ open, handleClose }) {
    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-notificacoes-title"
        >
            <Box sx={style}>
                <Typography
                    id="modal-notificacoes-title"
                    variant="h6"
                    component="h2"
                    sx={{ fontWeight: 'bold', mb: 2, fontFamily: 'Poppins, sans-serif' }}
                >
                    Notificações
                </Typography>

                {/* Lista de Notificações */}
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>

                    {/* Item 1 */}
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemText
                            primary="Nova vaga disponível"
                            secondary="Uma empresa de tecnologia acabou de postar uma vaga compatível com seu perfil."
                            primaryTypographyProps={{
                                fontWeight: '600',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '15px',
                                color: '#000'
                            }}
                            secondaryTypographyProps={{
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '13px',
                                color: '#666',
                                lineHeight: 1.5
                            }}
                        />
                    </ListItem>
                    <Divider component="li" sx={{ my: 1.5 }} />

                    {/* Item 2 */}
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemText
                            primary="Atualização no Projeto"
                            secondary="Seu projeto 3D foi avaliado com nota máxima pela equipe."
                            primaryTypographyProps={{
                                fontWeight: '600',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '15px',
                                color: '#000'
                            }}
                            secondaryTypographyProps={{
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '13px',
                                color: '#666',
                                lineHeight: 1.5
                            }}
                        />
                    </ListItem>
                    <Divider component="li" sx={{ my: 1.5 }} />

                    {/* Item 3 */}
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemText
                            primary="Mensagem de recrutador"
                            secondary="Você tem uma nova mensagem na sua caixa de entrada."
                            primaryTypographyProps={{
                                fontWeight: '600',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '15px',
                                color: '#000'
                            }}
                            secondaryTypographyProps={{
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '13px',
                                color: '#666',
                                lineHeight: 1.5
                            }}
                        />
                    </ListItem>

                </List>
            </Box>
        </Modal>
    );
}