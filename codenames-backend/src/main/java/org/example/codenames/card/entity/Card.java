package org.example.codenames.card.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashMap;
import java.util.Map;

@Document(collection = "cards")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Card {

    @Id
    private String id;
    private Map<String, String> names = new HashMap<>();

    public Card(String id) {
        this.id = id;
        this.names = new HashMap<>();
    }

    public void addTranslation(String language, String name) {
        names.put(language, name);
    }
}
