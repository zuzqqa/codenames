package org.example.codenames.card.repository;

import org.example.codenames.card.entity.Card;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CardRepository extends MongoRepository<Card, String> {
    Optional<Card> findByName(String Name);
}
