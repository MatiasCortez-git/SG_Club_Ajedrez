package com.clubajedrez.backend.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "puzzles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Puzzle {

    @Id
    @Column(length = 20)
    private String id; 

    @Column(nullable = false, length = 150)
    private String fen; 

    @Column(nullable = false, length = 500)
    private String moves; 

    @Column(nullable = false)
    private Integer rating; 

    @Column(nullable = false, length = 500)
    private String themes; 
}