package org.example.codenames.init;

import org.example.codenames.user.User;
import org.example.codenames.user.service.api.UserService;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class AppInitializer implements InitializingBean {

    private final UserService userService;

    @Autowired
    public AppInitializer(UserService userService) {
        this.userService = userService;
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        User user = User.builder()
                .id("1")
                .username("admin")
                .password("admin")
                .email("admin@adminish.com")
                .role("ADMIN")
                .build();

        userService.createUser(user);

        user = User.builder()
                .id("2")
                .username("Anna")
                .password("anna")
                .email("anna@normalna.com")
                .role("USER")
                .build();

        userService.createUser(user);

        user = User.builder()
                .id("3")
                .username("Adam")
                .password("adam")
                .email("adam@normalny.com")
                .role("USER")
                .build();

        userService.createUser(user);

        userService.createUser(user);
    }
}
