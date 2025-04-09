package org.example.codenames.card.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashMap;
import java.util.Map;

/**
 * Represents a Card entity stored in the "cards" collection.
 * Each card can have multiple translations in different languages.
 */
@Document(collection = "cards")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Card {
    /**
     * Unique identifier for the card.
     */
    @Id
    private String id;

    /**
     * A map storing card names in different languages.
     * The key represents the language code, and the value is the translated card name.
     */
    private Map<String, String> names = new HashMap<>();

    /**
     * Constructs a Card with a specified ID and initializes an empty names map.
     *
     * @param id the unique identifier of the card
     */
    public Card(String id) {
        this.id = id;
        this.names = new HashMap<>();
    }

    /**
     * Adds a translation for the card in a specified language.
     *
     * @param language the language code
     * @param name the translated name of the card
     */
    public void addTranslation(String language, String name) {
        names.put(language, name);
    }
}
