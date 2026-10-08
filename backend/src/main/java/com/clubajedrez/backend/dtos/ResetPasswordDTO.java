package com.clubajedrez.backend.dtos;

import lombok.Data;

@Data
public class ResetPasswordDTO {
    private String token;
    private String nuevaPassword;
}