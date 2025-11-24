package org.example.codenames.integrationTests;

import org.example.codenames.card.entity.Card;
import org.example.codenames.card.repository.CardRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.shaded.com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class CardControllerTest extends AbstractIntegrationTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private MockMvc mvc;

    @Autowired
    private CardRepository cardRepository;


    @BeforeEach
    void clean() {
        cardRepository.deleteAll();
    }

    @Test
    public void addAndGetCard() throws Exception {
        Card c = new Card();
        c.setId("card-1");
        c.setNames(Map.of("en", "Alpha"));

        mvc.perform(post("/api/cards/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(c)))
                .andExpect(status().isOk());

        mvc.perform(get("/api/cards/card-1"))
                .andExpect(status().isOk());
    }

    @Test
    public void getCardsInLanguage_returnsList() throws Exception {
        Card c1 = new Card();
        c1.setId("c1");
        c1.setNames(Map.of("en", "One"));
        cardRepository.save(c1);

        mvc.perform(get("/api/cards/language")
                        .param("lang", "en"))
                .andExpect(status().isOk());
    }
}
