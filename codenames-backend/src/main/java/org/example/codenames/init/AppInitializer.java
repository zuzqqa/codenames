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

/**
 * Initializes the application with some data.
 */
@Component
public class AppInitializer implements InitializingBean {
    /**
     * User service.
     */
    private final UserService userService;

    /**
     * Card service.
     */
    private final CardService cardService;

    /**
     * Constructor.
     *
     * @param userService User service.
     * @param cardService Card service.
     */
    @Autowired
    public AppInitializer(UserService userService, CardService cardService) {
        this.userService = userService;
        this.cardService = cardService;
    }

    /**
     * Initializes the application with some data.
     */
    @Override
    public void afterPropertiesSet() throws Exception {
        initializeCards();
        initializeUsers();
    }

    /**
     * Initializes users.
     */
    private void initializeUsers() {
        createUser("1", "admin", "admin", "admin@adminish.com", "ROLE_ADMIN");
        createUser("2", "Anna", "anna", "anna@normalna.com", "ROLE_USER");
        createUser("3", "Adam", "adam", "adam@normalny.com", "ROLE_USER");
    }

    /**
     * Creates a user.
     *
     * @param id User ID.
     * @param username Username.
     * @param password Password.
     * @param email Email.
     * @param roles Roles.
     */
    private void createUser(String id, String username, String password, String email, String roles) {
        User user = User.builder()
                .id(id)
                .username(username)
                .password(password)
                .email(email)
                .roles(roles)
                .build();
        userService.createUser(user);
    }

    /**
     * Initializes cards.
     */
    private void initializeCards() throws IOException {
        loadCardsForLanguage();
    }

    /**
     * Loads cards for a language.
     */
    private void loadCardsForLanguage() throws IOException {
        try (
                InputStream plInputStream = getClass().getResourceAsStream("/cards_pl.txt");
                InputStream enInputStream = getClass().getResourceAsStream("/cards_en.txt")
        ) {
            if (plInputStream == null || enInputStream == null) {
                throw new IOException("Files not found.");
            }

            try (
                    BufferedReader plReader = new BufferedReader(new InputStreamReader(plInputStream));
                    BufferedReader enReader = new BufferedReader(new InputStreamReader(enInputStream))
            ) {
                List<String> plCardNames = plReader.lines().toList();
                List<String> enCardNames = enReader.lines().toList();

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
