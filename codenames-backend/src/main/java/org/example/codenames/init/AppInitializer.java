package org.example.codenames.init;

import org.example.codenames.card.entity.Card;
import org.example.codenames.card.service.api.CardService;
import org.example.codenames.user.entity.User;
import org.example.codenames.user.service.api.UserService;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class AppInitializer implements InitializingBean {

    private final UserService userService;
    private final CardService cardService;

    @Autowired
    public AppInitializer(UserService userService, CardService cardService) {
        this.userService = userService;
        this.cardService = cardService;
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        initializeCards();
        initializeUsers();
    }

    private void initializeUsers() {
        createUser("1", "admin", "admin", "admin@adminish.com", "ROLE_ADMIN", "9ea9137e-1f73-4757-89dd-ed6bef039de2");
        createUser("2", "Anna", "anna", "anna@normalna.com", "USER", null);
        createUser("3", "Adam", "adam", "adam@normalny.com", "USER", null);
    }

    private void createUser(String id, String username, String password, String email, String roles, String resetId) {
        User user = User.builder()
                .id(id)
                .username(username)
                .password(password)
                .email(email)
                .resetId(resetId)
                .roles(roles)
                .build();
        userService.createUser(user);
    }

    private void initializeCards() throws IOException {
        loadCardsForLanguage("/cards_pl.txt", "/cards_en.txt");
    }

    private void loadCardsForLanguage(String plFilePath, String enFilePath) throws IOException {
        try (
                InputStream plInputStream = getClass().getResourceAsStream(plFilePath);
                InputStream enInputStream = getClass().getResourceAsStream(enFilePath)
        ) {
            if (plInputStream == null || enInputStream == null) {
                throw new IOException("Files not found: " + plFilePath + " or " + enFilePath);
            }

            try (
                    BufferedReader plReader = new BufferedReader(new InputStreamReader(plInputStream));
                    BufferedReader enReader = new BufferedReader(new InputStreamReader(enInputStream))
            ) {
                List<String> plCardNames = plReader.lines().collect(Collectors.toList());
                List<String> enCardNames = enReader.lines().collect(Collectors.toList());

                if (plCardNames.size() != enCardNames.size()) {
                    throw new IOException("Files do not have the same number of lines");
                }

                for (int i = 0; i < plCardNames.size(); i++) {
                    String plCardName = plCardNames.get(i);
                    String enCardName = enCardNames.get(i);

                    Optional<Card> existingCardOpt = cardService.getCardById(plCardName);
                    Card card = existingCardOpt.orElseGet(() -> {
                        Card newCard = new Card(plCardName);
                        cardService.createCard(newCard);
                        return newCard;
                    });

                    card.addTranslation("en", enCardName);
                    cardService.createCard(card);
                }
            }
        }
    }
}
