package org.example.codenames;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CodenamesApplication {
	public static void main(String[] args) {
		SpringApplication.run(CodenamesApplication.class, args);
	}
}
