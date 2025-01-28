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
        User user = User.builder()
                .id("1")
                .username("admin")
                .password("admin")
                .email("admin@adminish.com")
                .roles("ROLE_ADMIN")
                .build();

        userService.createUser(user);

        user = User.builder()
                .id("2")
                .username("Anna")
                .password("anna")
                .email("anna@normalna.com")
                .roles("USER")
                .build();

        userService.createUser(user);

        user = User.builder()
                .id("3")
                .username("Adam")
                .password("adam")
                .email("adam@normalny.com")
                .roles("USER")
                .build();

        userService.createUser(user);
    }

    private void initializeCards() throws Exception {
        String filePath = "/cards.txt";

        try (InputStream inputStream = getClass().getResourceAsStream(filePath)) {
            if (inputStream == null) {
                throw new IOException("File not found.");
            }

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
                List<String> names = reader.lines().collect(Collectors.toList());

                for (String name : names) {
                    Card card = Card.builder()
                            .name(name)
                            .build();

                    cardService.createCard(card);
                }
            } catch (IOException e) {
            }
        } catch (IOException e) {
        }
    }

}
