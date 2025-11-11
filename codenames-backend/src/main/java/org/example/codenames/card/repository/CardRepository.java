package org.example.codenames.card.repository;

import org.example.codenames.card.entity.Card;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CardRepository extends MongoRepository<Card, String> {
    @NonNull
    Optional<Card> findById(String id);
}
