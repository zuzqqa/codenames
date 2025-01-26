package org.example.codenames.gameState.repository;

import org.example.codenames.gameState.entity.GameState;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GameStateRepository extends MongoRepository<GameState, String> {
}
