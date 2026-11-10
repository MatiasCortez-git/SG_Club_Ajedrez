package com.clubajedrez.backend.repositories;

import com.clubajedrez.backend.entities.Puzzle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PuzzleRepository extends JpaRepository<Puzzle, String> {

    @Query(value = "SELECT * FROM puzzles WHERE themes LIKE %:tema% ORDER BY RANDOM() LIMIT :cantidad", nativeQuery = true)
    List<Puzzle> findRandomPuzzlesByTheme(@Param("tema") String tema, @Param("cantidad") int cantidad);
}