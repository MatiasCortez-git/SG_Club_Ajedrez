package com.clubajedrez.backend.services;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarCredenciales(String destinatario, String username, String passwordTemporal) {
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setFrom("tallergamedev40@gmail.com");
        mensaje.setTo(destinatario);
        mensaje.setSubject("Bienvenido al Sistema - Credenciales de Acceso");
        
        mensaje.setText("Hola,\n\n"
                + "Tu cuenta de usuario ha sido generada exitosamente en el sistema del Club de Ajedrez.\n\n"
                + "Aquí tienes tus credenciales de acceso:\n"
                + "Usuario: " + username + "\n"
                + "Contraseña temporal: " + passwordTemporal + "\n\n"
                + "Por favor, por motivos de seguridad, te recomendamos cambiar esta contraseña la primera vez que ingreses a tu perfil.\n\n"
                + "Saludos cordiales,\n"
                + "Administración del Club de Ajedrez.");

        mailSender.send(mensaje);
    }
}